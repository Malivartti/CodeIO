from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success_with_tags(store, task, tags):
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tags[0].id)
    await store.task.add_tag_to_task(task_id=task.id, tag_id=tags[1].id)

    tags = await store.task.get_tags_by_task(task_id=task.id)

    assert len(tags) == 2
    tag_ids = [tag.id for tag in tags]
    assert tags[0].id in tag_ids
    assert tags[1].id in tag_ids


@pytest.mark.asyncio
async def test_no_tags(store, task):
    tags = await store.task.get_tags_by_task(task_id=task.id)
    assert len(tags) == 0


@pytest.mark.asyncio
async def test_internal_error(store, task):
    with patch.object(
        store.task.session,
        "execute",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.get_tags_by_task(task_id=task.id)
