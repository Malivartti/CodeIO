import asyncio
from typing import Any

from fastapi import APIRouter, Depends, Query

from app.attempt.code_execution_service import (
    CodeExecutionServiceDep,
)
from app.auth.deps import (
    CurrentUser,
    get_current_active_superuser,
)
from app.auth.models import Message
from app.store import StoreDep

from .exceptions import (
    AttemptAccessDeniedException,
    AttemptNotFoundException,
    AttemptUserMismatch,
)
from .execution_result_handler import ExecutionResultHandlerDep
from .models import (
    AttemptCreate,
    AttemptPublic,
    AttemptStatusEnum,
    AttemptUpdate,
)

router = APIRouter(prefix="/attempts", tags=["attempts"])


@router.get(
    "",
    response_model=dict[str, Any],
)
async def get_attempts(
    store: StoreDep,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    if not current_user.is_superuser:
        attempts_data = await store.attempt.get_attempts(
            user_id=current_user.id,
            skip=skip,
            limit=limit,
        )
    else:
        attempts_data = await store.attempt.get_attempts(
            skip=skip,
            limit=limit,
        )

    return {"data": attempts_data["attempts"], "count": attempts_data["count"]}


@router.get(
    "/{attempt_id}",
    response_model=AttemptPublic,
)
async def get_attempt(
    store: StoreDep,
    current_user: CurrentUser,
    attempt_id: int,
) -> Any:
    attempt = await store.attempt.get_attempt_by_id(attempt_id=attempt_id)
    if not attempt:
        raise AttemptNotFoundException

    if not (current_user.is_superuser or current_user.id == attempt.user_id):
        raise AttemptAccessDeniedException

    return attempt


@router.get(
    "/task/{task_id}",
    response_model=dict[str, Any],
)
async def get_attempts_by_task(
    store: StoreDep,
    current_user: CurrentUser,
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    if not current_user.is_superuser:
        attempts_data = await store.attempt.get_attempts(
            user_id=current_user.id,
            task_id=task_id,
            skip=skip,
            limit=limit,
        )
    else:
        attempts_data = await store.attempt.get_attempts(
            task_id=task_id,
            skip=skip,
            limit=limit,
        )

    return {"data": attempts_data["attempts"], "count": attempts_data["count"]}


@router.post(
    "",
    response_model=dict[str, Any],
)
async def create_attempt(
    store: StoreDep,
    current_user: CurrentUser,
    attempt_in: AttemptCreate,
    code_execution_service: CodeExecutionServiceDep,
) -> Any:
    if not current_user.is_superuser and current_user.id != attempt_in.user_id:
        raise AttemptUserMismatch

    attempt = await store.attempt.create_attempt(attempt_create=attempt_in)

    await code_execution_service.execute_attempt(attempt)

    return {"id": attempt.id, "status": attempt.status}


@router.get(
    "/{attempt_id}/status",
    response_model=dict[str, Any],
)
async def get_attempt_status(
    store: StoreDep,
    execution_result_handler: ExecutionResultHandlerDep,
    current_user: CurrentUser,
    attempt_id: int,
    timeout_seconds: int = Query(30, ge=1, le=60),
) -> Any:
    """Long polling для получения статуса попытки"""
    attempt = await store.attempt.get_attempt_by_id(attempt_id=attempt_id)
    if not attempt:
        raise AttemptNotFoundException

    if not (current_user.is_superuser or current_user.id == attempt.user_id):
        raise AttemptAccessDeniedException

    if attempt.status != AttemptStatusEnum.RUNNING:
        return {
            "id": attempt.id,
            "status": attempt.status,
            "time_used_ms": attempt.time_used_ms,
            "memory_used_bytes": attempt.memory_used_bytes,
            "error_traceback": attempt.error_traceback,
            "failed_test_number": attempt.failed_test_number,
            "source_code_output": attempt.source_code_output,
            "expected_output": attempt.expected_output,
        }

    event = execution_result_handler.add_pending_request(attempt_id)

    try:
        await asyncio.wait_for(event.wait(), timeout=timeout_seconds)

        updated_attempt = await store.attempt.get_attempt_by_id(
            attempt_id=attempt_id
        )

        if not updated_attempt:
            raise AttemptNotFoundException
    except TimeoutError:
        return {"id": attempt.id, "status": attempt.status}
    except Exception as e:
        raise e

    else:
        return {
            "id": updated_attempt.id,
            "status": updated_attempt.status,
            "time_used_ms": updated_attempt.time_used_ms,
            "memory_used_bytes": updated_attempt.memory_used_bytes,
            "error_traceback": updated_attempt.error_traceback,
            "failed_test_number": updated_attempt.failed_test_number,
            "source_code_output": updated_attempt.source_code_output,
            "expected_output": updated_attempt.expected_output,
        }
    finally:
        execution_result_handler.remove_pending_request(attempt_id)


@router.patch(
    "/{attempt_id}",
    response_model=AttemptPublic,
)
async def update_attempt(
    store: StoreDep,
    current_user: CurrentUser,
    attempt_id: int,
    attempt_in: AttemptUpdate,
) -> Any:
    existing_attempt = await store.attempt.get_attempt_by_id(
        attempt_id=attempt_id
    )
    if not existing_attempt:
        raise AttemptNotFoundException

    if not current_user.is_superuser and current_user.id != attempt_id:
        raise AttemptUserMismatch

    return await store.attempt.update_attempt(
        attempt_id=attempt_id,
        attempt_update=attempt_in,
    )


@router.delete(
    "/{attempt_id}", dependencies=[Depends(get_current_active_superuser)]
)
async def delete_attempt(
    store: StoreDep,
    attempt_id: int,
) -> Message:
    existing_attempt = await store.attempt.get_attempt_by_id(
        attempt_id=attempt_id
    )
    if not existing_attempt:
        raise AttemptNotFoundException

    await store.attempt.delete_attempt(attempt_id=attempt_id)
    return Message(message="Попытка успешно удалена")
