from typing import Final

from .enums import ProgrammingLanguage

Command = list[str]

OUTPUT_LIMIT_MB: Final[int] = 16
COMPILATION_TIME_LIMIT_SECONDS: Final[int] = 60
COMPILATION_MEMORY_LIMIT_MB: Final[int] = 2048
COMPILATION_OUTPUT_LIMIT_MB: Final[int] = 64

LANG_CONFIG: Final[dict[ProgrammingLanguage, dict[str, str | Command]]] = {
    ProgrammingLanguage.PYTHON: {
        "ext": ".py",
        "run": ["python3", "{file}"],
    },
    ProgrammingLanguage.JAVASCRIPT: {
        "ext": ".js",
        "run": ["node", "--max-old-space-size={memory}", "{file}"],
    },
    ProgrammingLanguage.CPP: {
        "ext": ".cpp",
        "compile": [
            "g++",
            "-O0",
            "-std=c++17",
            "-fsanitize=undefined",
            "-fno-sanitize-recover=undefined",
            "{file}",
            "-o",
            "{exe}",
        ],
        "run": ["{exe}"],
    },
    ProgrammingLanguage.GO: {
        "ext": ".go",
        "compile": [
            "env",
            "CGO_ENABLED=0",
            "GOMAXPROCS=2",
            "GOMEMLIMIT={memory}MiB",
            "go",
            "build",
            "-o",
            "{exe}",
            "{file}",
        ],
        "run": ["env", "GOMEMLIMIT={memory}MiB", "{exe}"],
    },
    ProgrammingLanguage.RUST: {
        "ext": ".rs",
        "compile": ["rustc", "{file}", "-O", "-o", "{exe}"],
        "run": ["{exe}"],
    },
    ProgrammingLanguage.C: {
        "ext": ".c",
        "compile": [
            "gcc",
            "{file}",
            "-O0",
            "-pipe",
            "-std=c17",
            "-fsanitize=undefined",
            "-fno-sanitize-recover=undefined",
            "-o",
            "{exe}",
        ],
        "run": ["{exe}"],
    },
    ProgrammingLanguage.JAVA: {
        "ext": ".java",
        "compile": ["javac", "-J-Xmx{memory}m", "{file}"],
        "run": [
            "java",
            "-Xmx{memory}m",
            "-XX:+UseSerialGC",
            "-cp",
            "{workdir}",
            "-enableassertions",
            "Main",
        ],
    },
    ProgrammingLanguage.KOTLIN: {
        "ext": ".kt",
        "compile": [
            "kotlinc",
            "-J-Xmx{memory}m",
            "-include-runtime",
            "-d",
            "{exe}.jar",
            "{file}",
        ],
        "run": [
            "java",
            "-Xmx{memory}m",
            "-XX:+UseSerialGC",
            "-jar",
            "{exe}.jar",
        ],
    },
    ProgrammingLanguage.C_SHARP: {
        "ext": ".cs",
        "compile": ["mcs", "{file}", "-optimize+", "-out:{exe}.exe"],
        "run": ["mono", "{exe}.exe"],
    },
}
