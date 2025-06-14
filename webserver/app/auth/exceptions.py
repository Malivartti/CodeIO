from fastapi import HTTPException


class UnauthorizedException(HTTPException):
    default_status_code = 401
    default_message = "Необходима авторизация"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class InvalidCredentialsException(HTTPException):
    default_status_code = 401
    default_message = "Неверный email или пароль"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class InvalidTokenException(HTTPException):
    default_status_code = 401
    default_message = "Недействительный токен"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code, detail=self.default_message
        )


class UserNotExistsException(HTTPException):
    default_status_code = 404
    default_message = "Пользователь с таким email не существует"

    def __init__(self) -> None:
        super().__init__(
            status_code=self.default_status_code,
            detail=self.default_message,
        )
