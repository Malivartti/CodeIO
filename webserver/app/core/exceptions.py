from fastapi import HTTPException


class InternalException(Exception):
    def __init__(self, message: str = "Внутренняя ошибка сервера") -> None:
        super().__init__(message)


class NotFoundException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=404, detail=detail)
