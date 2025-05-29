from fastapi import HTTPException

from app.core.exceptions import NotFoundException


class UserInactiveException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=403, detail="Учетная запись не активна")


class UserNotExistsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=404,
            detail="Пользователь с таким email не существует",
        )


class UserAlreadyExistsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=409,
            detail="Пользователь с таким email уже существует",
        )


class UserSameEmailException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=400, detail="Новый email не может совпадать с текущим"
        )


class UserEmailMismatchException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=400,
            detail="Указанный email не совпадает с вашим",
        )


class UserIncorrectPasswordException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Неправильный пароль")


class UserSamePasswordException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=400, detail="Новый пароль не может совпадать с текущим"
        )


class UserNotFoundException(NotFoundException):
    default_message = "Пользователь не найден"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)
