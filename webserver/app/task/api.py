from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.auth.deps import (
    CurrentUser,
    OptionalCurrentUser,
    get_current_active_superuser,
    get_current_active_user,
)
from app.auth.models import Message
from app.store import StoreDep

from .exceptions import (
    TagNotFoundException,
    TaskAccessDeniedException,
    TaskNotFoundException,
)
from .models import (
    DifficultyEnum,
    SortByEnum,
    SortOrderEnum,
    Tag,
    TagCreate,
    TagsPublic,
    TagUpdate,
    Task,
    TaskCreate,
    TasksPublic,
    TaskStatusEnum,
    TaskUpdate,
)

tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])
tags_router = APIRouter(prefix="/tags", tags=["tags"])


# === ОПЕРАЦИИ С ЗАДАЧАМИ (тег "tasks") ===


@tasks_router.get(
    "",
    response_model=TasksPublic,
)
async def get_tasks(
    store: StoreDep,
    optional_user: OptionalCurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str | None = None,
    sort_by: SortByEnum = SortByEnum.id,
    sort_order: SortOrderEnum = SortOrderEnum.asc,
    statuses: Annotated[list[TaskStatusEnum] | None, Query()] = None,
    difficulties: Annotated[list[DifficultyEnum] | None, Query()] = None,
    tag_ids: Annotated[list[int] | None, Query()] = None,
) -> Any:
    tasks_data = await store.task.get_tasks_with_filters(
        user_id=optional_user.id if optional_user else None,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        statuses=statuses,
        difficulties=difficulties,
        tag_ids=tag_ids,
        with_private=optional_user.is_superuser if optional_user else False,
    )

    return TasksPublic(data=tasks_data["tasks"], count=tasks_data["count"])  # pyright: ignore[reportArgumentType]


@tasks_router.post(
    "",
    dependencies=[Depends(get_current_active_user)],
    response_model=Task,
)
async def create_task(store: StoreDep, task_in: TaskCreate) -> Any:
    return await store.task.create_task(task_create=task_in)


@tasks_router.get(
    "/{task_id}",
    response_model=Task,
)
async def get_task(
    store: StoreDep,
    task_id: int,
    optional_user: OptionalCurrentUser,
) -> Any:
    task = await store.task.get_task_by_id(task_id=task_id)
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
    dependencies=[Depends(get_current_active_superuser)],
)
async def add_tag_to_task(
    store: StoreDep, task_id: int, tag_id: int
) -> Message:
    await store.task.add_tag_to_task(task_id=task_id, tag_id=tag_id)
    return Message(message="Тег успешно добавлен к задаче")


@tasks_router.delete(
    "/{task_id}/tags/{tag_id}",
    dependencies=[Depends(get_current_active_superuser)],
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
