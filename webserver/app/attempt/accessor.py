from typing import TypedDict
from uuid import UUID

from sqlalchemy import and_, func
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, select

from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log
from app.task.models import Task

from .exceptions import (
    AttemptNotFoundException,
)
from .models import Attempt, AttemptCreate, AttemptStatusEnum, AttemptUpdate

log = create_log(
    __name__,
    {
        AttemptNotFoundException: AttemptNotFoundException.default_message,
    },
)


class AttemptsDict(TypedDict):
    attempts: list[Attempt]
    count: int


class AttemptAccessor(BaseAccessor):
    async def get_attempt_by_id(self, *, attempt_id: int) -> Attempt | None:
        try:
            result = await self.session.get(Attempt, attempt_id)

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result

    async def get_attempts(
        self,
        *,
        user_id: UUID | None = None,
        task_id: int | None = None,
        skip: int = 0,
        limit: int = 30,
    ) -> AttemptsDict:
        try:
            conditions = []
            if user_id is not None:
                conditions.append(col(Attempt.user_id) == user_id)
            if task_id is not None:
                conditions.append(col(Attempt.task_id) == task_id)

            count_stmt = select(func.count()).select_from(Attempt)
            if conditions:
                count_stmt = count_stmt.where(and_(*conditions))

            data_stmt = (
                select(Attempt)
                .offset(skip)
                .limit(limit)
                .order_by(col(Attempt.created_at).desc())
            )
            if conditions:
                data_stmt = data_stmt.where(and_(*conditions))

            count_res = await self.session.execute(count_stmt)
            count = count_res.scalar_one()

            attempts_res = await self.session.execute(data_stmt)
            attempts = list(attempts_res.scalars().all())

        except Exception as exc:
            log(exc)
            raise InternalException from exc
        else:
            return {"attempts": attempts, "count": count}

    async def create_attempt(self, *, attempt_create: AttemptCreate) -> Attempt:
        try:
            attempt = Attempt(**attempt_create.model_dump())
            self.session.add(attempt)

            if not self.session.in_transaction():
                async with self.session.begin():
                    await self.session.flush()

                    task = await self.session.get(Task, attempt.task_id)
                    if task:
                        task.total_attempts += 1
                        await self.commit()
            else:
                await self.session.commit()

                task = await self.session.get(Task, attempt.task_id)
                if task:
                    task.total_attempts += 1
                    await self.commit()

            await self.session.refresh(attempt)

        except IntegrityError as e:
            await self.rollback()
            log(
                e,
                level="warning",
                additional_info=f"user_id: {attempt_create.user_id}, "
                "task_id: {attempt_create.task_id}",
            )
            raise InternalException from e
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return attempt

    async def update_attempt(
        self, *, attempt_id: int, attempt_update: AttemptUpdate
    ) -> Attempt:
        try:
            attempt = await self.session.get(Attempt, attempt_id)

            if not attempt:
                raise AttemptNotFoundException

            old_status = attempt.status
            update_data = attempt_update.model_dump(
                exclude_unset=True, exclude_none=True
            )

            for field, value in update_data.items():
                setattr(attempt, field, value)

            if (
                attempt_update.status == AttemptStatusEnum.OK
                and old_status != AttemptStatusEnum.OK
            ):
                existing_success = await self.session.execute(
                    select(Attempt).where(
                        Attempt.user_id == attempt.user_id,
                        Attempt.task_id == attempt.task_id,
                        Attempt.status == AttemptStatusEnum.OK,
                        Attempt.id != attempt.id,
                    )
                )

                if not existing_success.first():
                    task = await self.session.get(Task, attempt.task_id)
                    if task:
                        task.correct_attempts += 1

            await self.commit()
            await self.refresh(attempt)

        except AttemptNotFoundException as e:
            log(e, level="warning", additional_info=f"attempt_id: {attempt_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return attempt

    async def delete_attempt(self, *, attempt_id: int) -> None:
        try:
            attempt = await self.session.get(Attempt, attempt_id)

            if not attempt:
                raise AttemptNotFoundException

            user_id = attempt.user_id
            task_id = attempt.task_id
            was_successful = attempt.status == AttemptStatusEnum.OK

            await self.session.delete(attempt)

            task = await self.session.get(Task, task_id)
            if task:
                task.total_attempts -= 1

                if was_successful:
                    remaining_success = await self.session.execute(
                        select(Attempt).where(
                            Attempt.user_id == user_id,
                            Attempt.task_id == task_id,
                            Attempt.status == AttemptStatusEnum.OK,
                        )
                    )

                    if not remaining_success.first():
                        task.correct_attempts -= 1

            await self.commit()

        except AttemptNotFoundException as e:
            log(e, level="warning", additional_info=f"attempt_id: {attempt_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
