import pytest_asyncio

from app.attempt.models import (
    AttemptCreate,
    AttemptStatusEnum,
    AttemptUpdate,
    ProgrammingLanguageEnum,
)
from app.store import Store
from app.task.models import Task
from app.user.models import User


@pytest_asyncio.fixture
async def attempt(user: User, raw_task: Task, store: Store):
    attempt_create = AttemptCreate(
        user_id=user.id,
        task_id=raw_task.id,
        programming_language=ProgrammingLanguageEnum.PYTHON,
        source_code="print('hi')",
    )
    return await store.attempt.create_attempt(attempt_create=attempt_create)


@pytest_asyncio.fixture
async def one_task_many_attempts(user: User, raw_task: Task, store: Store):
    new_attempts = []

    attempt_create = AttemptCreate(
        user_id=user.id,
        task_id=raw_task.id,
        programming_language=ProgrammingLanguageEnum.PYTHON,
        source_code="print('hi')",
    )

    running_attempt = await store.attempt.create_attempt(
        attempt_create=attempt_create
    )

    error_attempt = await store.attempt.create_attempt(
        attempt_create=attempt_create
    )
    await store.attempt.update_attempt(
        attempt_id=error_attempt.id,
        attempt_update=AttemptUpdate(
            status=AttemptStatusEnum.WRONG_ANSWER,
            time_used_ms=10 * 1000,
            memory_used_bytes=32 * 1024 * 1024,
            error_traceback="RuntimeError",
        ),
    )

    failed_attempt = await store.attempt.create_attempt(
        attempt_create=attempt_create
    )
    await store.attempt.update_attempt(
        attempt_id=failed_attempt.id,
        attempt_update=AttemptUpdate(
            status=AttemptStatusEnum.WRONG_ANSWER,
            time_used_ms=10 * 1000,
            memory_used_bytes=32 * 1024 * 1024,
            failed_test_number=2,
            source_code_output="1 2 3",
            expected_output="12",
        ),
    )

    solved_attempt = await store.attempt.create_attempt(
        attempt_create=attempt_create
    )
    await store.attempt.update_attempt(
        attempt_id=solved_attempt.id,
        attempt_update=AttemptUpdate(
            status=AttemptStatusEnum.OK,
            time_used_ms=10 * 1000,
            memory_used_bytes=32 * 1024 * 1024,
        ),
    )

    new_attempts.extend(
        [running_attempt, error_attempt, failed_attempt, solved_attempt]
    )
    return new_attempts


@pytest_asyncio.fixture
async def many_tasks_many_attempts(
    user: User, raw_tasks: list[Task], store: Store
):
    statuses = {
        0: AttemptStatusEnum.WRONG_ANSWER,
        1: AttemptStatusEnum.RUNNING,
        2: AttemptStatusEnum.OK,
        3: AttemptStatusEnum.RUNTIME_ERROR,
    }

    for i in range(len(raw_tasks) - 2):
        attempt_create = AttemptCreate(
            user_id=user.id,
            task_id=raw_tasks[i].id,
            programming_language=ProgrammingLanguageEnum.PYTHON,
            source_code="print('hi')",
        )

        attempt = await store.attempt.create_attempt(
            attempt_create=attempt_create
        )
        await store.attempt.update_attempt(
            attempt_id=attempt.id,
            attempt_update=AttemptUpdate(
                status=statuses[i % 4],
                time_used_ms=10 * 1000,
                memory_used_bytes=32 * 1024 * 1024,
            ),
        )
    return raw_tasks
