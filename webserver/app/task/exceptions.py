from fastapi import HTTPException

from app.core.exceptions import (
    AccessDeniedException,
    NotFoundException,
    RelationshipAlreadyExistsException,
    RelationshipNotExistsExceptionException,
)


class TaskNotFoundException(NotFoundException):
    default_message = "Задача не найдена"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class TagNotFoundException(NotFoundException):
    default_message = "Тег не найден"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class TaskAlreadyExistsException(HTTPException):
    default_status_code = 409
    default_message = "Задача с таким названием уже существует"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=self.default_message,
        )


class TagAlreadyExistsException(HTTPException):
    default_status_code = 409
    default_message = "Тег с таким именем уже существует"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=self.default_message,
        )


class TastTagRelationshipAlreadyExistsException(
    RelationshipAlreadyExistsException
):
    default_message = "Связь между задачей и тегом уже существует"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class TastTagRelationshipNotExistsExceptionException(
    RelationshipNotExistsExceptionException
):
    default_message = "Связь между задачей и тегом не существует"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)


class TaskAccessDeniedException(AccessDeniedException):
    default_message = "Доступ к данной задаче запрещен"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)
