from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.core.exceptions import InternalException
from app.user.exceptions import UserNotFoundException
from app.user.models import UserUpdate, UserUpdateMe


@pytest.mark.asyncio
async def test_success(store, user):
    update_data = UserUpdate(
        first_name="Updated",
        last_name="Name",
    )
    await store.user.update_user(user_id=user.id, user_update=update_data)

    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user.first_name == "Updated"
    assert db_user.last_name == "Name"


@pytest.mark.asyncio
async def test_with_password(store, user, new_password):
    user_hashed_password = user.hashed_password
    update_data = UserUpdate(
        password=new_password,
    )
    await store.user.update_user(user_id=user.id, user_update=update_data)

    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user.hashed_password != user_hashed_password


@pytest.mark.asyncio
async def test_not_found(store):
    update_data = UserUpdateMe(
        first_name="Updated",
        last_name="Name",
    )

    with pytest.raises(UserNotFoundException):
        await store.user.update_user(user_id=uuid4(), user_update=update_data)


@pytest.mark.asyncio
async def test_internal_error(store, user):
    update_data = UserUpdate(
        first_name="Updated",
        last_name="Name",
    )

    with patch.object(
        store.user.session, "commit", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.update_user(
                user_id=user.id, user_update=update_data
            )
