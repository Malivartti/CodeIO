from dataclasses import dataclass

from .enums import ExecutionStatus, ProgrammingLanguage


@dataclass
class Attempt:
    id: int
    programming_language: ProgrammingLanguage
    source_code: str
    time_limit_seconds: int
    memory_limit_megabytes: int
    tests: list[list[list[str]]]


@dataclass
class AttemptExecutionResult:
    id: int
    status: ExecutionStatus
    time_used_ms: int | None = None
    memory_used_bytes: int | None = None

    error_traceback: str | None = None

    failed_test_number: int | None = None
    source_code_output: str | None = None
    expected_output: str | None = None
