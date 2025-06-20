from enum import StrEnum


class ProgrammingLanguage(StrEnum):
    PYTHON = "Python"
    JAVASCRIPT = "JavaScript"
    CPP = "C++"
    GO = "Go"
    RUST = "Rust"
    C = "C"
    JAVA = "Java"
    KOTLIN = "Kotlin"
    C_SHARP = "C#"


class ExecutionStatus(StrEnum):
    OK = "Ok"
    COMPILATION_ERROR = "Compilation error"
    WRONG_ANSWER = "Wrong answer"
    TIME_LIMIT_EXCEEDED = "Time-limit exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory limit exceeded"
    OUTPUT_LIMIT_EXCEEDED = "Output limit exceeded"
    RUNTIME_ERROR = "Run-time error"
