from fastapi import APIRouter
from app.api.routes import users, login, items, avatars, articles, generate_article

api_router = APIRouter()

api_router.include_router(users.router, prefix='/users', tags=['users'])
api_router.include_router(login.router, tags=['login'] )
api_router.include_router(items.router, prefix='/items', tags=['items'])
api_router.include_router(avatars.router, prefix='/avatars', tags=['avatars'])
api_router.include_router(generate_article.router, prefix='/article', tags=['generate'])
api_router.include_router(articles.router, prefix='/article', tags=['articles'])