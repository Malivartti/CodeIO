from datetime import datetime
from enum import StrEnum
from uuid import UUID

from sqlalchemy import Enum as SQLEnum
from sqlmodel import Column, DateTime, Field, SQLModel, text


class AttemptStatusEnum(StrEnum):
    RUNNING = "Running"

    OK = "Ok"
    WRONG_ANSWER = "Wrong answer"

    COMPILATION_ERROR = "Compilation error"
    RUNTIME_ERROR = "Run-time error"
    TIME_LIMIT_EXCEEDED = "Time-limit exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory limit exceeded"
    OUTPUT_LIMIT_EXCEEDED = "Output limit exceeded"


class ProgrammingLanguageEnum(StrEnum):
    PYTHON = "Python"
    GO = "Go"
    JAVASCRIPT = "JavaScript"
    CPP = "C++"
    C = "C"
    C_SHARP = "C#"
    RUST = "Rust"
    JAVA = "Java"
    KOTLIN = "Kotlin"


class AttemptBase(SQLModel):
    user_id: UUID = Field(foreign_key="user.id")
    task_id: int = Field(foreign_key="task.id")
    programming_language: ProgrammingLanguageEnum = Field(
        sa_column=Column(
            SQLEnum(ProgrammingLanguageEnum, name="programming_language_enum")
        )
    )
    source_code: str


class AttemptCreate(AttemptBase):
    pass


class AttemptUpdate(SQLModel):
    status: AttemptStatusEnum | None = None
    time_used_ms: int | None = None
    memory_used_bytes: int | None = None

    error_traceback: str | None = None

    failed_test_number: int | None = None
    source_code_output: str | None = None
    expected_output: str | None = None


class Attempt(AttemptBase, table=True):
    id: int = Field(primary_key=True)
    status: AttemptStatusEnum = Field(
        default=AttemptStatusEnum.RUNNING,
        sa_column=Column(
            SQLEnum(AttemptStatusEnum, name="attempt_status_enum"),
        ),
    )
    time_used_ms: int = Field(default=0)
    memory_used_bytes: int = Field(default=0)

    error_traceback: str | None = Field(nullable=True)

    failed_test_number: int | None = Field(nullable=True)
    source_code_output: str | None = Field(nullable=True)
    expected_output: str | None = Field(nullable=True)

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False,
        )
    )


class AttemptPublic(AttemptBase):
    id: int
    status: AttemptStatusEnum
    time_used_ms: int
    memory_used_bytes: int

    error_traceback: str | None = None
    failed_test_number: int | None = None
    source_code_output: str | None = None
    expected_output: str | None = None

    created_at: datetime


class AttemptForListPublic(SQLModel):
    id: int
    status: AttemptStatusEnum
    programming_language: ProgrammingLanguageEnum
    time_used_ms: int
    memory_used_bytes: int
    failed_test_number: int
    created_at: datetime


class AttemptsPublic(SQLModel):
    data: list[AttemptForListPublic]
    count: int
