from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TaskNotFoundException
from app.task.models import DifficultyEnum, TaskUpdate


@pytest.mark.asyncio
async def test_success(store, task):
    task_update = TaskUpdate(
        title="Updated Task",
        description="Updated description",
        difficulty=DifficultyEnum.medium,
    )
    updated_task = await store.task.update_task(
        task_id=task.id, task_update=task_update
    )

    assert updated_task is not None
    assert updated_task.title == "Updated Task"
    assert updated_task.description == "Updated description"
    assert updated_task.difficulty == DifficultyEnum.medium


@pytest.mark.asyncio
async def test_partial_update(store, task):
    original_title = task.title
    task_update = TaskUpdate(description="Only description updated")

    updated_task = await store.task.update_task(
        task_id=task.id, task_update=task_update
    )

    assert updated_task.title == original_title
    assert updated_task.description == "Only description updated"


@pytest.mark.asyncio
async def test_not_found(store, task):
    task_update = TaskUpdate(title="New Title")
    non_existent_id = task.id + 1000

    with pytest.raises(TaskNotFoundException):
        await store.task.update_task(
            task_id=non_existent_id, task_update=task_update
        )


@pytest.mark.asyncio
async def test_internal_error(store, task):
    task_update = TaskUpdate(title="Updated Task")

    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.update_task(
                task_id=task.id, task_update=task_update
            )
