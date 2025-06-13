from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_memory_limit(self):
        attempt = Attempt(
            id=21,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code=(
                "v = bytearray()\n"
                "while True:\n"
                "    v.extend(bytearray(50*1024*1024))\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=20,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestJavaScript:
    def test_memory_limit(self):
        attempt = Attempt(
            id=22,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code=(
                "let buf = Buffer.alloc(0);\n"
                "while (true) {\n"
                "  buf = Buffer.concat([buf, Buffer.alloc(50*1024*1024)]);\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestCpp:
    def test_memory_limit(self):
        attempt = Attempt(
            id=23,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <vector>\n"
                "int main(){\n"
                "  std::vector<char> v;\n"
                "  v.reserve(50*1024*1024);\n"
                "  while(true) v.insert(v.end(), 50*1024*1024, 0);\n"
                "  return 0;\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestGo:
    def test_memory_limit(self):
        attempt = Attempt(
            id=24,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main(){\n"
                "  var b []byte\n"
                "  for { b = append(b, make([]byte, 50*1024*1024)...) }\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestRust:
    def test_memory_limit(self):
        attempt = Attempt(
            id=25,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "#![allow(unused)]\n"
                "fn main() {\n"
                "    let mut v: Vec<u8> = Vec::new();\n"
                "    v.reserve(50_000_000);\n"
                "    loop { v.extend(vec![0u8; 50_000_000]); }\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestC:
    def test_memory_limit(self):
        attempt = Attempt(
            id=26,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdlib.h>\n"
                "int main(){\n"
                "  char *p;\n"
                "  for(;;){\n"
                "    p = malloc(50*1024*1024);\n"
                "    if (!p) exit(1);\n"
                "    for (size_t i = 0; i < 50*1024*1024; i++) p[i] = 0;\n"
                "  }\n"
                "  return 0;\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestJava:
    def test_memory_limit(self):
        attempt = Attempt(
            id=27,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "import java.util.*;\n"
                "public class Main{\n"
                "  public static void main(String[] a){\n"
                "    var list = new ArrayList<byte[]>();\n"
                "    while(true){ list.add(new byte[50_000_000]); }\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestKotlin:
    def test_memory_limit(self):
        attempt = Attempt(
            id=28,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main(){\n"
                "  val list = ArrayList<ByteArray>()\n"
                "  while(true) list.add(ByteArray(50_000_000))\n"
                "}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestCSharp:
    def test_memory_limit(self):
        attempt = Attempt(
            id=29,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System; using System.Collections.Generic;\n"
                "class Program{ static void Main(){\n"
                "  var list = new List<byte[]>();\n"
                "  while(true) list.Add(new byte[50_000_000]);\n"
                "}}\n"
            ),
            time_limit_seconds=10,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.MEMORY_LIMIT_EXCEEDED
