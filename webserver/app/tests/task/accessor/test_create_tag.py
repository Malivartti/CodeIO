# test_create_tag.py
from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TagAlreadyExistsException
from app.task.models import TagCreate


@pytest.mark.asyncio
async def test_success(store):
    tag_create = TagCreate(name="New Tag")
    created_tag = await store.task.create_tag(tag_create=tag_create)

    assert created_tag is not None
    assert created_tag.name == "New Tag"


@pytest.mark.asyncio
async def test_duplicate_name(store, tag):
    tag_create = TagCreate(name=tag.name)

    with pytest.raises(TagAlreadyExistsException):
        await store.task.create_tag(tag_create=tag_create)


@pytest.mark.asyncio
async def test_internal_error(store):
    tag_create = TagCreate(name="Test Tag")

    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.create_tag(tag_create=tag_create)
