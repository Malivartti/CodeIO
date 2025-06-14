from uuid import uuid4

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success(store, user):
    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user is not None
    assert db_user.id == user.id
    assert db_user.email == user.email


@pytest.mark.asyncio
async def test_not_found(store):
    db_user = await store.user.get_user_by_id(user_id=uuid4())
    assert db_user is None


@pytest.mark.asyncio
async def test_invalid_id(store):
    with pytest.raises(InternalException):
        await store.user.get_user_by_id(user_id="fjfjf")
