from fastapi import HTTPException


class InvalidCredentialsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=401, detail="Неверный email или пароль")


class InvalidTokenException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=401, detail="Недействительный токен")
