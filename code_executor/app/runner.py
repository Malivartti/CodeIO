import os
import pathlib
import resource
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from multiprocessing import Manager, Process

from .config import COMPILATION_OUTPUT_LIMIT_MB, OUTPUT_LIMIT_MB
from .enums import ExecutionStatus, ProgrammingLanguage
from .process_monitor import ProcessMonitor

__all__ = ["CommandRunner", "RunResult"]


@dataclass
class RunResult:
    stdout: str = ""
    stderr: str = ""
    elapsed: float = 0.0
    returncode: int = -1
    peak_mb: float = 0.0
    output_exceeded: bool = False
    time_exceeded: bool = False
    memory_exceeded: bool = False
    killed: bool = False
    kill_reason: ExecutionStatus | None = None


class CommandRunner:
    """Запускает внешнюю команду в изоляции, контролируя лимиты."""

    def __init__(
        self,
        cmd: list[str],
        *,
        stdin: bytes,
        sec: int,
        mem: int,
        plang: ProgrammingLanguage,
        is_compilation: bool = False,
    ):
        self.cmd = cmd
        self.stdin = stdin
        self.sec = sec
        self.mem = mem
        self.plang = plang
        self.is_compilation = is_compilation
        self._prepare_env()

    def run(self) -> RunResult:
        with Manager() as manager:
            shared = manager.dict()  # type: ignore[var-annotated]
            p = Process(target=self._isolated, args=(shared,))
            p.start()
            p.join()

            return self._pack(shared)

    def _prepare_env(self) -> None:
        self.env = os.environ.copy()
        if self.plang == ProgrammingLanguage.GO:
            self.env["GOMEMLIMIT"] = f"{self.mem}MiB"
        elif self.plang == ProgrammingLanguage.JAVASCRIPT:
            self.cmd = [c.replace("{memory}", str(self.mem)) for c in self.cmd]
        elif (
            self.plang == ProgrammingLanguage.RUST
            and shutil.which("rustc", path=self.env.get("PATH", "")) is None
        ):
            self.env["PATH"] = (
                f"{pathlib.Path.home()}/.cargo/bin{os.pathsep}{self.env['PATH']}"
            )

    def _isolated(self, shared) -> None:
        start = time.perf_counter()
        try:
            proc = subprocess.Popen(
                self.cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=self.env,
                preexec_fn=lambda: self._set_limits(  # noqa: PLW1509
                    self.sec, self.mem, self.is_compilation
                ),
            )
        except (OSError, subprocess.SubprocessError) as e:
            shared.update(error=f"Process start failed: {e}", elapsed=0.0)
            return

        monitor = ProcessMonitor(proc.pid, self.sec, self.mem)
        monitor.start()

        try:
            out, err = proc.communicate(self.stdin, timeout=self.sec + 1)
        except subprocess.TimeoutExpired:
            proc.kill()
            shared["timeout"] = True
            out, err = b"", b""
        finally:
            elapsed = time.perf_counter() - start
            monitor.stop()
            peak_mb = max(monitor.peak_mb, self._self_peak())

        # результаты
        shared.update(
            stdout=out.decode(errors="ignore").rstrip(),
            stderr=err.decode(errors="ignore").rstrip(),
            elapsed=elapsed,
            returncode=proc.returncode,
            peak_mb=peak_mb,
            killed=monitor.killed,
            kill_reason=monitor.reason,
        )
        # флаги-нарушители
        if len(out) > OUTPUT_LIMIT_MB * 1024 * 1024:
            shared["output_exceeded"] = True
        if elapsed > self.sec:
            shared["time_exceeded"] = True
        if peak_mb > self.mem:
            shared["memory_exceeded"] = True

    @staticmethod
    def _self_peak() -> float:
        return resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss / (
            1024 if sys.platform != "darwin" else 1024 * 1024
        )

    @staticmethod
    def _set_limits(sec: int, mem_mb: int, is_compilation: bool) -> None:
        """Выставить CPU-, память- и output-лимиты для текущего процесса."""
        mem_bytes = mem_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_CPU, (sec, sec))

        if sys.platform == "darwin":  # RLIMIT_AS менее стабилен на macOS
            target = resource.RLIMIT_DATA
        else:
            target = resource.RLIMIT_AS

        try:
            resource.setrlimit(target, (mem_bytes, mem_bytes))
        except (ValueError, OSError):
            pass

        fsize = (
            (COMPILATION_OUTPUT_LIMIT_MB if is_compilation else OUTPUT_LIMIT_MB)
            * 1024
            * 1024
        )
        resource.setrlimit(resource.RLIMIT_FSIZE, (fsize, fsize))

    @staticmethod
    def _pack(shared) -> RunResult:
        return RunResult(
            stdout=shared.get("stdout", ""),
            stderr=shared.get("stderr", "") or shared.get("error", ""),
            elapsed=shared.get("elapsed", 0.0),
            returncode=shared.get("returncode", -1),
            peak_mb=shared.get("peak_mb", 0.0),
            output_exceeded=shared.get("output_exceeded", False),
            time_exceeded=shared.get("time_exceeded", False),
            memory_exceeded=shared.get("memory_exceeded", False),
            killed=shared.get("killed", False),
            kill_reason=shared.get("kill_reason"),
        )
