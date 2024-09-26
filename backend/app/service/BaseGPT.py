import logging
from app.models.avatar import Avatar
from app.core.config import settings
from newspaper import Article
import xml.etree.ElementTree as ET
import urllib.parse
import httpx
from openai import OpenAI
from fastapi import HTTPException
from typing import Optional
class BaseGPT:
    """Общий класс для работы с текстом и API."""
    def __init__(self, avatar: Avatar, theme: str, key_words: str, len_article: str, model: str, goal: Optional[str] = None, is_global_role = False) -> None:
        self.avatar = avatar
        self.theme = theme
        self.key_words = key_words
        self.len_article = len_article
        self.model = model
        self.goal = goal  # Добавляем goal как параметр
        self.is_global_role = is_global_role
        
    def _get_text_from_url(self, url: str) -> str:
        """Загружает статью по URL и извлекает текст с помощью newspaper3k."""
        try:
            article = Article(url)
            article.download()
            article.parse()
            return article.text
        except Exception as e:
            return ""

    def _parse_yandex_xml_response(self, xml_response: str) -> dict:
        """Парсит XML ответ от Яндекса и возвращает результаты поиска."""
        root = ET.fromstring(xml_response)
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
        return {
            "search_results": search_results
        }

    async def _search_yandex(self) -> dict:
        """Выполняет поиск через Яндекс и возвращает результаты в виде словаря."""
        base_url = "https://yandex.ru/search/xml"
        params = {
            "folderid": settings.YANDEX_CATALOG_ID,
            "apikey": settings.YANDEX_API_KEY_SEARCH,
            "query": f'{self.theme} + {self.key_words}',
            "l10n": "ru",
            "sortby": "rlv",
            "filter": "strict",
            "maxpassages": "2",
            "groupby": "attr=d.mode=deep.groups-on-page=5.docs-in-group=3",
            "page": "2"
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                return self._parse_yandex_xml_response(response.text)
            except httpx.HTTPStatusError as e:
                return {"error": f"Ошибка при поиске: {e}"}

    def _build_prompt(self, context: list) -> list:
        """Создаёт промпт для модели на основе информации об аватаре."""
        model_role = f'''
        Ты — {self.avatar.name}, и твоя задача — писать статьи в соответствии с твоими личными характеристиками.
        Твоя биография: {self.avatar.description}.
        Твои любимые слова: {self.avatar.key_words}.
        Ты эксперт в области {self.avatar.domain}, и пишешь в {self.avatar.tone} стиле.
        Твоя задача — использовать свои знания и опыт, чтобы писать информативные и увлекательные статьи.
        '''
        # Включаем цель в промпт, если она есть
        goal_text = f"Цель создания статьи: {self.goal}. " if self.goal else ""
        
        return [
            {
                "role": "system",
                "content": model_role
            },
            *context,
            {
                "role": "system",
                "content": f"{goal_text}В этой статье ты должен использовать информацию о себе и контекст, чтобы создать качественный контент. Статья должна быть точной и хорошо структурированной."
            },
            {
                'role': 'user',
                'content': f'''Ты — высококвалифицированный контент-райтер и SEO-специалист, который свободно пишет на русском языке. 
                Напиши уникальную, SEO-оптимизированную статью на тему "{self.theme}", 
                используя ключевые слова "{self.avatar.key_words}". 
                Пиши статью своими словами, избегая копирования текста из других источников. Не стесняйся рассказывать истории по теме,
                главное чтобы структурно и интересно. 
                Заверши статью выводами и добавь 5 уникальных часто задаваемых вопросов (FAQ) в конце.'''
            }
        ]

    async def generate_article(self):
        """Генерирует статью с использованием OpenAI GPT-4o."""
        if not self.is_global_role:
            text_from_internet = await self._search_yandex()
            main_text = {}
            
            for idx, entry in enumerate(text_from_internet.get('search_results', [])):
                url = entry.get('url')
                if url:
                    text = self._get_text_from_url(url)
                    if text:
                        main_text[f'article_{idx}'] = text  # Сохраняем полный текст статьи

            context = [{'role': 'system', 'content': f"{article}\n\n"} for idx, article in main_text.items()]
        else:
            context = []
        PROMPT = self._build_prompt(context)

        try:
            client = OpenAI(
                api_key=settings.VSE_GPT_KEY,
                base_url="https://api.vsegpt.ru/v1",
            )
            response_big = client.chat.completions.create(
                model=f"openai/{self.model}",
                messages=PROMPT,
                temperature=0.7,
                n=1,
                max_tokens=self.len_article,
                extra_headers={"X-Title": "My App"},
            )
            response = response_big.choices[0].message.content
            return {'content': response}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка генерации статьи: {str(e)}")
