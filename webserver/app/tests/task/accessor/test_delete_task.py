from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TaskNotFoundException


@pytest.mark.asyncio
async def test_success(store, task):
    await store.task.delete_task(task_id=task.id)
    retrieved_task = await store.task.get_task_by_id(task_id=task.id)
    assert retrieved_task is None


@pytest.mark.asyncio
async def test_not_found(store, task):
    non_existent_id = task.id + 1000
    with pytest.raises(TaskNotFoundException):
        await store.task.delete_task(task_id=non_existent_id)


@pytest.mark.asyncio
async def test_internal_error(store, task):
    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.delete_task(task_id=task.id)
