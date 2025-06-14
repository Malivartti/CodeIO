from unittest.mock import patch

import pytest

from app.core.exceptions import InternalException


@pytest.mark.asyncio
async def test_success(store, raw_task):
    db_task = await store.task.get_task_by_id(task_id=raw_task.id)
    assert db_task is not None
    assert db_task.id == raw_task.id
    assert db_task.title == raw_task.title


@pytest.mark.asyncio
async def test_not_found(store, raw_task):
    non_existent_id = raw_task.id + 1000
    retrieved_task = await store.task.get_task_by_id(task_id=non_existent_id)
    assert retrieved_task is None


@pytest.mark.asyncio
async def test_internal_error(store):
    with patch.object(
        store.task.session,
        "get",
        side_effect=Exception("Database connection error"),
    ):
        with pytest.raises(InternalException):
            await store.task.get_task_by_id(task_id=1)
