from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.email_sender import (
    generate_reset_password_email,
    send_email,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    verify_password_reset_token,
    verify_refresh_token,
)
from app.store import StoreDep
from app.user.exceptions import (
    UserInactiveException,
)
from app.user.models import UserLogin, UserRegister, UserUpdate

from .exceptions import InvalidTokenException, UserNotExistsException
from .models import Message, NewPassword, Token, TokenPair

router = APIRouter(tags=["auth"])


@router.post("/login/access-token", response_model=TokenPair)
async def login_access_token(
    store: StoreDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> TokenPair:
    user = await store.user.authenticate(
        email=form_data.username, password=form_data.password
    )
    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login/refresh-token", response_model=TokenPair)
async def refresh_access_token(body: Token) -> TokenPair:
    user_id = verify_refresh_token(token=body.token)
    if not user_id:
        raise InvalidTokenException

    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/signup", response_model=TokenPair)
async def signup(store: StoreDep, user_in: UserRegister) -> Any:
    user = await store.user.create_user(user_create=user_in)

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenPair)
async def login(store: StoreDep, user_in: UserLogin) -> Any:
    user = await store.user.authenticate(
        email=user_in.email, password=user_in.password
    )

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/password-recovery/{email}")
async def recover_password(email: str, store: StoreDep) -> Message:
    user = await store.user.get_user_by_email(email=email)
    if not user:
        raise UserNotExistsException

    password_reset_token = create_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(
        message="Письмо для восстановления пароля отправлено на почту"
    )


@router.post("/reset-password")
async def reset_password(store: StoreDep, body: NewPassword) -> Message:
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise InvalidTokenException

    user = await store.user.get_user_by_email(email=email)
    if not user:
        raise UserNotExistsException

    if not user.is_active:
        raise UserInactiveException

    user_update = UserUpdate(password=body.new_password)
    await store.user.update_user(
        user_id=user.id,
        user_update=user_update,
    )
    return Message(message="Пароль успешно изменен")
