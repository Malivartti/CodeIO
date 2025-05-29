from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.core import security
from app.core.config import settings
from app.store import StoreDep
from app.user.exceptions import UserInactiveException, UserNotFoundException
from app.user.models import User

from .models import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


TokenDep = Annotated[str, Depends(reusable_oauth2)]


async def get_current_active_user(store: StoreDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(  # noqa: B904
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Не удалось проверить учетные данные",
        )
    if token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Неверный токен: отсутствует идентификатор пользователя",
        )
    user = await store.user.get_user_by_id(user_id=token_data.sub)
    if not user:
        raise UserNotFoundException
    if not user.is_active:
        raise UserInactiveException
    return user


CurrentUser = Annotated[User, Depends(get_current_active_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="У вас недостаточно прав")
    return current_user
