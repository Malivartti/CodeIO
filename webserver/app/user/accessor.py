from datetime import datetime, timezone
from typing import TypedDict
from uuid import UUID

from sqlalchemy import and_, desc, distinct, extract, func, select
from sqlalchemy.exc import IntegrityError
from sqlmodel import col

from app.attempt.models import Attempt, AttemptStatusEnum
from app.auth.exceptions import InvalidCredentialsException
from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log
from app.core.security import get_password_hash, verify_password
from app.task.models import DifficultyEnum, Task

from .exceptions import (
    UserAlreadyExistsException,
    UserInactiveException,
    UserIncorrectPasswordException,
    UserNotFoundException,
    UserSamePasswordException,
)
from .models import User, UserCreate, UserRegister, UserUpdate, UserUpdateMe

log = create_log(
    __name__,
    {
        UserNotFoundException: UserNotFoundException.default_message,
    },
)


class UsersDict(TypedDict):
    users: list[User]
    count: int


class UserAccessor(BaseAccessor):
    async def get_user_by_id(self, *, user_id: UUID) -> User | None:
        try:
            result = await self.session.get(User, user_id)
        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result

    async def get_user_by_email(self, email: str) -> User | None:
        try:
            query = select(User).where(col(User.email) == email)
            result = await self.session.execute(query)
        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return result.scalar_one_or_none()

    async def get_users_with_count(
        self, *, skip: int = 0, limit: int = 100
    ) -> UsersDict:
        try:
            count_query = select(func.count()).select_from(User)
            count_result = await self.session.execute(count_query)
            count = count_result.scalar_one()

            query = select(User).offset(skip).limit(limit)
            users_result = await self.session.execute(query)
            users = list(users_result.scalars().all())

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return {"users": users, "count": count}

    async def authenticate(self, *, email: str, password: str) -> User:
        user = await self.get_user_by_email(email=email)
        if not user:
            raise InvalidCredentialsException
        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException
        if not user.is_active:
            raise UserInactiveException

        return user

    async def create_user(
        self, *, user_create: UserCreate | UserRegister
    ) -> User:
        try:
            user = User(
                **user_create.model_dump(),
                hashed_password=get_password_hash(user_create.password),
            )
            self.session.add(user)
            await self.commit()
            await self.refresh(user)

        except IntegrityError as e:
            await self.rollback()
            log(
                e,
                level="warning",
                additional_info=f"email: {user_create.email}",
            )
            raise UserAlreadyExistsException from e
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return user

    async def update_user(
        self, *, user_id: UUID, user_update: UserUpdate | UserUpdateMe
    ) -> User | None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException

            update_data = user_update.model_dump(exclude_unset=True)

            if "password" in update_data:
                update_data["hashed_password"] = get_password_hash(
                    update_data.pop("password")
                )

            for field, value in update_data.items():
                setattr(user, field, value)

            await self.commit()
            await self.refresh(user)

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e
        else:
            return user

    async def update_user_password(
        self, *, user_id: UUID, current_password: str, new_password: str
    ) -> None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException
            if not verify_password(current_password, user.hashed_password):
                raise UserIncorrectPasswordException
            if current_password == new_password:
                raise UserSamePasswordException

            user.hashed_password = get_password_hash(new_password)
            await self.commit()
            await self.refresh(user)

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except UserIncorrectPasswordException:
            raise
        except UserSamePasswordException:
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def delete_user(self, *, user_id: UUID) -> None:
        try:
            user = await self.session.get(User, user_id)

            if not user:
                raise UserNotFoundException

            await self.session.delete(user)
            await self.commit()

        except UserNotFoundException as e:
            log(e, level="warning", additional_info=f"user_id: {user_id}")
            raise
        except Exception as e:
            await self.rollback()
            log(e)
            raise InternalException from e

    async def get_user_stats(  # noqa: PLR0914
        self, *, user_id: UUID, year: int | None = None
    ) -> dict:
        if year is None:
            year = datetime.now(timezone.utc).year  # noqa: UP017

        try:
            successful_attempts_query = (
                select(
                    col(Attempt.task_id),
                    col(Attempt.created_at),
                    col(Task.difficulty),
                    col(Task.title),
                )
                .join(Task, col(Attempt.task_id) == Task.id)
                .where(
                    and_(
                        col(Attempt.user_id) == user_id,
                        col(Attempt.status) == AttemptStatusEnum.OK,
                        extract("year", col(Attempt.created_at)) == year,
                    )
                )
                .order_by(col(Attempt.task_id), desc(col(Attempt.created_at)))
            )

            attempts_result = await self.session.execute(
                successful_attempts_query
            )
            attempts = attempts_result.all()

            latest_attempts_by_task = {}
            for attempt in attempts:
                task_id = attempt.task_id
                if task_id not in latest_attempts_by_task:
                    latest_attempts_by_task[task_id] = {
                        "created_at": attempt.created_at,
                        "difficulty": attempt.difficulty,
                        "title": attempt.title,
                    }

            difficulty_stats = {
                "easy": {"solved": 0, "total": 0},
                "medium": {"solved": 0, "total": 0},
                "hard": {"solved": 0, "total": 0},
            }

            for task_data in latest_attempts_by_task.values():
                difficulty = task_data["difficulty"].value
                difficulty_stats[difficulty]["solved"] += 1

            for difficulty in ["easy", "medium", "hard"]:
                total_query = select(func.count(col(Task.id))).where(
                    and_(
                        col(Task.difficulty) == DifficultyEnum(difficulty),
                        col(Task.is_public) == True,  # noqa: E712
                    )
                )
                total_result = await self.session.execute(total_query)
                difficulty_stats[difficulty]["total"] = (
                    total_result.scalar_one()
                )

            activity_query = (
                select(
                    func.date(Attempt.created_at).label("date"),
                    func.count(distinct(col(Attempt.task_id))).label("count"),
                )
                .join(Task, col(Attempt.task_id) == Task.id)
                .where(
                    and_(
                        col(Attempt.user_id) == user_id,
                        col(Attempt.status) == AttemptStatusEnum.OK,
                        extract("year", col(Attempt.created_at)) == year,
                    )
                )
                .group_by(func.date(Attempt.created_at))
            )

            activity_result = await self.session.execute(activity_query)
            activity_days = [
                {"date": row.date, "count": row.count}
                for row in activity_result.all()
            ]

            recent_tasks = sorted(
                [
                    {
                        "id": task_id,
                        "title": task_data["title"],
                        "solved_at": task_data["created_at"],
                    }
                    for task_id, task_data in latest_attempts_by_task.items()
                ],
                key=lambda x: x["solved_at"],
                reverse=True,
            )[:10]

            total_solved = len(latest_attempts_by_task)
            average_per_month = (
                round(total_solved / 12, 1) if total_solved > 0 else 0
            )
            average_per_week = (
                round(total_solved / 52, 1) if total_solved > 0 else 0
            )

        except Exception as e:
            log(e)
            raise InternalException from e
        else:
            return {
                "solved_by_difficulty": difficulty_stats,
                "activity_days": activity_days,
                "recent_solved_tasks": recent_tasks,
                "total_solved_this_year": total_solved,
                "average_per_month": average_per_month,
                "average_per_week": average_per_week,
            }

    async def get_leaderboard(self, *, limit: int = 100) -> dict:
        try:
            users_query = (
                select(
                    col(User.id),
                    col(User.first_name),
                    col(User.last_name),
                    col(User.avatar_filename),
                    col(Attempt.task_id),
                    col(Task.difficulty),
                )
                .outerjoin(
                    Attempt,
                    and_(
                        col(Attempt.user_id) == User.id,
                        col(Attempt.status) == AttemptStatusEnum.OK,
                    ),
                )
                .outerjoin(Task, col(Attempt.task_id) == Task.id)
                .where(col(User.is_active) == True)  # noqa: E712
            )

            users_result = await self.session.execute(users_query)
            users_data = users_result.all()

            user_scores = {}
            difficulty_scores = {
                DifficultyEnum.easy: 3,
                DifficultyEnum.medium: 5,
                DifficultyEnum.hard: 10,
            }

            for row in users_data:
                user_id = row.id
                if user_id not in user_scores:
                    user_scores[user_id] = {
                        "first_name": row.first_name,
                        "last_name": row.last_name,
                        "avatar_filename": row.avatar_filename,
                        "solved_tasks": set(),
                        "total_score": 0,
                    }

                if (
                    row.task_id
                    and row.task_id not in user_scores[user_id]["solved_tasks"]
                ):
                    user_scores[user_id]["solved_tasks"].add(row.task_id)
                    user_scores[user_id]["total_score"] += difficulty_scores[
                        row.difficulty
                    ]

            leaderboard_data = []
            for user_id, data in user_scores.items():
                if data["total_score"] > 0:
                    leaderboard_data.append(
                        {
                            "user_id": user_id,
                            "first_name": data["first_name"],
                            "last_name": data["last_name"],
                            "avatar_filename": data["avatar_filename"],
                            "total_score": data["total_score"],
                            "solved_tasks_count": len(data["solved_tasks"]),
                        }
                    )

            leaderboard_data.sort(key=lambda x: x["total_score"], reverse=True)

            return {
                "data": leaderboard_data[:limit],
                "count": len(leaderboard_data),
            }

        except Exception as e:
            log(e)
            raise InternalException from e
