import time
from multiprocessing import Manager, Process

import psutil

from .enums import ExecutionStatus

__all__ = ["ProcessMonitor"]


def _monitor(pid: int, time_limit: float, mem_limit_mb: int, shared) -> None:
    start = time.perf_counter()
    max_rss_mb = 0.0
    try:
        proc = psutil.Process(pid)
        while proc.is_running() and proc.status() != psutil.STATUS_ZOMBIE:
            elapsed = time.perf_counter() - start
            if elapsed > time_limit:
                _kill(
                    proc,
                    shared,
                    ExecutionStatus.TIME_LIMIT_EXCEEDED,
                    max_rss_mb,
                )
                return
            mem_bytes = proc.memory_info().rss  # уже в байтах
            mem_mb = mem_bytes / (1024 * 1024)
            max_rss_mb = max(max_rss_mb, mem_mb)
            if mem_mb > mem_limit_mb:
                _kill(
                    proc,
                    shared,
                    ExecutionStatus.MEMORY_LIMIT_EXCEEDED,
                    max_rss_mb,
                )
                return
            time.sleep(0.001)
    except psutil.NoSuchProcess:
        pass
    finally:
        shared["peak"] = max_rss_mb


def _kill(
    proc: psutil.Process, shared, reason: ExecutionStatus, peak: float
) -> None:
    proc.kill()
    shared.update(killed=True, reason=reason, peak=peak)


class ProcessMonitor:
    """Следит за временем и пиковым RSS дочернего процесса."""

    def __init__(self, pid: int, time_limit: float, mem_limit_mb: int):
        self.pid = pid
        self.time_limit = time_limit + 0.5  # небольшой запас
        self.mem_limit_mb = mem_limit_mb
        self._mgr = Manager()
        self._shared = self._mgr.dict()  # type: ignore[var-annotated]
        self._proc: Process | None = None

    def start(self) -> None:
        self._proc = Process(
            target=_monitor,
            args=(self.pid, self.time_limit, self.mem_limit_mb, self._shared),
        )
        self._proc.start()

    def stop(self) -> None:
        if self._proc is not None:
            self._proc.terminate()
            self._proc.join(timeout=1)

    @property
    def peak_mb(self) -> float:
        """Возвращает пиковое использование памяти в мегабайтах"""
        return self._shared.get("peak", 0.0)

    @property
    def peak_bytes(self) -> int:
        """Возвращает пиковое использование памяти в байтах"""
        return int(self.peak_mb * 1024 * 1024)

    @property
    def killed(self) -> bool:
        return self._shared.get("killed", False)

    @property
    def reason(self) -> ExecutionStatus | None:
        return self._shared.get("reason")
