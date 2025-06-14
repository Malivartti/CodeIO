from unittest.mock import AsyncMock, patch

import pytest

from app.auth.exceptions import InvalidCredentialsException
from app.core.exceptions import InternalException
from app.user.exceptions import UserInactiveException


@pytest.mark.asyncio
async def test_success(store, user, correct_password):
    authenticated_user = await store.user.authenticate(
        email=user.email, password=correct_password
    )
    assert authenticated_user.id == user.id


@pytest.mark.asyncio
async def test_invalid_email(store, not_existent_email, incorrect_password):
    with pytest.raises(InvalidCredentialsException):
        await store.user.authenticate(
            email=not_existent_email, password=incorrect_password
        )


@pytest.mark.asyncio
async def test_inactive_user(store, inactive_user, correct_password):
    with pytest.raises(UserInactiveException):
        await store.user.authenticate(
            email=inactive_user.email, password=correct_password
        )


@pytest.mark.asyncio
async def test_invalid_password(store, user):
    with pytest.raises(InvalidCredentialsException):
        await store.user.authenticate(
            email=user.email, password="wrongpassword"
        )


@pytest.mark.asyncio
async def test_internal_error(store, user, correct_password):
    with patch.object(
        store.user.session, "execute", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.authenticate(
                email=user.email, password=correct_password
            )
