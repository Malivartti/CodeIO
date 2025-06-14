from fastapi import HTTPException


class InternalException(HTTPException):
    default_status_code = 500
    default_message = "Внутренняя ошибка сервера"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class NotFoundException(HTTPException):
    default_status_code = 404

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=self.default_status_code, detail=detail)


class RelationshipAlreadyExistsException(HTTPException):
    default_status_code = 409

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=self.default_status_code, detail=detail)


class RelationshipNotExistsExceptionException(HTTPException):
    default_status_code = 404

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=self.default_status_code, detail=detail)


class AccessDeniedException(HTTPException):
    default_status_code = 403
    default_message = "У вас недостаточно прав"

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=detail or self.default_message,
        )
