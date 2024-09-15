from fastapi import APIRouter, Depends, HTTPException
from app.models.avatar import Avatar
from app.models.article import ArticleCreate, ArticlePublic
from app.crud import create_article
from app.core.config import settings
import logging
from app.api.deps import (
    SessionDep,
    CurrentUser
)
from typing import Any, Optional
from app.service.Yandex import YandexGPT
logging.basicConfig(filename='errors.log', level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get('/generate', response_model=Optional[ArticlePublic])
async def generate(
    avatar_id: str, model: str,
    theme: str, key_words: str,
    cur_user: CurrentUser, session: SessionDep,
    len_article: int = 4096
) -> Any:
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
    if model == 'YandexGPT-lite':
        yandex = YandexGPT(
            avatar=db_avatar,
            theme=theme,
            key_words=key_words,
            len_article=len_article
        )

        result = await yandex.generate_article()
        if result["result"]["alternatives"]:
            generated_text = result["result"]["alternatives"][0]["message"]["text"]

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
