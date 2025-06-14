from typing import Annotated

import jwt
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.auth.exceptions import InvalidTokenException, UnauthorizedException
from app.core import security
from app.core.config import settings
from app.core.exceptions import AccessDeniedException
from app.store import StoreDep
from app.user.accessor import UserInactiveException
from app.user.exceptions import UserNotFoundException
from app.user.models import User

from .models import TokenPayload


class CustomOAuth2PasswordBearer(OAuth2PasswordBearer):
    def __init__(self, tokenUrl: str, **kwargs):  # noqa: N803
        super().__init__(tokenUrl=tokenUrl, **kwargs)

    async def __call__(self, request: Request) -> str | None:
        authorization: str | None = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise UnauthorizedException
            return None
        return param


reusable_oauth2 = CustomOAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

optional_oauth2 = CustomOAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token",
    auto_error=False,
)

TokenDep = Annotated[str, Depends(reusable_oauth2)]
OptionalTokenDep = Annotated[str | None, Depends(optional_oauth2)]


async def get_current_active_user(store: StoreDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError) as e:
        raise InvalidTokenException from e
    if token_data.sub is None:
        raise InvalidTokenException
    user = await store.user.get_user_by_id(user_id=token_data.sub)
    if not user:
        raise UserNotFoundException
    if not user.is_active:
        raise UserInactiveException
    return user


async def get_current_user_optional(
    store: StoreDep, token: OptionalTokenDep
) -> User | None:
    if not token:
        return None

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)

        if token_data.sub is None:
            return None

        user = await store.user.get_user_by_id(user_id=token_data.sub)
        if not user or not user.is_active:
            return None

    except (InvalidTokenError, ValidationError):
        return None
    else:
        return user


CurrentUser = Annotated[User, Depends(get_current_active_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_current_user_optional)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise AccessDeniedException
    return current_user
