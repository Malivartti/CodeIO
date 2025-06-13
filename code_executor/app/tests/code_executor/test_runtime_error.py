from app.enums import ExecutionStatus, ProgrammingLanguage
from app.executor import AttemptExecutor
from app.models import Attempt


class TestPython:
    def test_value_error(self):
        attempt = Attempt(
            id=3,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="raise ValueError('boom')\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_syntax_error(self):
        attempt = Attempt(
            id=5,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="print(  # missing closing parenthesis\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_type_error(self):
        attempt = Attempt(
            id=6,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="result = 'string' + 42\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_zero_division_error(self):
        attempt = Attempt(
            id=7,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="result = 10 / 0\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_index_error(self):
        attempt = Attempt(
            id=8,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="lst = [1, 2, 3]; print(lst[10])\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_key_error(self):
        attempt = Attempt(
            id=9,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="d = {'a': 1}; print(d['b'])\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_name_error(self):
        attempt = Attempt(
            id=10,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="print(undefined_variable)\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_import_error(self):
        attempt = Attempt(
            id=11,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="import nonexistent_module\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_recursion_error(self):
        attempt = Attempt(
            id=12,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code=("def recursive():\n    recursive()\nrecursive()\n"),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_attribute_error(self):
        attempt = Attempt(
            id=14,
            programming_language=ProgrammingLanguage.PYTHON,
            source_code="obj = None; obj.some_attribute\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestJavaScript:
    def test_error(self):
        attempt = Attempt(
            id=8,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="throw new Error('boom');\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_syntax_error(self):
        attempt = Attempt(
            id=10,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="console.log(;\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_reference_error(self):
        attempt = Attempt(
            id=11,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="console.log(undefinedVariable);\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_type_error(self):
        attempt = Attempt(
            id=12,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="let obj = null; obj.someMethod();\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_range_error(self):
        attempt = Attempt(
            id=13,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="let arr = new Array(-1);\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_uri_error(self):
        attempt = Attempt(
            id=14,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="decodeURI('%');\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_eval_error(self):
        attempt = Attempt(
            id=15,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="eval('var x =;');\n",  # Синтаксическая ошибка в eval
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_recursion_error(self):
        attempt = Attempt(
            id=16,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code=(
                "function recursive() {\n  recursive();\n}\nrecursive();\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_division_by_zero(self):
        attempt = Attempt(
            id=17,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="let result = 1 / 0;"
            "if (!isFinite(result)) throw new Error('Division by zero');\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_property_access_error(self):
        attempt = Attempt(
            id=18,
            programming_language=ProgrammingLanguage.JAVASCRIPT,
            source_code="let obj = undefined; console.log(obj.someProperty);\n",
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestCpp:
    def test_division_by_zero(self):
        attempt = Attempt(
            id=13,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main() {\n"
                "    int a = 1 / 0;\n"
                "    std::cout << a << std::endl;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_segmentation_fault(self):
        attempt = Attempt(
            id=33,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main() {\n"
                "    int* p = nullptr;\n"
                "    *p = 42;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_out_of_range(self):
        attempt = Attempt(
            id=34,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <vector>\n"
                "#include <stdexcept>\n"
                "int main() {\n"
                "    std::vector<int> v = {1, 2, 3};\n"
                "    v.at(10);\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_invalid_argument(self):
        attempt = Attempt(
            id=36,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <stdexcept>\n"
                "#include <string>\n"
                "int main() {\n"
                '    std::stoi("not_a_number");\n'
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_array_out_of_bounds(self):
        attempt = Attempt(
            id=37,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main() {\n"
                "    int arr[3] = {1, 2, 3};\n"
                "    arr[10] = 42;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_null_pointer_dereference_array(self):
        attempt = Attempt(
            id=38,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "int main() {\n"
                "    int* arr = nullptr;\n"
                "    arr[0] = 42;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_stack_overflow(self):
        attempt = Attempt(
            id=40,
            programming_language=ProgrammingLanguage.CPP,
            source_code=(
                "#include <iostream>\n"
                "void recursive() {\n"
                "    recursive();\n"
                "}\n"
                "int main() {\n"
                "    recursive();\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestGo:
    def test_panic_explicit(self):
        attempt = Attempt(
            id=18,
            programming_language=ProgrammingLanguage.GO,
            source_code=('package main\nfunc main() {\n    panic("boom")\n}\n'),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_nil_pointer_dereference(self):
        attempt = Attempt(
            id=42,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\nfunc main() {\n    var p *int\n    *p = 42\n}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_map_access_panic(self):
        attempt = Attempt(
            id=44,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main() {\n"
                "    var m map[string]int\n"
                '    m["key"] = 42\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_division_by_zero(self):
        attempt = Attempt(
            id=45,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main() {\n"
                "    a := 1\n"
                "    b := 0\n"
                "    _ = a / b\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_invalid_type_assertion(self):
        attempt = Attempt(
            id=47,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main() {\n"
                "    var i interface{} = 42\n"
                "    _ = i.(string)\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_closed_channel_panic(self):
        attempt = Attempt(
            id=48,
            programming_language=ProgrammingLanguage.GO,
            source_code=(
                "package main\n"
                "func main() {\n"
                "    ch := make(chan int)\n"
                "    close(ch)\n"
                "    ch <- 42\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestRust:
    def test_panic_explicit(self):
        attempt = Attempt(
            id=31,
            programming_language=ProgrammingLanguage.RUST,
            source_code=('fn main() {\n    panic!("boom");\n}\n'),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_null_pointer_dereference(self):
        attempt = Attempt(
            id=32,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "fn main() {\n"
                "    let p: *const i32 = std::ptr::null();\n"
                '    unsafe { println!("{}", *p); }\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_unwrap_none(self):
        attempt = Attempt(
            id=52,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "fn main() {\n"
                "    let opt: Option<i32> = None;\n"
                "    opt.unwrap();\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_expect_failure(self):
        attempt = Attempt(
            id=53,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "fn main() {\n"
                '    let res: Result<i32, &str> = Err("error");\n'
                '    res.expect("failed");\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_invalid_slice_access(self):
        attempt = Attempt(
            id=55,
            programming_language=ProgrammingLanguage.RUST,
            source_code=(
                "fn main() {\n"
                "    let v = vec![1, 2, 3];\n"
                '    println!("{}", v[10]);\n'
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestC:
    def test_division_by_zero(self):
        attempt = Attempt(
            id=33,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    int a = 1 / 0;\n"
                '    printf("%d\\n", a);\n'
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_segfault_null_pointer(self):
        attempt = Attempt(
            id=34,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    int *p = NULL;\n"
                "    *p = 42;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_array_out_of_bounds(self):
        attempt = Attempt(
            id=35,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    int arr[3] = {1, 2, 3};\n"
                "    arr[10] = 42;\n"
                '    printf("%d\\n", arr[10]);\n'
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_uninitialized_variable(self):
        attempt = Attempt(
            id=36,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    int x;\n"
                '    printf("%d\\n", x * 100);\n'
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_stack_overflow(self):
        attempt = Attempt(
            id=37,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "void recursive() {\n"
                "    char buf[1024 * 1024]; // Consume 1MB stack\n"
                "    recursive();\n"
                "}\n"
                "int main() {\n"
                "    recursive();\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_invalid_pointer_arithmetic(self):
        attempt = Attempt(
            id=38,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    int *p = (int *)0xDEADBEEF;\n"
                "    *p = 42;\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_illegal_instruction(self):
        attempt = Attempt(
            id=41,
            programming_language=ProgrammingLanguage.C,
            source_code=(
                "#include <stdio.h>\n"
                "int main() {\n"
                "    void (*f)() = (void (*)())0xDEADBEEF;\n"
                "    f();\n"
                "    return 0;\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=64,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestJava:
    def test_exception(self):
        attempt = Attempt(
            id=35,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                '    throw new RuntimeException("boom");\n'
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_arithmetic_exception(self):
        attempt = Attempt(
            id=36,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                "    int x = 10 / 0;\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_null_pointer_exception(self):
        attempt = Attempt(
            id=37,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                "    String s = null;\n"
                "    System.out.println(s.length());\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_array_index_out_of_bounds_exception(self):
        attempt = Attempt(
            id=38,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                "    int[] a = new int[3];\n"
                "    System.out.println(a[5]);\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_class_cast_exception(self):
        attempt = Attempt(
            id=39,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                "    Object obj = Integer.valueOf(42);\n"
                "    String s = (String) obj; // бросит ClassCastException\n"
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_number_format_exception(self):
        attempt = Attempt(
            id=40,
            programming_language=ProgrammingLanguage.JAVA,
            source_code=(
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                '    Integer.parseInt("abc");\n'
                "  }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestKotlin:
    def test_exception(self):
        attempt = Attempt(
            id=36,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                'fun main() {\n    throw RuntimeException("boom")\n}\n'
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_arithmetic_exception(self):
        attempt = Attempt(
            id=37,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main() {\n    val x = 10 / 0\n    println(x)\n}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_null_pointer_exception(self):
        attempt = Attempt(
            id=38,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main() {\n"
                "    val str: String? = null\n"
                "    println(str!!.length)\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_array_index_out_of_bounds_exception(self):
        attempt = Attempt(
            id=39,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main() {\n"
                "    val arr = intArrayOf(1, 2, 3)\n"
                "    println(arr[5])\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_class_cast_exception(self):
        attempt = Attempt(
            id=40,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=(
                "fun main() {\n"
                "    val obj: Any = 42\n"
                "    val s = obj as String\n"
                "    println(s)\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_number_format_exception(self):
        attempt = Attempt(
            id=41,
            programming_language=ProgrammingLanguage.KOTLIN,
            source_code=('fun main() {\n    "abc".toInt()\n}\n'),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR


class TestCSharp:
    def test_exception(self):
        attempt = Attempt(
            id=37,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                '        throw new Exception("boom");\n'
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_null_reference_exception(self):
        attempt = Attempt(
            id=39,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                "        string s = null;\n"
                "        Console.WriteLine(s.Length);\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_index_out_of_range_exception(self):
        attempt = Attempt(
            id=40,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                "        int[] a = new int[3];\n"
                "        Console.WriteLine(a[5]);\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_invalid_cast_exception(self):
        attempt = Attempt(
            id=41,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                "        object obj = 42;\n"
                "        string s = (string)obj;\n"
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR

    def test_format_exception(self):
        attempt = Attempt(
            id=42,
            programming_language=ProgrammingLanguage.C_SHARP,
            source_code=(
                "using System;\n"
                "public class Program {\n"
                "    static void Main() {\n"
                '        int.Parse("abc");\n'
                "    }\n"
                "}\n"
            ),
            time_limit_seconds=5,
            memory_limit_megabytes=128,
            tests=[[[], [""]]],
        )
        result = AttemptExecutor(attempt).execute()
        assert result.status == ExecutionStatus.RUNTIME_ERROR
