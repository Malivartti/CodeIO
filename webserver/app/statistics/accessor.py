from datetime import datetime, timedelta, timezone

from sqlalchemy import desc, func, select
from sqlmodel import col

from app.attempt.models import Attempt, AttemptStatusEnum
from app.core.accessor import BaseAccessor
from app.core.exceptions import InternalException
from app.core.logger import create_log
from app.task.models import Tag, Task, TaskTagLink
from app.user.models import User

from .models import AdminStats

log = create_log(__name__)


class StatisticsAccessor(BaseAccessor):
    async def get_admin_stats(self) -> AdminStats:  # noqa: PLR0914
        try:
            total_users = (
                await self.session.scalar(select(func.count(col(User.id)))) or 0
            )

            active_users = (
                await self.session.scalar(
                    select(func.count(col(User.id))).where(
                        col(User.is_active) == True  # noqa: E712
                    )
                )
                or 0
            )
            inactive_users = total_users - active_users

            superusers = (
                await self.session.scalar(
                    select(func.count(col(User.id))).where(
                        col(User.is_superuser) == True  # noqa: E712
                    )
                )
                or 0
            )

            total_tasks = (
                await self.session.scalar(select(func.count(col(Task.id)))) or 0
            )

            public_tasks = (
                await self.session.scalar(
                    select(func.count(col(Task.id))).where(
                        col(Task.is_public) == True  # noqa: E712
                    )
                )
                or 0
            )
            private_tasks = total_tasks - public_tasks

            difficulty_stats = {}
            for difficulty in ["easy", "medium", "hard"]:
                count = await self.session.scalar(
                    select(func.count(col(Task.id))).where(
                        col(Task.difficulty) == difficulty
                    )
                )
                difficulty_stats[difficulty] = count or 0

            total_attempts = (
                await self.session.scalar(select(func.count(col(Attempt.id))))
                or 0
            )
            successful_attempts = (
                await self.session.scalar(
                    select(func.count(col(Attempt.id))).where(
                        col(Attempt.status) == AttemptStatusEnum.OK
                    )
                )
                or 0
            )
            success_rate = (
                (successful_attempts / total_attempts * 100)
                if total_attempts > 0
                else 0
            )

            language_stats = await self.session.execute(
                select(
                    col(Attempt.programming_language),
                    func.count(col(Attempt.id)).label("count"),
                ).group_by(col(Attempt.programming_language))
            )

            attempts_by_language: dict[str, int] = {}
            for row in language_stats.all():
                language_name = (
                    row[0].value if hasattr(row[0], "value") else str(row[0])
                )
                attempts_by_language[language_name] = row[1]

            total_tags = (
                await self.session.scalar(select(func.count(col(Tag.id)))) or 0
            )

            most_used_tags_query = await self.session.execute(
                select(
                    col(Tag.name),
                    func.count(col(TaskTagLink.task_id)).label("usage_count"),
                )
                .join(TaskTagLink, col(Tag.id) == col(TaskTagLink.tag_id))
                .group_by(col(Tag.id), col(Tag.name))
                .order_by(desc("usage_count"))
                .limit(10)
            )
            most_used_tags = [
                {"name": row.name, "usage_count": row.usage_count}
                for row in most_used_tags_query.all()
            ]

            thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)  # noqa: UP017
            registrations_last_30_days = (
                await self.session.scalar(
                    select(func.count(col(User.id))).where(
                        col(User.created_at) >= thirty_days_ago
                    )
                )
                or 0
            )

            attempts_last_30_days = (
                await self.session.scalar(
                    select(func.count(col(Attempt.id))).where(
                        col(Attempt.created_at) >= thirty_days_ago
                    )
                )
                or 0
            )

            return AdminStats(
                total_users=total_users,
                active_users=active_users,
                inactive_users=inactive_users,
                superusers=superusers,
                total_tasks=total_tasks,
                public_tasks=public_tasks,
                private_tasks=private_tasks,
                tasks_by_difficulty=difficulty_stats,
                total_attempts=total_attempts,
                successful_attempts=successful_attempts,
                success_rate=round(success_rate, 2),
                attempts_by_language=attempts_by_language,
                total_tags=total_tags,
                most_used_tags=most_used_tags,
                attempts_last_30_days=attempts_last_30_days,
                registrations_last_30_days=registrations_last_30_days,
            )

        except Exception as e:
            log(e)
            raise InternalException from e
