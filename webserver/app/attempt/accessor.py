from typing import TypedDict
from uuid import UUID

from sqlalchemy import and_, func
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, select

from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log

from .exceptions import (
    AttemptNotFoundException,
)
from .models import Attempt, AttemptCreate, AttemptUpdate

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
            await self.commit()
            await self.refresh(attempt)

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

            update_data = attempt_update.model_dump(
                exclude_unset=True, exclude_none=True
            )

            for field, value in update_data.items():
                setattr(attempt, field, value)

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

            await self.session.delete(attempt)
            await self.commit()

        except AttemptNotFoundException as e:
            log(e, level="warning", additional_info=f"attempt_id: {attempt_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
