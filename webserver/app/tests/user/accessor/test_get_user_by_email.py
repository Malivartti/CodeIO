from unittest.mock import AsyncMock, patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success(store, user):
    db_user = await store.user.get_user_by_email(email=user.email)
    assert db_user is not None
    assert db_user.id == user.id
    assert db_user.email == user.email


@pytest.mark.asyncio
async def test_not_found(store, not_existent_email):
    db_user = await store.user.get_user_by_email(email=not_existent_email)
    assert db_user is None


@pytest.mark.asyncio
async def test_internal_error(store, user):
    with patch.object(
        store.user.session, "execute", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.get_user_by_email(email=user.email)
