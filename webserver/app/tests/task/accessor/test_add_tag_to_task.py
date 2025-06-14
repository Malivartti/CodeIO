from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import (
    TagNotFoundException,
    TaskNotFoundException,
    TastTagRelationshipAlreadyExistsException,
)


@pytest.mark.asyncio
async def test_success(store, task, tag):
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)

    tags = await store.task.get_tags_by_task(task_id=task.id)
    assert any(t.id == tag.id for t in tags)


@pytest.mark.asyncio
async def test_task_not_found(store, tag, task):
    non_existent_task_id = task.id + 1000

    with pytest.raises(TaskNotFoundException):
        await store.task.add_tag_to_task(
            task_id=non_existent_task_id, tag_id=tag.id
        )


@pytest.mark.asyncio
async def test_tag_not_found(store, task, tag):
    non_existent_tag_id = tag.id + 1000

    with pytest.raises(TagNotFoundException):
        await store.task.add_tag_to_task(
            task_id=task.id, tag_id=non_existent_tag_id
        )


@pytest.mark.asyncio
async def test_relationship_already_exists(store, task, tag):
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)

    with pytest.raises(TastTagRelationshipAlreadyExistsException):
        await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)


@pytest.mark.asyncio
async def test_internal_error(store, task, tag):
    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)
