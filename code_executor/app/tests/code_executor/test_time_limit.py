from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_time_limit(self):
        attempt = Attempt(
            id=4,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="while True: pass\n",
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED

    def test_combined_limits(self):
        attempt = Attempt(
            id=38,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code=(
                "data = bytearray(100 * 1024 * 1024)\nwhile True:\n    pass\n"
            ),
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status in [
            ExecutionStatus.TIME_LIMIT_EXCEEDED,
            ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
        ]


class TestJavaScript:
    def test_time_limit(self):
        attempt = Attempt(
            id=9,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="while (true) {}\n",
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestCpp:
    def test_time_limit(self):
        attempt = Attempt(
            id=14,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "int main() {\n    while (true) {}\n    return 0;\n}\n"
            ),
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestGo:
    def test_time_limit(self):
        attempt = Attempt(
            id=19,
            programming_language=ProgrammingLanguage.GO,
            source_code=("package main\nfunc main() {\n    for {\n    }\n}\n"),
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


# В существующий файл tests/test_runtime_error.py
class TestRust:
    def test_time_limit(self):
        attempt = Attempt(
            id=26,
            programming_language=ProgrammingLanguage.RUST,
            source_code=("fn main() {\n    loop {}\n}\n"),
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestC:
    def test_time_limit(self):
        attempt = Attempt(
            id=27,
            programming_language=ProgrammingLanguage.C,
            source_code=("int main() {\n    while(1){}\n    return 0;\n}\n"),
            time_limit_seconds=2,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestJava:
    def test_time_limit(self):
        attempt = Attempt(
            id=28,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "    public static void main(String[] args) {\n"
                "        while(true) {}\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=2,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestKotlin:
    def test_time_limit(self):
        attempt = Attempt(
            id=29,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=("fun main() {\n    while(true) {}\n}\n"),
            time_limit_seconds=2,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED


class TestCSharp:
    def test_time_limit(self):
        attempt = Attempt(
            id=30,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "public class Program {\n"
                "    static void Main() {\n"
                "        while(true) {}\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=2,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED
