from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(max_length=255, default=None)
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(
        unique=True, index=True, max_length=255, default=None
    )
    password: str | None = Field(min_length=8, max_length=40, default=None)
    first_name: str | None = Field(max_length=255, default=None)
    last_name: str | None = Field(max_length=255, default=None)
    is_active: bool | None = Field(default=None)
    is_superuser: bool | None = Field(default=None)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(max_length=255, default=None)


class UserUpdateMe(SQLModel):
    first_name: str | None = Field(max_length=255, default=None)
    last_name: str | None = Field(max_length=255, default=None)


class UserUpdateMeEmail(SQLModel):
    new_email: EmailStr = Field(max_length=255)


class UserUpdateMePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str


class UserPublic(UserBase):
    id: UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int
