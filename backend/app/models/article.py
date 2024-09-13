import uuid
from sqlmodel import Field, Relationship, SQLModel
from typing import Optional, List

class ArticleBase(SQLModel):
    content: str = Field()
    name: str = Field(max_length=100)

class Article(ArticleBase, table=True):
    id: int = Field(default=None, primary_key=True)  # id должен быть Primary Key
    owner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id", nullable=True)
    owner: Optional["User"] = Relationship(back_populates="articles")  # Поправил связь

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    content: Optional[str] = Field(default=None)
    name: Optional[str] = Field(default=None, max_length=100)

class ArticlePublic(ArticleBase):
    id: int

class ArticlesPublic(SQLModel):
    data: List[ArticlePublic]  # Список статей
    count: int  # Общее количество статей