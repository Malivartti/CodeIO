from unittest.mock import AsyncMock, patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success(store, user):
    result = await store.user.get_users_with_count()
    assert isinstance(result, dict)
    assert "users" in result
    assert "count" in result
    assert user in result["users"]
    assert result["count"] >= 1


@pytest.mark.asyncio
async def test_internal_error(store):
    with patch.object(
        store.user.session, "execute", new_callable=AsyncMock
    ) as mock_exec:
        mock_exec.side_effect = Exception("Database connection error")

        with pytest.raises(InternalException):
            await store.user.get_users_with_count()
