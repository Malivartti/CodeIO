from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.core.exceptions import InternalException
from app.user.exceptions import (
    UserIncorrectPasswordException,
    UserNotFoundException,
    UserSamePasswordException,
)


@pytest.mark.asyncio
async def test_success(store, user, correct_password, new_password):
    await store.user.update_user_password(
        user_id=user.id,
        current_password=correct_password,
        new_password=new_password,
    )

    authenticated_user = await store.user.authenticate(
        email=user.email, password=new_password
    )
    assert authenticated_user.id == user.id


@pytest.mark.asyncio
async def test_not_found(store, correct_password, new_password):
    with pytest.raises(UserNotFoundException):
        await store.user.update_user_password(
            user_id=uuid4(),
            current_password=correct_password,
            new_password=new_password,
        )


@pytest.mark.asyncio
async def test_incorrect_current_password(store, user, incorrect_password):
    with pytest.raises(UserIncorrectPasswordException):
        await store.user.update_user_password(
            user_id=user.id,
            current_password=incorrect_password,
            new_password=incorrect_password + "123",
        )


@pytest.mark.asyncio
async def test_same_password(store, user, correct_password):
    with pytest.raises(UserSamePasswordException):
        await store.user.update_user_password(
            user_id=user.id,
            current_password=correct_password,
            new_password=correct_password,
        )


@pytest.mark.asyncio
async def test_internal_error(store, user, correct_password, new_password):
    with patch.object(
        store.user.session, "commit", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.update_user_password(
                user_id=user.id,
                current_password=correct_password,
                new_password=new_password,
            )
