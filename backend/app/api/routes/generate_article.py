from fastapi import APIRouter, Depends, HTTPException
from app.models.avatar import Avatar
from app.models.article import ArticleCreate, ArticlePublic
from app.crud import create_article
from app.core.config import settings, russian_stop_words
import logging
from app.api.deps import (
    SessionDep,
    CurrentUser
)
from typing import Any, Optional
from pydantic import BaseModel
from app.service.BaseGPT import BaseGPT
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
# from nltk.corpus import stopwords
import pymorphy2

logging.basicConfig(filename='errors.log', level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
router = APIRouter()
# Инициализация лемматизатора для русского языка
morph = pymorphy2.MorphAnalyzer()

def lemmatize_text(text):
    """
    Лемматизация текста: приведение каждого слова к его базовой форме.
    :param text: str - текст для лемматизации
    :return: str - лемматизированный текст
    """
    words = text.split()
    lemmatized_words = [morph.parse(word)[0].normal_form for word in words]
    return ' '.join(lemmatized_words)
# Определение модели ответа
class ActiveModelsResponse(BaseModel):
    models: list[str]

@router.get('/active_models', response_model=ActiveModelsResponse)
def get_active_models() -> ActiveModelsResponse:
    return {'models': list(settings.ACTIVE_MODELS)}

@router.get('/generate', response_model=Optional[ArticlePublic])
async def generate(
    avatar_id: str, model: str,
    theme: str, key_words: str,
    cur_user: CurrentUser, session: SessionDep,
    len_article: int = 4096, goal: Optional[str] = None 
) -> Any:
    is_global_role = True if goal else False
    if len_article < 4096 or len_article > 120000:
        raise HTTPException(status_code=400,
                        detail='Длина статьи должна быть между 4096 и 120000 токенов')

    # Проверка на доступность модели
    if model not in settings.ACTIVE_MODELS:
        raise HTTPException(status_code=404,
                            detail=f'Модель {model} недоступна или не поддерживается')

    # Получение аватара из базы данных
    db_avatar = session.get(Avatar, avatar_id)
    if not db_avatar:
        raise HTTPException(status_code=404,
                            detail=f'Аватара с id {avatar_id} не существует')

    # Проверка прав доступа к аватару
    if not db_avatar.is_global and (not cur_user.is_superuser and db_avatar.owner_id != cur_user.id):
        raise HTTPException(
            status_code=403, detail='Нет доступа к этому аватару')

    # Логика для генерации статьи через YandexGPT-lite
    gpt = BaseGPT(
        avatar=db_avatar,
        theme=theme,
        key_words=key_words,
        len_article=len_article,
        model=model,
        goal=goal,
        is_global_role = is_global_role
    )

    result = await gpt.generate_article()
    if result['content']:
        generated_text = result["content"]

        # Создаем объект статьи для базы данных
        article_create = ArticleCreate(
            content=generated_text,
            name=theme  # Можно использовать тему как название статьи
        )
        # Сохраняем статью в базе данных
        created_article = create_article(
            session=session,  # предполагается, что сессия передана в функцию
            article_create=article_create,
            owner_id=cur_user.id  # использую owner_id из аватара
        )
        # Проверьте, что все обязательные поля заполнены
        article_public = ArticlePublic.model_validate(
            {
                "id": created_article.id,
                "content": created_article.content,
                "name": created_article.name
            }
        )
        return article_public
    else:
        return {"status": "error", "message": "Ошибка при генерации статьи."}



# Определяем модель данных для входящего запроса
class AnalyzeTextRequest(BaseModel):
    article_text: str
    top_n: int = 10

@router.post('/analyze_text')
def analyze_text(request: AnalyzeTextRequest):
    """
    Анализирует текст: выделяет ключевые слова с помощью TF-IDF, 
    подсчитывает количество символов и слов.
    
    :param request: An instance of AnalyzeTextRequest containing the article text and top_n.
    :return: dict - словарь с ключевыми словами и статистикой
    """
    
    # Предобработка текста: удаление символов и приведение к нижнему регистру
    clean_text = re.sub(r'\W+', ' ', request.article_text.lower())
    
    # Лемматизация текста (предполагается, что функция лемматизации определена)
    lemmatized_text = lemmatize_text(clean_text)  # Замените на свою лемматизацию

    # 1. Подсчет количества символов и слов
    num_characters = len(request.article_text)  # Количество символов в оригинальном тексте
    num_words = len(lemmatized_text.split())  # Количество слов

    # 2. Используем TfidfVectorizer для получения весов TF-IDF для каждого слова
    vectorizer = TfidfVectorizer(stop_words='russian')  # Убедитесь, что стоп-слова подходят для вашего случая
    tfidf_matrix = vectorizer.fit_transform([lemmatized_text])
    
    # Получаем слова и их веса
    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray().flatten()

    # Соединяем слова с их tf-idf весами
    word_score_pairs = list(zip(feature_names, tfidf_scores))

    # Сортируем по значению TF-IDF и выбираем топ-N ключевых слов
    sorted_words = sorted(word_score_pairs, key=lambda x: x[1], reverse=True)

    # Принудительно преобразуем top_n в целое число на случай ошибок типа
    top_n = min(max(int(request.top_n), 1), len(sorted_words))  # Ограничиваем top_n

    # 3. Вычисляем общую сумму TF-IDF
    total_tfidf = sum(score for _, score in sorted_words)

    # Топ-N ключевых слов с количеством вхождений
    top_keywords = []
    for word, score in sorted_words[:top_n]:
        # Преобразуем TF-IDF в количество слов
        word_count = (score / total_tfidf) * num_words
        top_keywords.append({"word": word, "count": round(word_count)})

    # 4. Формируем итоговый результат в виде словаря
    result = {
        "keywords": top_keywords,
        "statistics": {
            "num_characters": num_characters,
            "num_words": num_words
        }
    }
    
    return result