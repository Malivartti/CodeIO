from datetime import datetime, timezone
from enum import StrEnum
from uuid import UUID

from sqlalchemy import (
    JSON,
    Column,
    ColumnElement,
    DateTime,
    Enum as SQLEnum,
    case as sql_case,
    func,
    text,
)
from sqlmodel import Field, Relationship, SQLModel, col


class DifficultyEnum(StrEnum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class TaskStatusEnum(StrEnum):
    todo = "todo"
    attempted = "attempted"
    solved = "solved"


class SortByEnum(StrEnum):
    id = "id"
    difficulty = "difficulty"
    acceptance = "acceptance"


class SortOrderEnum(StrEnum):
    asc = "asc"
    desc = "desc"


class TaskTagLink(SQLModel, table=True):
    task_id: int = Field(foreign_key="task.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class TaskBase(SQLModel):
    user_id: UUID = Field(foreign_key="user.id")
    title: str = Field(unique=True, max_length=255)
    description: str = Field(max_length=1000)
    difficulty: DifficultyEnum = Field(
        sa_column=Column(SQLEnum(DifficultyEnum, name="difficulty_enum"))
    )
    time_limit_seconds: int
    memory_limit_megabytes: int
    tests: list[list[list[str]]] = Field(
        sa_column=Column(JSON, nullable=False),
        default_factory=list,
    )
    is_public: bool = False


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: str | None = Field(max_length=255, default=None)
    description: str | None = Field(max_length=1000, default=None)
    difficulty: DifficultyEnum | None = None
    time_limit_seconds: int | None = None
    memory_limit_megabytes: int | None = None
    tests: list[list[list[str]]] | None = None
    is_public: bool | None = None


class Task(TaskBase, table=True):
    id: int = Field(primary_key=True)
    correct_attempts: int = Field(default=0)
    total_attempts: int = Field(default=0)

    @property
    def acceptance(self) -> float:
        return (
            self.correct_attempts / self.total_attempts
            if self.total_attempts > 0
            else 0.0
        )

    @classmethod
    def acceptance_column(cls) -> ColumnElement:
        return sql_case(
            (
                col(cls.total_attempts) > 0,
                col(cls.correct_attempts)
                / func.nullif(col(cls.total_attempts), 0),
            ),
            else_=0.0,
        ).label("acceptance")

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False,
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False,
            onupdate=datetime.now(timezone.utc),  # noqa: UP017
        )
    )

    tags: list["Tag"] = Relationship(
        back_populates="tasks", link_model=TaskTagLink
    )


class TaskWithAttemptStatus(TaskBase):
    id: int
    correct_attempts: int
    total_attempts: int

    @property
    def acceptance(self) -> float:
        return (
            self.correct_attempts / self.total_attempts
            if self.total_attempts > 0
            else 0.0
        )

    user_attempt_status: TaskStatusEnum | None = None

    created_at: datetime
    updated_at: datetime


class TaskPublic(TaskWithAttemptStatus):
    pass


class TasksPublic(SQLModel):
    data: list[TaskPublic]
    count: int


class TagBase(SQLModel):
    name: str = Field(unique=True, max_length=255)


class TagCreate(TagBase):
    pass


class TagUpdate(TagBase):
    pass


class Tag(TagBase, table=True):
    id: int = Field(primary_key=True)

    tasks: list["Task"] = Relationship(
        back_populates="tags", link_model=TaskTagLink
    )


class TagPublic(TagBase):
    id: int


class TagsPublic(SQLModel):
    data: list[TagPublic]
    count: int


class TaskFilters(SQLModel):
    search: str | None = None
    statuses: list[TaskStatusEnum] | None = None
    difficulties: list[DifficultyEnum] | None = None
    tag_ids: list[int] | None = Field(default=None)
    sort_by: SortByEnum = SortByEnum.id
    sort_order: SortOrderEnum = SortOrderEnum.asc
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1, le=1000)
