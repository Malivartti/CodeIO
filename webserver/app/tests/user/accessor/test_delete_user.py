from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.core.exceptions import InternalException
from app.user.exceptions import UserNotFoundException


@pytest.mark.asyncio
async def test_success(store, user):
    await store.user.delete_user(user_id=user.id)
    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user is None


@pytest.mark.asyncio
async def test_not_found(store):
    with pytest.raises(UserNotFoundException):
        await store.user.delete_user(user_id=uuid4())


@pytest.mark.asyncio
async def test_internal_error(store, user):
    with patch.object(
        store.user.session, "commit", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.delete_user(user_id=user.id)
