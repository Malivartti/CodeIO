from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TastTagRelationshipNotExistsExceptionException


@pytest.mark.asyncio
async def test_success(store, task, tag):
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)

    await store.task.remove_tag_from_task(task_id=task.id, tag_id=tag.id)

    tags = await store.task.get_tags_by_task(task_id=task.id)
    assert not any(t.id == tag.id for t in tags)


@pytest.mark.asyncio
async def test_relationship_not_exists(store, task, tag):
    with pytest.raises(TastTagRelationshipNotExistsExceptionException):
        await store.task.remove_tag_from_task(task_id=task.id, tag_id=tag.id)


@pytest.mark.asyncio
async def test_internal_error(store, task, tag):
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tag.id)

    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.remove_tag_from_task(
                task_id=task.id, tag_id=tag.id
            )
