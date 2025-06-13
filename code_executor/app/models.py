from dataclasses import dataclass

from .enums import ExecutionStatus, ProgrammingLanguage


@dataclass(slots=True)
class Attempt:
    id: int
    programming_language: ProgrammingLanguage
    source_code: str
    time_limit_seconds: int
    memory_limit_megabytes: int
    tests: list[list[list[str]]]


@dataclass(slots=True)
class AttemptExecutionResult:
    id: int
    status: ExecutionStatus
    time_used_seconds: float | None = None
    memory_used_megabytes: int | None = None

    error_traceback: list[str] | None = None

    failed_test_number: int | None = None
    source_code_output: list[str] | None = None
    expected_output: list[str] | None = None
