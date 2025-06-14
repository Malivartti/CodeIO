from unittest.mock import AsyncMock, patch

import pytest

from app.core.exceptions import InternalException
from app.user.exceptions import UserAlreadyExistsException
from app.user.models import UserCreate


@pytest.mark.asyncio
async def test_success(store, new_email, new_password):
    user_data = UserCreate(
        email=new_email,
        first_name="New",
        last_name="User",
        password=new_password,
        is_active=True,
        is_superuser=False,
    )
    await store.user.create_user(user_create=user_data)

    db_user = await store.user.get_user_by_email(email=user_data.email)
    assert db_user is not None
    assert db_user.email == user_data.email
    assert db_user.first_name == user_data.first_name
    assert db_user.is_active is True
    assert db_user.is_superuser is False


@pytest.mark.asyncio
async def test_already_exists(store, user, new_password):
    user_data = UserCreate(
        email=user.email,
        first_name="Another",
        last_name="User",
        password=new_password,
    )

    with pytest.raises(UserAlreadyExistsException):
        await store.user.create_user(user_create=user_data)


@pytest.mark.asyncio
async def test_internal_error(store, new_email, new_password):
    user_data = UserCreate(
        email=new_email,
        first_name="New",
        last_name="User",
        password=new_password,
        is_active=True,
        is_superuser=False,
    )

    with patch.object(
        store.user.session, "commit", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.create_user(user_create=user_data)
