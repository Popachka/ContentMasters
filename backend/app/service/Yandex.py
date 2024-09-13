import logging
from app.models.avatar import Avatar
from app.core.config import settings
from newspaper import Article
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import xml.etree.ElementTree as ET
import urllib.parse
import json
import httpx
from fastapi import HTTPException
import requests
# Настройка логирования
logging.basicConfig(
    filename='app.log',  # Файл для логов
    level=logging.INFO,  # Уровень логирования
    format='%(asctime)s - %(levelname)s - %(message)s'  # Формат сообщения
)
logger = logging.getLogger(__name__)


class YandexGPT:
    def __init__(self, avatar: Avatar, theme: str, key_words: str, len_article: str) -> None:
        self.avatar = avatar
        self.theme = theme
        self.key_words = key_words
        self.len_article = len_article

    def _get_text_from_url(self, url: str) -> str:
        """Загружает статью по URL и извлекает текст с помощью newspaper3k."""
        logger.info(f"Attempting to fetch article from URL: {url}")
        try:
            article = Article(url)
            article.download()
            article.parse()
            logger.info(f"Successfully extracted text from {url}")
            return article.text
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return ""

    def _summarize_text(self, text: str, num_sentences: int = 3) -> str:
        """Суммаризирует текст с помощью sumy."""
        if not text:
            return ""
        parser = PlaintextParser.from_string(text, Tokenizer("russian"))
        summarizer = TextRankSummarizer()
        summary = summarizer(parser.document, num_sentences)
        logger.info(f"Text summarized to {num_sentences} sentences.")
        return ' '.join(str(sentence) for sentence in summary)

    def _parse_yandex_xml_response(self, xml_response: str) -> dict:
        """Парсит XML ответ от Яндекса и возвращает результаты поиска."""
        logger.info("Parsing Yandex XML response.")
        root = ET.fromstring(xml_response)
        found_results = root.find('.//found-human').text
        groups = root.findall('.//group')

        search_results = []
        for group in groups:
            for doc in group.findall('.//doc'):
                url = doc.find('.//url').text
                title = doc.find('.//title').text
                passages = [p.text for p in doc.findall('.//passage')]
                search_results.append({
                    "url": url,
                    "title": title,
                    "passages": passages
                })
        logger.info(f"Found {len(search_results)} search results.")
        return {
            "found_results": found_results,
            "search_results": search_results
        }

    async def _search_yandex(self) -> dict:
        """Выполняет поиск через Яндекс и возвращает результаты в виде словаря."""
        base_url = "https://yandex.ru/search/xml"
        params = {
            "folderid": settings.YANDEX_CATALOG_ID,  # Идентификатор каталога
            "apikey": settings.YANDEX_API_KEY_SEARCH,  # API-ключ
            "query": f'{self.theme} + {self.key_words}',  # Поисковый запрос
            "l10n": "ru",  # Язык
            "sortby": "rlv",  # Сортировка по релевантности
            "filter": "strict",  # Фильтрация
            "maxpassages": "2",  # Количество пассажей
            "groupby": "attr=d.mode=deep.groups-on-page=5.docs-in-group=3",
            "page": "2"  # Номер страницы
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"

        logger.info(f"Sending search request to Yandex with query: {self.theme} + {self.key_words}")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url)
                response.raise_for_status()  # Генерирует исключение при ошибке
                logger.info(f"Yandex search successful: {response.status_code}")
                return self._parse_yandex_xml_response(response.text)
            except httpx.HTTPStatusError as e:
                logger.error(f"Yandex search failed: {e.response.status_code} - {e.response.text}")
                return {"error": f"Ошибка при поиске: {e}"}

    async def generate_article(self):
        """Генерирует статью на основе данных из поисковых запросов."""
        MODEL_URI = f"gpt://{settings.YANDEX_CATALOG_ID}/yandexgpt-lite"
        COMPLETION_OPTIONS = {
            "stream": False,
            "temperature": 0.9,
            "maxTokens": "4096"
        }

        API_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        HEADERS = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {settings.YANDEX_API_KEY_MODELS}"
        }

        logger.info("Starting Yandex search for relevant content.")
        text_from_internet = await self._search_yandex()
        main_text = {}

        for idx, entry in enumerate(text_from_internet.get('search_results', [])):
            url = entry.get('url')
            if url:
                logger.info(f"Fetching text from URL: {url}")
                text = self._get_text_from_url(url)
                if text:
                    summary = self._summarize_text(text, 1)
                    main_text[f'summary_{idx}'] = summary
                    logger.info(f"Summarized text from {url}.")

        context = []
        for idx, summary in main_text.items():
            context.append({
                'role': 'system',
                'text': f"{summary}\n\n"
            })

        model_role = f'''
        Ты — {self.avatar.name}, и твоя задача — писать статьи в соответствии с твоими личными характеристиками.
        Твоя биография: {self.avatar.description}.
        Твои любимые слова: {self.avatar.key_words}.
        Ты эксперт в области {self.avatar.domain}, и пишешь в {self.avatar.tone} стиле.
        Твоя задача — использовать свои знания и опыт, чтобы писать информативные и увлекательные статьи.
        '''
        PROMPT = [
            {
                "role": "system",
                "text": model_role
            },
            *context,
            {
                "role": "system",
                "text": "В этой статье ты должен использовать информацию о себе и контекст, чтобы создать качественный контент. Статья должна быть точной и хорошо структурированной."
            },
            {
                'role': 'user',
                'text': f'Напиши статью на тему "{self.theme}". Длина статьи не должна превышать {self.len_article} слов. Структурируй её как статью для блога: введение, основные идеи и заключение. Убедись, что стиль соответствует твоему характеру. Не используй формат чата, пиши как законченный текст.'
            },
        ]
        print(json.dumps(PROMPT, indent=4, ensure_ascii=False))
        prompt_data = {
            "modelUri": MODEL_URI,
            "completionOptions": COMPLETION_OPTIONS,
            "messages": PROMPT
        }

        logger.info(
            "Sending request to Yandex GPT model for article generation.")
        try:
            response = requests.post(API_URL, headers=HEADERS, json=prompt_data)
            response.raise_for_status()  # Проверка на наличие ошибок HTTP
            result = response.json()
            logger.info("Article generation successful.")
            return result
        except requests.HTTPError as e:
            logger.error(f"Error during article generation: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code, detail=str(e))
        except requests.RequestException as e:
            logger.error(f"Request error during article generation: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Ошибка в генерации статьи: {str(e)}")