from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success(store, tag):
    retrieved_tag = await store.task.get_tag_by_id(tag_id=tag.id)

    assert retrieved_tag is not None
    assert retrieved_tag.id == tag.id
    assert retrieved_tag.name == tag.name


@pytest.mark.asyncio
async def test_not_found(store, tag):
    non_existent_id = tag.id + 1000
    retrieved_tag = await store.task.get_tag_by_id(tag_id=non_existent_id)

    assert retrieved_tag is None


@pytest.mark.asyncio
async def test_internal_error(store, tag):
    with patch.object(
        store.task.session,
        "get",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.get_tag_by_id(tag_id=tag.id)
