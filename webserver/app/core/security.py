from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

from .config import settings

ALGORITHM = "HS256"

TokenType = Literal["access", "refresh", "password_reset", "email_change"]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )


def create_token(
    *,
    sub: str,
    token_type: TokenType,
    expires_hours: int,
    extra_data: dict[str, Any] | None = None,
) -> str:
    delta = timedelta(hours=expires_hours)
    now = datetime.now(timezone.utc)  # noqa: UP017
    expires = now + delta
    exp = expires.timestamp()

    payload = {
        "exp": exp,
        "nbf": now,
        "sub": sub,
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


def create_access_token(user_id: str) -> str:
    return create_token(
        sub=user_id,
        token_type="access",
        expires_hours=settings.ACCESS_TOKEN_EXPIRE_HOURS,
    )


def create_refresh_token(user_id: str) -> str:
    return create_token(
        sub=user_id,
        token_type="access",
        expires_hours=settings.REFRESH_TOKEN_EXPIRE_HOURS,
    )


def verify_refresh_token(token: str) -> str | None:
    token_data = verify_token(token, "refresh")
    return str(token_data["sub"]) if token_data else None


def create_password_reset_token(email: str) -> str:
    return create_token(
        sub=email,
        token_type="password_reset",
        expires_hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
    )


def verify_password_reset_token(token: str) -> str | None:
    token_data = verify_token(token, "password_reset")
    return str(token_data["sub"]) if token_data else None


def create_email_change_token(email: str, new_email: str) -> str:
    return create_token(
        sub=email,
        token_type="email_change",
        expires_hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
        extra_data={"new_email": new_email},
    )


def verify_email_change_token(token: str) -> tuple[str, str] | None:
    token_data = verify_token(token, "email_change")
    if token_data and "new_email" in token_data:
        return str(token_data["sub"]), str(token_data["new_email"])
    return None
