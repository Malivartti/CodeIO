from typing import Any

from fastapi import APIRouter, Depends, Query

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
from .models import (
    Attempt,
    AttemptCreate,
    AttemptPublic,
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
    response_model=Attempt,
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
    response_model=Attempt,
)
async def create_attempt(
    store: StoreDep,
    current_user: CurrentUser,
    attempt_in: AttemptCreate,
) -> Any:
    if not current_user.is_superuser and current_user.id != attempt_in.user_id:
        raise AttemptUserMismatch

    return await store.attempt.create_attempt(attempt_create=attempt_in)


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
