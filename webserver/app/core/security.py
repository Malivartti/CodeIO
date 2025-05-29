from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

from .config import settings

ALGORITHM = "HS256"

TokenType = Literal["password_reset", "email_change"]


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta  # noqa: UP017
    to_encode: dict[str, datetime | str] = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )


def create_token(
    email: str,
    token_type: TokenType,
    expires_hours: int | None = None,
    extra_data: dict[str, Any] | None = None,
) -> str:
    if expires_hours is None:
        expires_hours = settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS

    delta = timedelta(hours=expires_hours)
    now = datetime.now(timezone.utc)  # noqa: UP017
    expires = now + delta
    exp = expires.timestamp()

    payload = {
        "exp": exp,
        "nbf": now,
        "sub": email,
        "type": token_type,
    }

    if extra_data:
        payload.update(extra_data)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, expected_type: TokenType) -> dict[str, Any] | None:
    try:
        decoded_token: dict[str, Any] = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )

        if decoded_token.get("type") != expected_type:
            return None

        return decoded_token  # noqa: TRY300
    except InvalidTokenError:
        return None


def create_password_reset_token(email: str) -> str:
    return create_token(email, "password_reset")


def verify_password_reset_token(token: str) -> str | None:
    token_data = verify_token(token, "password_reset")
    return str(token_data["sub"]) if token_data else None


def create_email_change_token(email: str, new_email: str) -> str:
    return create_token(
        email, "email_change", extra_data={"new_email": new_email}
    )


def verify_email_change_token(token: str) -> tuple[str, str] | None:
    token_data = verify_token(token, "email_change")
    if token_data and "new_email" in token_data:
        return str(token_data["sub"]), str(token_data["new_email"])
    return None
