from enum import StrEnum


class ProgrammingLanguage(StrEnum):
    PYTHON = "python"
    JAVASCRIPT = "javaScript"
    CPP = "c++"
    GO = "go"
    RUST = "rust"
    C = "c"
    JAVA = "java"
    KOTLIN = "kotlin"
    C_SHARP = "c#"


class ExecutionStatus(StrEnum):
    OK = "OK"
    COMPILATION_ERROR = "Compilation error"
    WRONG_ANSWER = "Wrong answer"
    TIME_LIMIT_EXCEEDED = "Time-limit exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory limit exceeded"
    OUTPUT_LIMIT_EXCEEDED = "Output limit exceeded"
    RUNTIME_ERROR = "Run-time error"
