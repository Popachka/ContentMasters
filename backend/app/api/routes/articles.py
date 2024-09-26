from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import (
    SessionDep,
    CurrentUser,
)
from app.models.optional import Message
from typing import Any
from sqlmodel import func, select
from app.models.article import Article, ArticleUpdate, ArticlePublic, ArticlesPublic
router = APIRouter()


@router.get('/', response_model=ArticlesPublic)
def read_articles_by_user(
    session: SessionDep, current_user: CurrentUser,
) -> Any:
    count_statement = (
        select(func.count()).select_from(Article).where(
            Article.owner_id == current_user.id
        )
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Article).where(Article.owner_id ==
                              current_user.id)

    )
    articles = session.exec(statement).all()
    return ArticlesPublic(data=articles, count=count)


@router.get('/{id}', response_model=ArticlePublic)
def get_article_by_id(
    session: SessionDep, current_user: CurrentUser,
    id: int
) -> Any:
    article = session.get(Article, id)
    if not article:
        raise HTTPException(status_code=404,
                            detail='Такой статьи не существует')
    if article.owner_id is None:
        return article
    if not current_user.is_superuser and (article.owner_id != current_user.id):
        raise HTTPException(
            status_code=400,
            detail='Недостаточно привилегий'
        )
    return article


@router.delete('/{id}', response_model=Message)
def delete_article(
    session: SessionDep, current_user: CurrentUser,
    id: int
) -> Any:
    item = session.get(Article, id)
    if not item:
        raise HTTPException(status_code=404,
                            detail='Такой статьи не существует')
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(
            status_code=400,
            detail='Недостаточно привилегий'
        )
    session.delete(item)
    session.commit()
    return Message(message='Статья была удалена')


@router.put('/{id}', response_model=ArticlePublic)
def update_article(*,
                   session: SessionDep, current_user: CurrentUser,
                   article_in: ArticleUpdate, id: int
                   ) -> Any:
    article = session.get(Article, id)
    if not Article:
        raise HTTPException(status_code=404,
                            detail='Такой статьи  не существует')
    if not current_user.is_superuser and (article.owner_id != current_user.id):
        raise HTTPException(
            status_code=400,
            detail='Недостаточно привилегий'
        )
    update_dict = article_in.model_dump(exclude_unset=True)
    article.sqlmodel_update(update_dict)
    session.add(article)
    session.commit()
    session.refresh(article)
    return article
