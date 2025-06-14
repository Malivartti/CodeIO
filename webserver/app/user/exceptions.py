from fastapi import HTTPException

from app.core.exceptions import NotFoundException


class UserInactiveException(HTTPException):
    default_status_code = 403
    default_message = "Учетная запись не активна"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserAlreadyExistsException(HTTPException):
    default_status_code = 409
    default_message = "Пользователь с таким email уже существует"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserSameEmailException(HTTPException):
    default_status_code = 400
    default_message = "Новый email не может совпадать с текущим"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserEmailMismatchException(HTTPException):
    default_status_code = 400
    default_message = "Указанный email не совпадает с вашим"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=self.default_message,
        )


class UserIncorrectPasswordException(HTTPException):
    default_status_code = 400
    default_message = "Неправильный пароль"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserSamePasswordException(HTTPException):
    default_status_code = 400
    default_message = "Новый пароль не может совпадать с текущим"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserNotFoundException(NotFoundException):
    default_message = "Пользователь не найден"

    def __init__(self) -> None:
        super().__init__(detail=self.default_message)
