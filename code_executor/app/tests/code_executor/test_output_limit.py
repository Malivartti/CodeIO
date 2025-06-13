from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_output_limit(self):
        attempt = Attempt(
            id=25,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="print('x' * (20 * 1024 * 1024))\n",
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestJavaScript:
    def test_output_limit(self):
        attempt = Attempt(
            id=26,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code=(
                "const s = 'x'.repeat(1024 * 1024);\n"
                "for (let i = 0; i < 20; i++) console.log(s);\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestCpp:
    def test_output_limit(self):
        attempt = Attempt(
            id=27,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "#include <string>\n"
                "int main() {\n"
                "    std::string s(1024 * 1024, 'x');\n"
                "    for (int i = 0; i < 20; ++i) {\n"
                "        std::cout << s;\n"
                "    }\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestGo:
    def test_output_limit(self):
        attempt = Attempt(
            id=28,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                'import "fmt"\n'
                "func main() {\n"
                "    s := string(make([]byte, 1024*1024, 1024*1024))\n"
                "    for i := 0; i < 20; i++ {\n"
                "        fmt.Print(s)\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestRust:
    def test_output_limit(self):
        attempt = Attempt(
            id=29,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "fn main(){\n"
                "  let chunk = vec![b'x'; 1_048_576];\n"
                '  for _ in 0..20 { print!("{}", '
                "std::str::from_utf8(&chunk).unwrap()); }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        res = AttemptExecutor(attempt).execute()
        assert res.status is ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestC:
    def test_output_limit(self):
        attempt = Attempt(
            id=30,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "#include <string.h>\n"
                "int main(){\n"
                "  char buf[1<<20]; memset(buf,'x',sizeof(buf));\n"
                "  for(int i=0;i<20;i++) fwrite(buf,1,sizeof(buf),stdout);\n"
                "  return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        res = AttemptExecutor(attempt).execute()
        assert res.status is ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestJava:
    def test_output_limit(self):
        attempt = Attempt(
            id=31,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main{\n"
                "  public static void main(String[] a){\n"
                '    String s = "x".repeat(1<<20);\n'
                "    for(int i=0;i<20;i++) System.out.print(s);\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        res = AttemptExecutor(attempt).execute()
        assert res.status is ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestKotlin:
    def test_output_limit(self):
        attempt = Attempt(
            id=32,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main(){\n"
                '  val s = "x".repeat(1 shl 20)\n'
                "  repeat(20){ print(s) }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        res = AttemptExecutor(attempt).execute()
        assert res.status is ExecutionStatus.OUTPUT_LIMIT_EXCEEDED


class TestCSharp:
    def test_output_limit(self):
        attempt = Attempt(
            id=33,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "using System.Text;\n"
                "public class Program{\n"
                "  public static void Main(){\n"
                "    var s = new string('x', 1<<20);\n"
                "    for(int i=0;i<20;i++) Console.Write(s);\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        res = AttemptExecutor(attempt).execute()
        assert res.status is ExecutionStatus.OUTPUT_LIMIT_EXCEEDED
