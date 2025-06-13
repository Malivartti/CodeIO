from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_success(self):
        attempt = Attempt(
            id=1,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code=(
                "n=int(input().strip())\n"
                "even=[]\n"
                "for _ in range(n):\n"
                "    line=input().strip()\n"
                "    if line:\n"
                "        even.extend(\n"
                "           x for x in map(int,line.split()) if x%2==0\n"
                ")\n"
                "even.sort()\n"
                "print(*even) if even else print(0)\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[
                [["3", "1 4 3 2", "6 5 8", "7 9"], ["2 4 6 8"]],
                [["2", "1 3 5", ""], ["0"]],
            ],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestJavaScript:
    def test_success(self):
        attempt = Attempt(
            id=6,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code=(
                "const fs = require('fs');\n"
                "const input = fs.readFileSync(0, 'utf-8').trim()\n"
                "                               .split('\\n');\n"
                "const n = +input[0];\n"
                "const even = [];\n"
                "for (let i = 1; i <= n; i++) {\n"
                "  if (input[i]) even.push(...input[i].split(' ')\n"
                "                       .map(Number).filter(x=>x%2===0));\n"
                "}\n"
                "even.sort((a,b)=>a-b);\n"
                "console.log(even.join(' ')||0);\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[
                [["3", "1 4 3 2", "6 5 8", "7 9"], ["2 4 6 8"]],
                [["2", "1 3 5", ""], ["0"]],
            ],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestCpp:
    def test_success(self):
        attempt = Attempt(
            id=11,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main(){int n;std::cin>>n;std::cout<<n*n<<'\\n';}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestGo:
    def test_success(self):
        attempt = Attempt(
            id=16,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                'import "fmt"\n'
                "func main(){var n int;fmt.Scan(&n);fmt.Println(n*n)}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestRust:
    def test_success(self):
        attempt = Attempt(
            id=21,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "use std::io::{self, Read};\n"
                "fn main(){\n"
                "  let mut s=String::new();\n"
                "io::stdin().read_to_string(&mut s).unwrap();\n"
                "  let n:i32=s.trim().parse().unwrap();\n"
                '  println!("{}", n*n);\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestC:
    def test_success(self):
        attempt = Attempt(
            id=22,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                'int main(){int n; if(scanf("%d",&n)!=1) return 0;'
                'printf("%d\\n", n*n);}\n'
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestJava:
    def test_success(self):
        attempt = Attempt(
            id=23,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main{\n"
                "  public static void main(String[] args) throws Exception {\n"
                "    java.util.Scanner sc=new java.util.Scanner(System.in);\n"
                "    int n=sc.nextInt();\n"
                "    System.out.println(n*n);\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=52,  # JVM стартует дольше
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestKotlin:
    def test_success(self):
        attempt = Attempt(
            id=24,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "import java.util.Scanner\n"
                "fun main(){val sc=Scanner(System.`in`);"
                "val n=sc.nextInt();println(n*n)}\n"
            ),
            time_limit_seconds=52,
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK


class TestCSharp:
    def test_success(self):
        attempt = Attempt(
            id=25,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program{\n"
                "  public static void Main(){\n"
                "    int n=int.Parse(Console.ReadLine());\n"
                "    Console.WriteLine(n*n);\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=52,
            memory_limit_megabytes=128,
            tests=[[["5"], ["25"]], [["3"], ["9"]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status is ExecutionStatus.OK
