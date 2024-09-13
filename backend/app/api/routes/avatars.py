from fastapi import APIRouter, Depends, HTTPException
from app.models.avatar import AvatarPublic, AvatarBase, AvatarCreate, AvatarsPublic, Avatar, AvatarUpdate
from app.api.deps import (
    SessionDep,
    CurrentUser,
    get_current_active_superuser
)
from app.models.optional import Message
from typing import Any
import uuid
from sqlmodel import func, select

router = APIRouter()


@router.get('/', response_model=AvatarsPublic)
def read_avatars_by_user(
        session: SessionDep, current_user: CurrentUser,
        skip: int = 0, limit: int = 10) -> Any:
    count_statement = (
        select(func.count()).select_from(Avatar).where(
            Avatar.owner_id == current_user.id
        )
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Avatar).where(Avatar.owner_id ==
                             current_user.id).offset(skip).limit(limit)

    )
    avatars = session.exec(statement).all()
    return AvatarsPublic(data=avatars, count=count)


@router.get('/global', response_model=AvatarsPublic)
def read_global_avatars(
        session: SessionDep, skip: int = 0, limit: int = 10) -> Any:
    count_statement = (
        select(func.count()).select_from(Avatar).where(
            Avatar.is_global == True
        )
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Avatar).where(Avatar.is_global ==
                             True).offset(skip).limit(limit)
    )
    avatars = session.exec(statement).all()
    return AvatarsPublic(data=avatars, count=count)


@router.get('/{id}')
def read_avatar_by_id(
        session: SessionDep, current_user: CurrentUser,
        id: uuid.UUID
) -> Any:
    avatar = session.get(Avatar, id)
    if not avatar:
        raise HTTPException(status_code=404,
                            detail='Такого аватара не существует')
    # Проверка привилегий пользователя, если роль не глобальная
    if not avatar.is_global and (not current_user.is_superuser and avatar.owner_id != current_user.id):
        raise HTTPException(
            status_code=403,
            detail='Недостаточно привилегий'
        )
    return avatar


@router.post('/personal', response_model=AvatarPublic)
def create_avatar(*,
                  session: SessionDep, current_user: CurrentUser,
                  avatar_in: AvatarCreate
                  ) -> Any:
    avatar = Avatar.model_validate(
        avatar_in, update={'owner_id': current_user.id})
    session.add(avatar)
    session.commit()
    session.refresh(avatar)
    return avatar


@router.post('/global', response_model=AvatarPublic, dependencies=[Depends(get_current_active_superuser)])
def create_global_avatar(*,
                         session: SessionDep,
                         avatar_in: AvatarCreate
                         ) -> Any:
    avatar = Avatar.model_validate(
        avatar_in, update={'owner_id': None, 'is_global': True})
    session.add(avatar)
    session.commit()
    session.refresh(avatar)
    return avatar


@router.delete('/{id}', response_model=Message)
def delete_avatar(
        session: SessionDep, current_user: CurrentUser,
        id: uuid.UUID
) -> Any:
    item = session.get(Avatar, id)
    if not item:
        raise HTTPException(status_code=404,
                            detail='Такого аватара не существует')
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(
            status_code=400,
            detail='Недостаточно привилегий'
        )
    session.delete(item)
    session.commit()
    return Message(message='Аватар был удален')


@router.put('/{id}', response_model=AvatarPublic)
def update_avatar(*,
                  session: SessionDep, current_user: CurrentUser,
                  avatar_in: AvatarUpdate, id: uuid.UUID
                  ) -> Any:
    avatar = session.get(Avatar, id)
    if not avatar:
        raise HTTPException(status_code=404,
                            detail='Такого аватара не существует')
    if not current_user.is_superuser and (avatar.owner_id != current_user.id):
        raise HTTPException(
            status_code=400,
            detail='Недостаточно привилегий'
        )
    update_dict = avatar_in.model_dump(exclude_unset=True)
    avatar.sqlmodel_update(update_dict)
    session.add(avatar)
    session.commit()
    session.refresh(avatar)
    return avatar
