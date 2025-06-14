from unittest.mock import AsyncMock
from uuid import uuid4

import jwt
import pytest

from app.auth.deps import get_current_active_user
from app.auth.exceptions import InvalidTokenException
from app.core.config import settings
from app.core.security import ALGORITHM, create_access_token
from app.user.exceptions import UserInactiveException, UserNotFoundException


@pytest.mark.asyncio
async def test_get_current_active_user_success(store, user):
    valid_token = create_access_token(str(user.id))

    store.user.get_user_by_id = AsyncMock(return_value=user)

    result = await get_current_active_user(store=store, token=valid_token)

    assert result == user
    store.user.get_user_by_id.assert_called_once_with(user_id=user.id)


@pytest.mark.asyncio
async def test_get_current_active_user_invalid_token_format(store):
    invalid_token = "invalid.token.format"

    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token=invalid_token)


@pytest.mark.asyncio
async def test_get_current_active_user_wrong_secret(store):
    wrong_payload = {"sub": "user123", "exp": 9999999999}
    wrong_token = jwt.encode(
        wrong_payload, "wrong_secret_key", algorithm=ALGORITHM
    )

    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token=wrong_token)


@pytest.mark.asyncio
async def test_get_current_active_user_missing_sub(store):
    payload_without_sub = {"exp": 9999999999}
    token_without_sub = jwt.encode(
        payload_without_sub, settings.SECRET_KEY, algorithm=ALGORITHM
    )

    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token=token_without_sub)


@pytest.mark.asyncio
async def test_get_current_active_user_null_sub(store):
    payload_null_sub = {"sub": None, "exp": 9999999999}
    token_null_sub = jwt.encode(
        payload_null_sub, settings.SECRET_KEY, algorithm=ALGORITHM
    )

    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token=token_null_sub)


@pytest.mark.asyncio
async def test_get_current_active_user_user_not_found(store):
    not_existent_user_id = uuid4()
    valid_token = create_access_token(str(not_existent_user_id))

    store.user.get_user_by_id = AsyncMock(return_value=None)

    with pytest.raises(UserNotFoundException):
        await get_current_active_user(store=store, token=valid_token)

    store.user.get_user_by_id.assert_called_once_with(
        user_id=not_existent_user_id
    )


@pytest.mark.asyncio
async def test_get_current_active_user_inactive_user(store, inactive_user):
    valid_token = create_access_token(str(inactive_user.id))

    store.user.get_user_by_id = AsyncMock(return_value=inactive_user)

    with pytest.raises(UserInactiveException):
        await get_current_active_user(store=store, token=valid_token)

    store.user.get_user_by_id.assert_called_once_with(user_id=inactive_user.id)


@pytest.mark.asyncio
async def test_get_current_active_user_wrong_algorithm(store):
    payload = {"sub": "user123", "exp": 9999999999}
    wrong_algorithm_token = jwt.encode(
        payload, settings.SECRET_KEY, algorithm="HS512"
    )

    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token=wrong_algorithm_token)


@pytest.mark.asyncio
async def test_get_current_active_user_empty_token(store):
    with pytest.raises(InvalidTokenException):
        await get_current_active_user(store=store, token="")
