from typing import Any, TypedDict
from uuid import UUID

from sqlalchemy import case as sql_case, func, literal, or_
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, select

from app.attempt.models import Attempt, AttemptStatusEnum
from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log

from .exceptions import (
    TagAlreadyExistsException,
    TagNotFoundException,
    TaskAlreadyExistsException,
    TaskNotFoundException,
    TastTagRelationshipAlreadyExistsException,
    TastTagRelationshipNotExistsExceptionException,
)
from .models import (
    DifficultyEnum,
    SortByEnum,
    SortOrderEnum,
    Tag,
    TagCreate,
    TagUpdate,
    Task,
    TaskCreate,
    TaskStatusEnum,
    TaskTagLink,
    TaskUpdate,
    TaskWithAttemptStatus,
)

log = create_log(
    __name__,
    {
        TaskNotFoundException: TaskNotFoundException.default_message,
        TagNotFoundException: TagNotFoundException.default_message,
    },
)


class TasksDict(TypedDict):
    tasks: list[TaskWithAttemptStatus]
    count: int


class TagsDict(TypedDict):
    tags: list[Tag]
    count: int


class TaskAccessor(BaseAccessor):
    async def get_task_by_id(self, *, task_id: int) -> Task | None:
        try:
            result = await self.session.get(Task, task_id)

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result

    async def get_tasks_with_filters(  # noqa: C901, PLR0912
        self,
        *,
        user_id: UUID | None = None,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
        sort_by: SortByEnum = SortByEnum.id,
        sort_order: SortOrderEnum = SortOrderEnum.asc,
        statuses: list[TaskStatusEnum] | None = None,
        difficulties: list[DifficultyEnum] | None = None,
        tag_ids: list[int] | None = None,
        with_private: bool | None = False,
    ) -> TasksDict:
        try:
            base_query = select(Task)

            if user_id is not None and statuses:
                status_subq = (
                    select(
                        Attempt.task_id,
                        sql_case(
                            (
                                func.bool_or(
                                    Attempt.status == AttemptStatusEnum.OK
                                ),
                                literal(TaskStatusEnum.solved),
                            ),
                            (
                                func.count(col(Attempt.id)) > 0,
                                literal(TaskStatusEnum.attempted),
                            ),
                        ).label("user_attempt_status"),
                    )
                    .where(Attempt.user_id == user_id)
                    .group_by(col(Attempt.task_id))
                    .subquery()
                )

                base_query = base_query.outerjoin(
                    status_subq, col(Task.id) == status_subq.c.task_id
                ).add_columns(
                    func.coalesce(
                        status_subq.c.user_attempt_status,
                        literal(TaskStatusEnum.todo),
                    ).label("user_attempt_status")
                )  # type: ignore[assignment]

                filters = []
                if any(
                    s in statuses
                    for s in [
                        TaskStatusEnum.solved,
                        TaskStatusEnum.attempted,
                    ]
                ):
                    filters.append(
                        status_subq.c.user_attempt_status.in_(
                            [
                                s.value
                                for s in statuses
                                if s
                                in [
                                    TaskStatusEnum.solved,
                                    TaskStatusEnum.attempted,
                                ]
                            ]
                        )
                    )
                if TaskStatusEnum.todo in statuses:
                    filters.append(status_subq.c.user_attempt_status.is_(None))

                base_query = base_query.where(or_(*filters))

            if search:
                base_query = base_query.where(
                    col(Task.title).ilike(f"%{search}%")
                )

            if not with_private:
                base_query = base_query.where(col(Task.is_public) == True)  # noqa: E712

            if difficulties:
                base_query = base_query.where(
                    col(Task.difficulty).in_(difficulties)
                )

            if tag_ids:
                tag_subquery = (
                    select(TaskTagLink.task_id)
                    .where(col(TaskTagLink.tag_id).in_(tag_ids))
                    .group_by(col(TaskTagLink.task_id))
                    .having(func.count(col(TaskTagLink.tag_id)) == len(tag_ids))
                )
                base_query = base_query.where(col(Task.id).in_(tag_subquery))

            sort_column: Any
            if sort_by == SortByEnum.difficulty:
                sort_column = sql_case(
                    (col(Task.difficulty) == DifficultyEnum.easy, 1),
                    (col(Task.difficulty) == DifficultyEnum.medium, 2),
                    (col(Task.difficulty) == DifficultyEnum.hard, 3),
                )
            elif sort_by == SortByEnum.acceptance:
                sort_column = Task.acceptance_column()
            else:
                sort_column = Task.id

            if sort_order == SortOrderEnum.desc:
                sort_column = sort_column.desc()
            else:
                sort_column = sort_column.asc()

            base_query = base_query.order_by(sort_column)

            count_query = select(func.count(base_query.subquery().c.id))
            count_result = await self.session.execute(count_query)
            count = count_result.scalar_one()

            tasks_query = base_query.offset(skip).limit(limit)
            tasks_result = await self.session.execute(tasks_query)
            tasks_with_status = tasks_result.all()

            tasks_list: list[TaskWithAttemptStatus] = []
            for row in tasks_with_status:
                if user_id is not None and statuses:
                    task, user_attempt_status = row
                    new_task = TaskWithAttemptStatus(
                        **task.model_dump(),
                        user_attempt_status=user_attempt_status,
                    )
                else:
                    task = row[0]
                    new_task = TaskWithAttemptStatus(**task.model_dump())
                tasks_list.append(new_task)

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return TasksDict(tasks=tasks_list, count=count)

    async def create_task(self, *, task_create: TaskCreate) -> Task:
        try:
            task = Task(**task_create.model_dump())
            self.session.add(task)
            await self.commit()
            await self.refresh(task)

        except IntegrityError as e:
            await self.rollback()
            log(
                e,
                level="warning",
                additional_info=f"title: {task_create.title}",
            )
            raise TaskAlreadyExistsException from e
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return task

    async def update_task(
        self, *, task_id: int, task_update: TaskUpdate
    ) -> Task | None:
        try:
            task = await self.session.get(Task, task_id)

            if not task:
                raise TaskNotFoundException

            update_data = task_update.model_dump(exclude_unset=True)

            for field, value in update_data.items():
                setattr(task, field, value)

            await self.commit()
            await self.refresh(task)

        except TaskNotFoundException as e:
            log(e, level="warning", additional_info=f"task_id: {task_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return task

    async def delete_task(self, *, task_id: int) -> None:
        try:
            task = await self.session.get(Task, task_id)

            if not task:
                raise TaskNotFoundException

            await self.session.delete(task)
            await self.commit()

        except TaskNotFoundException as e:
            log(e, level="warning", additional_info=f"task_id: {task_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def get_tag_by_id(self, *, tag_id: int) -> Tag | None:
        try:
            result = await self.session.get(Tag, tag_id)

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result

    async def get_tags_with_count(
        self, *, skip: int = 0, limit: int = 100
    ) -> TagsDict:
        try:
            count_query = select(func.count()).select_from(Tag)
            count_result = await self.session.execute(count_query)
            count = count_result.scalar_one()

            query = select(Tag).offset(skip).limit(limit)
            tags_result = await self.session.execute(query)
            tags = list(tags_result.scalars().all())

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return {"tags": tags, "count": count}

    async def create_tag(self, *, tag_create: TagCreate) -> Tag:
        try:
            tag = Tag(**tag_create.model_dump())
            self.session.add(tag)
            await self.commit()
            await self.refresh(tag)

        except IntegrityError as e:
            await self.rollback()
            log(
                e,
                level="warning",
                additional_info=f"name: {tag_create.name}",
            )
            raise TagAlreadyExistsException from e
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return tag

    async def update_tag(
        self, *, tag_id: int, tag_update: TagUpdate
    ) -> Tag | None:
        try:
            tag = await self.session.get(Tag, tag_id)

            if not tag:
                raise TagNotFoundException

            update_data = tag_update.model_dump(exclude_unset=True)

            for field, value in update_data.items():
                setattr(tag, field, value)

            await self.commit()
            await self.refresh(tag)

        except TagNotFoundException as e:
            log(e, level="warning", additional_info=f"tag_id: {tag_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return tag

    async def delete_tag(self, *, tag_id: int) -> None:
        try:
            tag = await self.session.get(Tag, tag_id)

            if not tag:
                raise TagNotFoundException

            await self.session.delete(tag)
            await self.commit()

        except TagNotFoundException as e:
            log(e, level="warning", additional_info=f"tag_id: {tag_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def add_tag_to_task(self, *, task_id: int, tag_id: int) -> None:
        try:
            task = await self.session.get(Task, task_id)
            if not task:
                raise TaskNotFoundException

            tag = await self.session.get(Tag, tag_id)
            if not tag:
                raise TagNotFoundException

            existing_link = await self.session.execute(
                select(TaskTagLink).where(
                    TaskTagLink.task_id == task_id, TaskTagLink.tag_id == tag_id
                )
            )
            if existing_link.scalar_one_or_none():
                raise TastTagRelationshipAlreadyExistsException

            link = TaskTagLink(task_id=task_id, tag_id=tag_id)
            self.session.add(link)
            await self.commit()

        except TaskNotFoundException as e:
            log(e, level="warning", additional_info=f"task_id: {task_id}")
            raise
        except TagNotFoundException as e:
            log(e, level="warning", additional_info=f"tag_id: {tag_id}")
            raise
        except TastTagRelationshipAlreadyExistsException as e:
            log(
                e,
                level="warning",
                additional_info=f"task_id: {task_id}, tag_id: {tag_id}",
            )
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def remove_tag_from_task(self, *, task_id: int, tag_id: int) -> None:
        try:
            link = await self.session.execute(
                select(TaskTagLink).where(
                    TaskTagLink.task_id == task_id, TaskTagLink.tag_id == tag_id
                )
            )
            link_obj = link.scalar_one_or_none()
            if not link_obj:
                raise TastTagRelationshipNotExistsExceptionException

            await self.session.delete(link_obj)
            await self.commit()

        except TastTagRelationshipNotExistsExceptionException as e:
            log(
                e,
                level="warning",
                additional_info=f"task_id: {task_id}, tag_id: {tag_id}",
            )
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def get_tags_by_task(self, *, task_id: int) -> list[Tag]:
        try:
            query = (
                select(Tag)
                .join(TaskTagLink)
                .where(TaskTagLink.task_id == task_id)
            )
            result = await self.session.execute(query)
            tags = list(result.scalars().all())

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return tags
