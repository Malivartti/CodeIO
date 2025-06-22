import signal
import tempfile
from collections.abc import Iterable
from pathlib import Path

from .config import (
    COMPILATION_MEMORY_LIMIT_MB,
    COMPILATION_TIME_LIMIT_SECONDS,
    LANG_CONFIG,
)
from .enums import ExecutionStatus, ProgrammingLanguage
from .models import Attempt, AttemptExecutionResult
from .runner import CommandRunner, RunResult

__all__ = ["AttemptExecutor"]


class AttemptExecutor:
    """Инкапсулирует полный цикл: компиляция ➜ запуск тестов ➜ агрегация."""

    _SIG_TLE = {signal.SIGXCPU, signal.SIGTRAP, signal.SIGKILL, signal.SIGFPE}

    def __init__(self, attempt: Attempt):
        self.attempt = attempt
        self.cfg = LANG_CONFIG[attempt.programming_language]

    def execute(self) -> AttemptExecutionResult:
        with tempfile.TemporaryDirectory() as workdir:
            work = Path(workdir)

            filename = (
                f"Main{self.cfg['ext']}"
                if self.attempt.programming_language == ProgrammingLanguage.JAVA
                else f"main{self.cfg['ext']}"
            )
            src = work / filename
            exe = work / "prog"

            src.write_text(self.attempt.source_code)

            # 1) компиляция (если требуется)
            comp_err = self._handle_compile(src, exe)
            if comp_err:
                return comp_err

            # 2) последовательный прогон тестов
            max_t, max_m = 0.0, 0.0
            for idx, (inp, expected_out) in enumerate(
                self.attempt.tests, start=1
            ):
                res_or_metrics = self._run_single_test(
                    idx, inp, expected_out, src, exe
                )
                if isinstance(res_or_metrics, AttemptExecutionResult):
                    return res_or_metrics
                elap, mem = res_or_metrics
                max_t, max_m = max(max_t, elap), max(max_m, mem)

            # 3) все тесты пройдены
            return AttemptExecutionResult(
                id=self.attempt.id,
                status=ExecutionStatus.OK,
                time_used_ms=int(max_t * 1000),
                memory_used_bytes=int(max_m * 1024 * 1024),
            )

    def _compile(self, src: Path, exe: Path) -> RunResult | None:
        if "compile" not in self.cfg:  # интерпретируемый язык
            return None

        cmd = [
            t.format(
                file=str(src),
                exe=str(exe),
                memory=self.attempt.memory_limit_megabytes,
            )
            for t in self.cfg["compile"]
        ]
        return CommandRunner(
            cmd,
            stdin=b"",
            sec=COMPILATION_TIME_LIMIT_SECONDS,
            mem=COMPILATION_MEMORY_LIMIT_MB,
            plang=self.attempt.programming_language,
            is_compilation=True,
        ).run()

    def _handle_compile(
        self, src: Path, exe: Path
    ) -> AttemptExecutionResult | None:
        res = self._compile(src, exe)
        if not res:
            return None  # компиляции не было

        if (
            res.returncode == 0
            and not res.memory_exceeded
            and not res.time_exceeded
        ):
            return None  # всё прошло успешно
        status = (
            ExecutionStatus.MEMORY_LIMIT_EXCEEDED
            if res.memory_exceeded
            else ExecutionStatus.TIME_LIMIT_EXCEEDED
            if res.time_exceeded
            else ExecutionStatus.COMPILATION_ERROR
        )
        return AttemptExecutionResult(
            id=self.attempt.id,
            status=status,
            error_traceback=res.stderr,
        )

    def _build_run_cmd(self, src: Path, exe: Path) -> list[str]:
        return [
            t.format(
                file=str(src),
                exe=str(exe),
                memory=self.attempt.memory_limit_megabytes,
                workdir=str(src.parent),
            )
            for t in self.cfg["run"]
        ]

    def _run_single_test(  # noqa: PLR0911
        self,
        idx: int,
        inp: Iterable[str],
        expected_out: Iterable[str],
        src: Path,
        exe: Path,
    ) -> AttemptExecutionResult | tuple[float, float]:
        cmd = self._build_run_cmd(src, exe)
        res = CommandRunner(
            cmd,
            stdin=("\n".join(inp) + "\n").encode(),
            sec=self.attempt.time_limit_seconds,
            mem=self.attempt.memory_limit_megabytes,
            plang=self.attempt.programming_language,
        ).run()

        # ---------- анализ флагов ----------
        if res.output_exceeded:
            return self._fail(
                idx, ExecutionStatus.OUTPUT_LIMIT_EXCEEDED, output=res.stdout
            )
        if res.memory_exceeded:
            return self._fail(
                idx,
                ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
                mem=res.peak_mb,
            )
        if res.time_exceeded:
            return self._fail(
                idx,
                ExecutionStatus.TIME_LIMIT_EXCEEDED,
                time=res.elapsed,
            )

        # ---------- сигналы / возврат ----------
        if res.returncode < 0:
            return self._signal_failure(idx, res)
        if res.returncode > 0 or res.stderr:
            return self._fail(
                idx,
                ExecutionStatus.RUNTIME_ERROR,
                err=res.stderr,
                code=res.returncode,
            )

        # ---------- сравнение вывода ----------
        actual = " ".join(
            line.strip() for line in res.stdout.splitlines() if line.strip()
        )
        expected = " ".join(
            line.strip() for line in expected_out if line.strip()
        )
        if actual != expected:
            return AttemptExecutionResult(
                id=self.attempt.id,
                status=ExecutionStatus.WRONG_ANSWER,
                failed_test_number=idx,
                source_code_output=res.stdout,
                expected_output="\n".join(list(expected_out)),
            )

        return res.elapsed, res.peak_mb  # успешный тест

    def _fail(
        self,
        idx: int,
        status: ExecutionStatus,
        *,
        err: str | None = None,
        output: str | None = None,
        mem: float | None = None,
        time: float | None = None,
        code: int | None = None,
    ) -> AttemptExecutionResult:
        return AttemptExecutionResult(
            id=self.attempt.id,
            status=status,
            failed_test_number=idx,
            error_traceback=err,
            source_code_output=output,
            memory_used_bytes=int(mem * 1024 * 1024) if mem else None,
            time_used_ms=int(time * 1000) if time else None,
        )

    def _signal_failure(
        self, idx: int, res: RunResult
    ) -> AttemptExecutionResult:
        sig = -res.returncode
        if sig in self._SIG_TLE:
            status = ExecutionStatus.TIME_LIMIT_EXCEEDED
        elif sig == signal.SIGSEGV:
            status = ExecutionStatus.RUNTIME_ERROR
            res.stderr = "Segmentation fault\n" + res.stderr
        elif (
            sig == signal.SIGKILL
            and res.peak_mb > self.attempt.memory_limit_megabytes * 0.9
        ):
            status = ExecutionStatus.MEMORY_LIMIT_EXCEEDED
        else:
            status = ExecutionStatus.RUNTIME_ERROR

        return self._fail(idx, status, err=res.stderr or None)
