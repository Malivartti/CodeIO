from fastapi import HTTPException

from app.core.exceptions import AccessDeniedException, NotFoundException


class AttemptNotFoundException(NotFoundException):
    default_message = "Попытка не найдена"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class AttemptAccessDeniedException(AccessDeniedException):
    default_message = "Доступ к данной попытке запрещен"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class AttemptUserMismatch(HTTPException):
    default_status_code = 400
    default_message = "Указанный user_id не совпадает с вашим"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=self.default_message,
        )
