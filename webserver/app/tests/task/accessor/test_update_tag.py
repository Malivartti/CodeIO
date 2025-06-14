from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TagNotFoundException
from app.task.models import TagUpdate


@pytest.mark.asyncio
async def test_success(store, tag):
    tag_update = TagUpdate(name="Updated Tag")
    updated_tag = await store.task.update_tag(
        tag_id=tag.id, tag_update=tag_update
    )

    assert updated_tag is not None
    assert updated_tag.name == "Updated Tag"


@pytest.mark.asyncio
async def test_partial_update(store, tag):
    new_name = "New name"
    tag_update = TagUpdate(name=new_name)

    updated_tag = await store.task.update_tag(
        tag_id=tag.id, tag_update=tag_update
    )

    assert updated_tag.name == new_name


@pytest.mark.asyncio
async def test_not_found(store, task):
    tag_update = TagUpdate(name="New Name")
    non_existent_id = task.id + 1000

    with pytest.raises(TagNotFoundException):
        await store.task.update_tag(
            tag_id=non_existent_id, tag_update=tag_update
        )


@pytest.mark.asyncio
async def test_internal_error(store, tag):
    tag_update = TagUpdate(name="Updated Tag")

    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.update_tag(tag_id=tag.id, tag_update=tag_update)
