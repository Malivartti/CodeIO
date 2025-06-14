from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success_with_tags(store, tags):
    result = await store.task.get_tags_with_count()

    assert result["count"] == len(tags)
    assert len(result["tags"]) == len(tags)


@pytest.mark.asyncio
async def test_pagination(store, tags):
    result = await store.task.get_tags_with_count(limit=1)

    assert len(result["tags"]) == 1
    assert result["count"] == 3


@pytest.mark.asyncio
async def test_empty_result(store):
    result = await store.task.get_tags_with_count()

    assert result["count"] == 0
    assert len(result["tags"]) == 0


@pytest.mark.asyncio
async def test_internal_error(store):
    with patch.object(
        store.task.session,
        "execute",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.get_tags_with_count()
