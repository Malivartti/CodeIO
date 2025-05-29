from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.email_sender import (
    generate_reset_password_email,
    send_email,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.store import StoreDep
from app.user.exceptions import (
    UserInactiveException,
    UserNotExistsException,
)
from app.user.models import UserUpdate

from .exceptions import InvalidTokenException
from .models import AccessToken, Message, NewPassword

router = APIRouter(tags=["auth"])


@router.post("/login/access-token")
async def login_access_token(
    store: StoreDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> AccessToken:
    """OAuth2 compatible token login, get an access token for future requests"""
    user = await store.user.authenticate(
        email=form_data.username, password=form_data.password
    )
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return AccessToken(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        )
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


@router.post("/reset-password/")
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
