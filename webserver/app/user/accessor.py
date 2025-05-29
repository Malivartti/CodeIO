from typing import TypedDict
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.auth.exceptions import InvalidCredentialsException
from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log
from app.core.security import get_password_hash, verify_password

from .exceptions import (
    UserAlreadyExistsException,
    UserInactiveException,
    UserIncorrectPasswordException,
    UserNotFoundException,
    UserSamePasswordException,
)
from .models import User, UserCreate, UserRegister, UserUpdate, UserUpdateMe

log = create_log(
    __name__,
    {
        UserNotFoundException: UserNotFoundException.default_message,
    },
)


class UsersDict(TypedDict):
    users: list[User]
    count: int


class UserAccessor(BaseAccessor):
    async def get_user_by_id(self, *, user_id: UUID) -> User | None:
        try:
            result = await self.session.get(User, user_id)
        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result

    async def get_user_by_email(self, email: str) -> User | None:
        try:
            query = select(User).where(User.email == email)
            result = await self.session.execute(query)
        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result.scalar_one_or_none()

    async def get_users_with_count(
        self, *, skip: int = 0, limit: int = 100
    ) -> UsersDict:
        try:
            count_query = select(func.count()).select_from(User)
            count_result = await self.session.execute(count_query)
            count = count_result.scalar_one()

            query = select(User).offset(skip).limit(limit)
            users_result = await self.session.execute(query)
            users = list(users_result.scalars().all())

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return {"users": users, "count": count}

    async def authenticate(self, *, email: str, password: str) -> User:
        user = await self.get_user_by_email(email=email)
        if not user:
            raise InvalidCredentialsException
        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException
        if not user.is_active:
            raise UserInactiveException

        return user

    async def create_user(
        self, *, user_create: UserCreate | UserRegister
    ) -> User:
        try:
            user = User.model_validate(
                user_create,
                update={
                    "hashed_password": get_password_hash(user_create.password)
                },
            )
            self.session.add(user)
            await self.commit()
            await self.refresh(user)

        except IntegrityError as e:
            await self.rollback()
            log(
                e,
                level="warning",
                additional_info=f"email: {user_create.email}",
            )
            raise UserAlreadyExistsException from e
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return user

    async def update_user(
        self, *, user_id: UUID, user_update: UserUpdate | UserUpdateMe
    ) -> User | None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException

            update_data = user_update.model_dump(exclude_unset=True)

            if "password" in update_data:
                update_data["hashed_password"] = get_password_hash(
                    update_data.pop("password")
                )

            for field, value in update_data.items():
                setattr(user, field, value)

            await self.commit()
            await self.refresh(user)

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return user

    async def update_user_password(
        self, *, user_id: UUID, current_password: str, new_password: str
    ) -> None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException
            if not verify_password(current_password, user.hashed_password):
                raise UserIncorrectPasswordException
            if current_password == new_password:
                raise UserSamePasswordException

            user.hashed_password = get_password_hash(new_password)
            await self.commit()
            await self.refresh(user)

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except UserIncorrectPasswordException:
            raise
        except UserSamePasswordException:
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def delete_user(self, *, user_id: UUID) -> None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException

            await self.session.delete(user)
            await self.commit()

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
