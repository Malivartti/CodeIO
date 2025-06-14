from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import uuid4

import jwt

from app.core.config import settings
from app.core.security import (
    ALGORITHM,
    create_access_token,
    create_email_change_token,
    create_password_reset_token,
    create_token,
    get_password_hash,
    verify_email_change_token,
    verify_password,
    verify_password_reset_token,
    verify_token,
)


def test_create_access_token_success():
    subject = "user123"

    token = create_access_token(subject)

    assert isinstance(token, str)
    assert len(token) > 0

    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == subject
    assert "exp" in decoded


def test_create_access_token_with_uuid():
    subject = uuid4()

    token = create_access_token(str(subject))

    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == str(subject)


def test_get_password_hash_creates_different_hashes():
    password = "testpassword123"

    hash1 = get_password_hash(password)
    hash2 = get_password_hash(password)

    assert hash1 != hash2
    assert isinstance(hash1, str)
    assert isinstance(hash2, str)


def test_verify_password_success():
    password = "mySecurePassword123!"
    hashed = get_password_hash(password)

    assert verify_password(password, hashed) is True


def test_verify_password_failure():
    password = "correctPassword"
    wrong_password = "wrongPassword"
    hashed = get_password_hash(password)

    assert verify_password(wrong_password, hashed) is False


def test_verify_password_empty_strings():
    empty_password = ""
    hashed = get_password_hash("actualPassword")

    assert verify_password(empty_password, hashed) is False


def test_password_hash_format():
    password = "testPassword"
    hashed = get_password_hash(password)

    assert hashed.startswith("$2b$")
    assert len(hashed) == 60  # Стандартная длина bcrypt хеша


def test_create_token_password_reset():
    email = "test@example.com"
    token_type = "password_reset"

    token = create_token(sub=email, token_type=token_type, expires_hours=1)

    assert isinstance(token, str)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == email
    assert decoded["type"] == token_type
    assert "exp" in decoded
    assert "nbf" in decoded


def test_create_token_with_custom_expiration():
    custom_hours = 2
    token = create_token(
        sub="test@example.com",
        token_type="email_change",
        expires_hours=custom_hours,
    )

    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    exp_time = datetime.fromtimestamp(decoded["exp"], timezone.utc)  # noqa: UP017
    nbf_time = datetime.fromtimestamp(decoded["nbf"], timezone.utc)  # noqa: UP017

    time_diff = exp_time - nbf_time
    assert (
        abs(time_diff.total_seconds() - (custom_hours * 3600)) < 60
    )  # Допуск в 1 минуту


def test_create_token_with_extra_data():
    extra_data = {"new_email": "new@example.com", "user_id": "123"}

    token = create_token(
        sub="test@example.com",
        token_type="email_change",
        expires_hours=1,
        extra_data=extra_data,
    )

    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["new_email"] == extra_data["new_email"]
    assert decoded["user_id"] == extra_data["user_id"]


def test_verify_token_success():
    email = "test@example.com"
    token_type = "password_reset"

    token = create_token(sub=email, token_type=token_type, expires_hours=1)
    result = verify_token(token, token_type)

    assert result is not None
    assert result["sub"] == email
    assert result["type"] == token_type


def test_verify_token_wrong_type():
    email = "test@example.com"
    token = create_token(
        sub=email, token_type="password_reset", expires_hours=1
    )

    result = verify_token(token, "email_change")

    assert result is None


def test_verify_token_invalid_token():
    invalid_token = "invalid.token.here"

    result = verify_token(invalid_token, "password_reset")

    assert result is None


def test_verify_token_expired():
    email = "test@example.com"
    token_type = "password_reset"

    with patch("app.core.security.datetime") as mock_datetime:
        past_time = datetime.now(timezone.utc) - timedelta(hours=2)  # noqa: UP017
        mock_datetime.now.return_value = past_time
        mock_datetime.fromtimestamp = datetime.fromtimestamp

        token = create_token(sub=email, token_type=token_type, expires_hours=1)

    result = verify_token(token, token_type)

    assert result is None


def test_create_password_reset_token():
    email = "reset@example.com"

    token = create_password_reset_token(email)

    assert isinstance(token, str)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == email
    assert decoded["type"] == "password_reset"


def test_verify_password_reset_token_success():
    email = "reset@example.com"
    token = create_password_reset_token(email)

    result = verify_password_reset_token(token)

    assert result == email


def test_verify_password_reset_token_invalid():
    invalid_token = "invalid.token"

    result = verify_password_reset_token(invalid_token)

    assert result is None


def test_verify_password_reset_token_wrong_type():
    wrong_type_token = create_token(
        sub="test@example.com", token_type="email_change", expires_hours=1
    )

    result = verify_password_reset_token(wrong_type_token)

    assert result is None


def test_create_email_change_token():
    old_email = "old@example.com"
    new_email = "new@example.com"

    token = create_email_change_token(old_email, new_email)

    assert isinstance(token, str)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == old_email
    assert decoded["type"] == "email_change"
    assert decoded["new_email"] == new_email


def test_verify_email_change_token_success():
    old_email = "old@example.com"
    new_email = "new@example.com"
    token = create_email_change_token(old_email, new_email)

    result = verify_email_change_token(token)

    assert result is not None
    assert result == (old_email, new_email)


def test_verify_email_change_token_invalid():
    invalid_token = "invalid.token"

    result = verify_email_change_token(invalid_token)

    assert result is None


def test_verify_email_change_token_missing_new_email():
    token = create_token(
        sub="test@example.com", token_type="email_change", expires_hours=1
    )

    result = verify_email_change_token(token)

    assert result is None


def test_verify_email_change_token_wrong_type():
    email = "test@example.com"
    wrong_type_token = create_password_reset_token(email)

    result = verify_email_change_token(wrong_type_token)

    assert result is None


def test_create_token_zero_expiration():
    token_type = "password_reset"

    token = create_token(
        sub="test@example.com", token_type=token_type, expires_hours=0
    )

    result = verify_token(token, token_type)
    assert result is None


def test_unicode_email_handling():
    unicode_email = "тест@пример.рф"
    token_type = "password_reset"

    token = create_token(
        sub=unicode_email, token_type=token_type, expires_hours=1
    )
    result = verify_token(token, token_type)

    assert result is not None
    assert result["sub"] == unicode_email


def test_very_long_email():
    long_email = "a" * 100 + "@example.com"
    token_type = "email_change"

    token = create_token(sub=long_email, token_type=token_type, expires_hours=1)
    result = verify_token(token, token_type)

    assert result is not None
    assert result["sub"] == long_email


@patch("app.core.security.settings.SECRET_KEY", "test_secret")
def test_different_secret_key():
    token_type = "password_reset"

    token = create_token(
        sub="test@example.com", token_type=token_type, expires_hours=1
    )

    with patch("app.core.security.settings.SECRET_KEY", "different_secret"):
        result = verify_token(token, token_type)
        assert result is None


def test_password_with_special_characters():
    password = "пароль123!@#$%^&*()_+-=[]{}|;':\",./<>?"
    hashed = get_password_hash(password)

    assert verify_password(password, hashed) is True
    assert verify_password("неправильный_пароль", hashed) is False


def test_empty_password_hash():
    empty_password = ""
    hashed = get_password_hash(empty_password)

    assert isinstance(hashed, str)
    assert len(hashed) > 0
    assert verify_password(empty_password, hashed) is True


def test_token_with_negative_expiration():
    token_type = "password_reset"

    token = create_token(
        sub="test@example.com", token_type=token_type, expires_hours=-1
    )
    result = verify_token(token, token_type)

    assert result is None
