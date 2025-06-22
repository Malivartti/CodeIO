from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.auth.deps import (
    CurrentUser,
    OptionalCurrentUser,
    get_current_active_superuser,
)
from app.auth.models import Message
from app.store import StoreDep

from .exceptions import (
    TagNotFoundException,
    TaskAccessDeniedException,
    TaskNotFoundException,
)
from .models import (
    Tag,
    TagCreate,
    TagsPublic,
    TagUpdate,
    Task,
    TaskCreate,
    TaskFilters,
    TaskPublic,
    TasksPublic,
    TaskUpdate,
)

tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])
tags_router = APIRouter(prefix="/tags", tags=["tags"])


# === ОПЕРАЦИИ С ЗАДАЧАМИ (тег "tasks") ===
@tasks_router.get("", response_model=TasksPublic)
async def get_tasks(
    store: StoreDep,
    optional_user: OptionalCurrentUser,
    filters: Annotated[TaskFilters, Query()],
) -> Any:
    tasks_data = await store.task.get_tasks_with_filters(
        user_id=optional_user.id if optional_user else None,
        **filters.model_dump(mode="python", exclude_none=True),
    )
    return TasksPublic(data=tasks_data["tasks"], count=tasks_data["count"])  # type: ignore[reportArgumentType]


@tasks_router.post(
    "",
    response_model=Task,
)
async def create_task(
    store: StoreDep, current_user: CurrentUser, task_in: TaskCreate
) -> Any:
    if task_in.user_id is None:
        task_in.user_id = current_user.id
    return await store.task.create_task(task_create=task_in)


@tasks_router.get(
    "/{task_id}",
    response_model=TaskPublic,
)
async def get_task(
    store: StoreDep,
    task_id: int,
    optional_user: OptionalCurrentUser,
) -> Any:
    user_id = optional_user.id if optional_user else None
    task = await store.task.get_task_by_id_with_status(
        task_id=task_id, user_id=user_id
    )
    if not task:
        raise TaskNotFoundException
    if not (
        task.is_public
        or (
            optional_user
            and (optional_user.is_superuser or optional_user.id == task.user_id)
        )
    ):
        raise TaskAccessDeniedException
    return task


@tasks_router.patch(
    "/{task_id}",
    response_model=Task,
)
async def update_task(
    store: StoreDep,
    task_id: int,
    task_in: TaskUpdate,
    current_user: CurrentUser,
) -> Any:
    task = await store.task.get_task_by_id(task_id=task_id)
    if not task:
        raise TaskNotFoundException
    if not (current_user.is_superuser or task.user_id == current_user.id):
        raise TaskAccessDeniedException
    return await store.task.update_task(task_id=task_id, task_update=task_in)


@tasks_router.delete("/{task_id}")
async def delete_task(
    store: StoreDep, task_id: int, current_user: CurrentUser
) -> Message:
    task = await store.task.get_task_by_id(task_id=task_id)
    if not task:
        raise TaskNotFoundException
    if not (current_user.is_superuser or task.user_id == current_user.id):
        raise TaskAccessDeniedException

    await store.task.delete_task(task_id=task_id)
    return Message(message="Задача успешно удалена")


@tasks_router.get(
    "/{task_id}/tags",
    response_model=list[Tag],
)
async def get_task_tags(store: StoreDep, task_id: int) -> Any:
    return await store.task.get_tags_by_task(task_id=task_id)


@tasks_router.post(
    "/{task_id}/tags/{tag_id}",
)
async def add_tag_to_task(
    store: StoreDep, task_id: int, tag_id: int
) -> Message:
    await store.task.add_tag_to_task(task_id=task_id, tag_id=tag_id)
    return Message(message="Тег успешно добавлен к задаче")


@tasks_router.delete(
    "/{task_id}/tags/{tag_id}",
)
async def remove_tag_from_task(
    store: StoreDep, task_id: int, tag_id: int
) -> Message:
    await store.task.remove_tag_from_task(task_id=task_id, tag_id=tag_id)
    return Message(message="Тег успешно удален из задачи")


@tags_router.get(
    "",
    response_model=TagsPublic,
)
async def get_tags(
    store: StoreDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    tags_data = await store.task.get_tags_with_count(skip=skip, limit=limit)

    return TagsPublic(data=tags_data["tags"], count=tags_data["count"])  # pyright: ignore[reportArgumentType]


@tags_router.post(
    "",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Tag,
)
async def create_tag(store: StoreDep, tag_in: TagCreate) -> Any:
    return await store.task.create_tag(tag_create=tag_in)


@tags_router.get(
    "/{tag_id}",
    response_model=Tag,
)
async def get_tag(store: StoreDep, tag_id: int) -> Any:
    tag = await store.task.get_tag_by_id(tag_id=tag_id)
    if not tag:
        raise TagNotFoundException
    return tag


@tags_router.patch(
    "/{tag_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Tag,
)
async def update_tag(
    store: StoreDep,
    tag_id: int,
    tag_in: TagUpdate,
) -> Any:
    tag = await store.task.update_tag(tag_id=tag_id, tag_update=tag_in)
    if not tag:
        raise TagNotFoundException
    return tag


@tags_router.delete(
    "/{tag_id}", dependencies=[Depends(get_current_active_superuser)]
)
async def delete_tag(store: StoreDep, tag_id: int) -> Message:
    await store.task.delete_tag(tag_id=tag_id)
    return Message(message="Тег успешно удален")
