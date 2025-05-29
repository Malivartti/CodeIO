import inspect
import logging
from typing import Literal, Protocol

from sqlalchemy.exc import IntegrityError, SQLAlchemyError

DEFAULT_EXCEPTION_PREFIXES = {
    IntegrityError: "Нарушение уникальности",
    SQLAlchemyError: "Ошибка базы данных",
}


def get_prefix_for_exception(
    exc: Exception, exception_prefixes: dict[type[Exception], str]
) -> str:
    for exc_type, prefix in exception_prefixes.items():
        if isinstance(exc, exc_type):
            return prefix
    return "Неожиданная ошибка"


class LogCallable(Protocol):
    def __call__(
        self,
        exc: Exception,
        *,
        level: Literal["warning", "error"] = "error",
        additional_info: str = "",
    ) -> None: ...


def create_log(
    name: str, extra_exceptions: dict[type[Exception], str] | None = None
) -> LogCallable:
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(name)

    exception_prefixes = DEFAULT_EXCEPTION_PREFIXES.copy()
    if extra_exceptions:
        exception_prefixes.update(extra_exceptions)

    def log(
        exc: Exception,
        *,
        level: Literal["warning", "error"] = "error",
        additional_info: str = "",
    ) -> None:
        try:
            caller_frame = inspect.stack()[1]
            func_name = caller_frame.function
        except (IndexError, AttributeError):
            func_name = "unknown_function"

        prefix = get_prefix_for_exception(exc, exception_prefixes)

        func_info = func_name
        if additional_info:
            func_info = f"{func_name} {additional_info}"

        if level == "warning":
            logger.warning("%s в %s", prefix, func_info)
        if level == "error":
            logger.error("%s в %s", prefix, func_info, exc_info=exc)

    return log
