from uuid import UUID

from sqlmodel import Field, SQLModel


# Generic message
class Message(SQLModel):
    message: str


class AccessToken(SQLModel):
    access_token: str
    token_type: str = "bearer"


class Token(SQLModel):
    token: str


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: UUID | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
