import uuid
from sqlmodel import Field, Relationship, SQLModel
from typing import Optional


class AvatarBase(SQLModel):
    name: str = Field(max_length=50)
    description: str = Field(max_length=400)
    key_words: Optional[str] = Field(default=None, max_length=255)
    domain: Optional[str] = Field(default=None, max_length=100)
    tone: Optional[str] = Field(default=None, max_length=50)


class Avatar(AvatarBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    is_global: bool = Field(default=False, nullable=True)
    owner_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key='user.id', nullable=True)
    owner: Optional["User"] = Relationship(back_populates='avatars')


class AvatarCreate(AvatarBase):
    pass


class AvatarUpdate(AvatarBase):
    name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=400)


class AvatarPublic(SQLModel):
    id: uuid.UUID
    name: str = Field(max_length=50)
    description: str = Field(max_length=400)


class AvatarsPublic(SQLModel):
    data: list[AvatarPublic]
    count: int
