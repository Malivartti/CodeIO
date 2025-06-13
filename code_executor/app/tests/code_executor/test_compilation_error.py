from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestCpp:
    def test_compilation_error(self):
        attempt = Attempt(
            id=15,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "int main() {\n"
                '    std::cout << "Hello" << std::endl  // missing semicolon\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.COMPILATION_ERROR

    def test_compilation_time_limit(self):
        attempt = Attempt(
            id=31,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "template<int N> struct S { int a[N]; S<N+1> b; };\n"
                "int main() { S<1000000> s; std::cout << 0; }\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], ["0"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.COMPILATION_ERROR


class TestGo:
    def test_compilation_error(self):
        attempt = Attempt(
            id=20,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main() {\n"
                '    fmt.Println("Hello")  // fmt not imported\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.COMPILATION_ERROR

    def test_compilation_memory_limit(self):
        attempt = Attempt(
            id=32,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                'import "fmt"\n'
                "func main() {\n"
                "    type Big struct { data [1000000]int }\n"
                "    var s [1000000]Big\n"
                "    fmt.Println(len(s))\n"
                "}\n"
            ),
            time_limit_seconds=52,
            memory_limit_megabytes=64,
            tests=[[[], ["1000000"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.MEMORY_LIMIT_EXCEEDED


class TestRust:
    def test_compilation_error(self):
        attempt = Attempt(
            id=40,
            programming_language=ProgrammingLanguage.RUST,
            source_code="fn main(){ let x = ; }",  # синтаксическая ошибка
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        assert (
            AttemptExecutor(attempt).execute().status
            is ExecutionStatus.COMPILATION_ERROR
        )


class TestC:
    def test_compilation_error(self):
        attempt = Attempt(
            id=42,
            programming_language=ProgrammingLanguage.C,
            source_code="""
                #include <stdio.h>
                int main(){
                    printf("Hello")             /* нет ; */
                }
            """,
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        assert (
            AttemptExecutor(attempt).execute().status
            is ExecutionStatus.COMPILATION_ERROR
        )


class TestJava:
    def test_compilation_error(self):
        attempt = Attempt(
            id=44,
            programming_language=ProgrammingLanguage.JAVA,
            source_code="""
                public class Main{
                    public static void main(String[] a){
                        System.out.println("Hi")   // пропущен ;
                    }
                }
            """,
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        assert (
            AttemptExecutor(attempt).execute().status
            is ExecutionStatus.COMPILATION_ERROR
        )


class TestKotlin:
    def test_compilation_error(self):
        attempt = Attempt(
            id=46,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code="""
                fun main(){
                    println("Hi"            // нет закрывающей скобки
                }
            """,
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        assert (
            AttemptExecutor(attempt).execute().status
            is ExecutionStatus.COMPILATION_ERROR
        )


class TestCSharp:
    def test_compilation_error(self):
        attempt = Attempt(
            id=48,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code="""
                using System;
                public class Program{
                    static void Main(){
                        Console.WriteLine("Hi"   // нет закрытия
                    }
                }
            """,
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        assert (
            AttemptExecutor(attempt).execute().status
            is ExecutionStatus.COMPILATION_ERROR
        )
