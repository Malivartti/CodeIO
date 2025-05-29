from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.deps import (
    CurrentUser,
    get_current_active_superuser,
)
from app.auth.exceptions import InvalidTokenException
from app.auth.models import Message, Token
from app.core.config import settings
from app.core.email_sender import (
    generate_change_email_email,
    generate_new_account_email,
    send_email,
)
from app.core.security import (
    create_email_change_token,
    verify_email_change_token,
)
from app.store import StoreDep

from .exceptions import (
    UserAlreadyExistsException,
    UserEmailMismatchException,
    UserNotFoundException,
    UserSameEmailException,
)
from .models import (
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    UserUpdateMeEmail,
    UserUpdateMePassword,
)

me_router = APIRouter(prefix="/users/me", tags=["me"])
users_router = APIRouter(prefix="/users", tags=["users"])


# === ОПЕРАЦИИ С ТЕКУЩИМ ПОЛЬЗОВАТЕЛЕМ (тег "me") ===


@me_router.get(
    "/",
    response_model=UserPublic,
)
async def get_me(current_user: CurrentUser) -> Any:
    return current_user


@me_router.patch("/", response_model=UserPublic)
async def update_me(
    store: StoreDep, current_user: CurrentUser, user_in: UserUpdateMe
) -> Any:
    return await store.user.update_user(
        user_id=current_user.id, user_update=user_in
    )


@me_router.post(
    "/update-password",
)
async def update_me_password(
    store: StoreDep, current_user: CurrentUser, body: UserUpdateMePassword
) -> Message:
    await store.user.update_user_password(
        user_id=current_user.id,
        current_password=body.current_password,
        new_password=body.new_password,
    )

    return Message(message="Пароль успешно изменен")


@me_router.post("/update-email")
async def update_me_email(
    store: StoreDep, current_user: CurrentUser, body: UserUpdateMeEmail
) -> Message:
    user = await store.user.get_user_by_email(email=body.new_email)
    if user and user.id != current_user.id:
        raise UserAlreadyExistsException

    if current_user.email == body.new_email:
        raise UserSameEmailException

    email_change_token = create_email_change_token(
        email=current_user.email, new_email=body.new_email
    )

    username = current_user.first_name
    if current_user.last_name:
        username += " " + current_user.last_name

    email_data = generate_change_email_email(
        email_to=current_user.email,
        username=username,
        new_email=body.new_email,
        token=email_change_token,
    )

    send_email(
        email_to=current_user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

    return Message(
        message="Письмо для подтверждения смены email отправлено на вашу почту"
    )


@me_router.post("/update-email/confirm")
async def update_me_email_confirm(
    store: StoreDep, current_user: CurrentUser, body: Token
) -> Message:
    token_data = verify_email_change_token(token=body.token)
    if not token_data:
        raise InvalidTokenException

    current_email, new_email = token_data

    if current_user.email != current_email:
        raise UserEmailMismatchException

    existing_user = await store.user.get_user_by_email(email=new_email)
    if existing_user and existing_user.id != current_user.id:
        raise UserAlreadyExistsException

    user_update = UserUpdate(email=new_email)
    await store.user.update_user(
        user_id=current_user.id,
        user_update=user_update,
    )

    return Message(message="Email успешно изменен")


# === ОПЕРАЦИИ С ПОЛЬЗОВАТЕЛЯМИ (тег "users") ===


@users_router.post("/signup", response_model=UserPublic)
async def signup(store: StoreDep, user_in: UserRegister) -> Any:
    return await store.user.create_user(user_create=user_in)


@users_router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
async def get_users(store: StoreDep, skip: int = 0, limit: int = 100) -> Any:
    users_data = await store.user.get_users_with_count(skip=skip, limit=limit)

    return UsersPublic(data=users_data["users"], count=users_data["count"])  # pyright: ignore[reportArgumentType]


@users_router.get(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
async def get_user(store: StoreDep, user_id: UUID) -> Any:
    user = await store.user.get_user_by_id(user_id=user_id)
    if not user:
        raise UserNotFoundException
    return user


@users_router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
async def create_user(store: StoreDep, user_in: UserCreate) -> Any:
    user = await store.user.create_user(user_create=user_in)

    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email,
            username=user_in.email,
            password=user_in.password,
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return user


@users_router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
async def update_user(
    store: StoreDep,
    user_id: UUID,
    user_in: UserUpdate,
) -> Any:
    return await store.user.update_user(user_id=user_id, user_update=user_in)


@users_router.delete(
    "/{user_id}", dependencies=[Depends(get_current_active_superuser)]
)
async def delete_user(store: StoreDep, user_id: UUID) -> Message:
    await store.user.delete_user(user_id=user_id)
    return Message(message="Пользователь успешно удален")
