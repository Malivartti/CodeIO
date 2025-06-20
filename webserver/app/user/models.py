from datetime import date, datetime
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import Column, DateTime, Field, SQLModel, text


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(max_length=255, default=None)
    avatar_filename: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(
        unique=True, index=True, max_length=255, default=None
    )
    password: str | None = Field(min_length=8, max_length=40, default=None)
    first_name: str | None = Field(max_length=255, default=None)
    last_name: str | None = Field(max_length=255, default=None)
    is_active: bool | None = Field(default=None)
    is_superuser: bool | None = Field(default=None)
    avatar_filename: str | None = Field(default=None, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(max_length=255, default=None)


class UserLogin(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    first_name: str | None = Field(max_length=255, default=None)
    last_name: str | None = Field(max_length=255, default=None)


class UserUpdateMeEmail(SQLModel):
    new_email: EmailStr = Field(max_length=255)


class UserUpdateMePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False,
        )
    )


class UserPublic(UserBase):
    id: UUID
    created_at: datetime


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class UserStatsByDifficulty(SQLModel):
    easy: dict[str, int]  # {"solved": 5, "total": 20}
    medium: dict[str, int]
    hard: dict[str, int]


class ActivityDay(SQLModel):
    date: date
    count: int  # количество решенных задач в этот день


class RecentSolvedTask(SQLModel):
    id: int
    title: str
    solved_at: datetime


class UserStats(SQLModel):
    solved_by_difficulty: UserStatsByDifficulty
    activity_days: list[ActivityDay]
    recent_solved_tasks: list[RecentSolvedTask]
    total_solved_this_year: int
    average_per_month: float
    average_per_week: float


class LeaderboardEntry(SQLModel):
    user_id: UUID
    first_name: str
    last_name: str | None
    avatar_filename: str | None
    total_score: int
    solved_tasks_count: int


class Leaderboard(SQLModel):
    data: list[LeaderboardEntry]
    count: int
