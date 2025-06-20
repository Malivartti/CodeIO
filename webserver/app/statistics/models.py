from typing import Any

from sqlmodel import SQLModel


class AdminStats(SQLModel):
    total_users: int
    active_users: int
    inactive_users: int
    superusers: int

    total_tasks: int
    public_tasks: int
    private_tasks: int
    tasks_by_difficulty: dict[str, int]

    total_attempts: int
    successful_attempts: int
    success_rate: float
    attempts_by_language: dict[str, int]

    total_tags: int
    most_used_tags: list[dict[str, Any]]

    registrations_last_30_days: int
    attempts_last_30_days: int
