from typing import Optional
import uuid

from sqlmodel import Session, select

from app.models.user import User, UserCreate, UserUpdate
from app.models.items import ItemCreate, Item
from app.models.article import ArticleCreate, Article
from app.core.security import get_password_hash, verify_password


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={'hashed_password': get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def create_article(*, session: Session, article_create: ArticleCreate, owner_id: uuid.UUID) -> Article:
    db_obj = Article.model_validate(
        article_create,
        update={'owner_id': owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_user_by_email(*, session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> Optional[User]:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={'owner_id': owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if 'password' in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
