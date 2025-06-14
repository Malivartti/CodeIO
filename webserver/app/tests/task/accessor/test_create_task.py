from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException
from app.task.exceptions import TaskAlreadyExistsException
from app.task.models import DifficultyEnum, TaskCreate


@pytest.mark.asyncio
async def test_success(store, user):
    task_create = TaskCreate(
        user_id=user.id,
        title="New Task",
        description="Desc",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["input1"], ["output1"]],
            [["input2"], ["output2"]],
        ],
        is_public=False,
    )
    created_task = await store.task.create_task(task_create=task_create)
    assert created_task is not None
    assert created_task.title == "New Task"


@pytest.mark.asyncio
async def test_duplicate_title(store, user, task):
    task_create = TaskCreate(
        user_id=user.id,
        title=task.title,
        description="Desc",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["input1"], ["output1"]],
            [["input2"], ["output2"]],
        ],
        is_public=False,
    )
    with pytest.raises(TaskAlreadyExistsException):
        await store.task.create_task(task_create=task_create)


@pytest.mark.asyncio
async def test_internal_error(store, user):
    task_create = TaskCreate(
        user_id=user.id,
        title="New Task",
        description="Desc",
        difficulty=DifficultyEnum.easy,
        time_limit_seconds=1,
        memory_limit_megabytes=64,
        tests=[
            [["input1"], ["output1"]],
            [["input2"], ["output2"]],
        ],
        is_public=False,
    )
    with patch.object(
        store.task.session,
        "commit",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.create_task(task_create=task_create)
