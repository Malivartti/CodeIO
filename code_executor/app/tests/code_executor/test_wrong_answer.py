from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=2,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="print(42)\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["1"], ["2"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestJavaScript:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=7,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="console.log(42);\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestCpp:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=12,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main() {\n"
                "    std::cout << 42 << std::endl;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestGo:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=17,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                'import "fmt"\n'
                "func main() {\n"
                "    fmt.Println(42)\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestRust:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=22,
            programming_language=ProgrammingLanguage.RUST,
            source_code=('fn main() {\n    println!("42");\n}\n'),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestC:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=23,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                '    printf("42\\n");\n'
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestJava:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=24,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "    public static void main(String[] args) {\n"
                "        System.out.println(42);\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestKotlin:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=25,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=("fun main() {\n    println(42)\n}\n"),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER


class TestCSharp:
    def test_wrong_answer(self):
        attempt = Attempt(
            id=26,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                "        Console.WriteLine(42);\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.WRONG_ANSWER
