# test_delete_tag.py
from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TagNotFoundException


@pytest.mark.asyncio
async def test_success(store, tag):
    await store.task.delete_tag(tag_id=tag.id)
    retrieved_tag = await store.task.get_tag_by_id(tag_id=tag.id)
    assert retrieved_tag is None


@pytest.mark.asyncio
async def test_not_found(store, task):
    non_existent_id = task.id + 1000

    with pytest.raises(TagNotFoundException):
        await store.task.delete_tag(tag_id=non_existent_id)


@pytest.mark.asyncio
async def test_internal_error(store, tag):
    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.delete_tag(tag_id=tag.id)
