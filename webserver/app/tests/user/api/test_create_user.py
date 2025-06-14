from unittest.mock import patch

import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.core.exceptions import AccessDeniedException


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_superuser(
    mock_send_email, superuser_client, new_email, new_password
):
    user_data = {
        "email": new_email,
        "first_name": "New",
        "last_name": "User",
        "password": new_password,
        "is_active": True,
        "is_superuser": False,
    }

    response = await superuser_client.post("/users", json=user_data)

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert response_data["email"] == user_data["email"]
    assert response_data["first_name"] == user_data["first_name"]
    assert response_data["last_name"] == user_data["last_name"]

    mock_send_email.assert_called_once_with(
        email_to=new_email,
        subject=mock_send_email.call_args[1]["subject"],
        html_content=mock_send_email.call_args[1]["html_content"],
    )


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_superuser_emails_disabled(
    mock_send_email, superuser_client, new_email, new_password, monkeypatch
):
    monkeypatch.setattr("app.core.config.settings.SMTP_HOST", None)
    monkeypatch.setattr("app.core.config.settings.EMAILS_FROM_EMAIL", None)

    user_data = {
        "email": new_email,
        "first_name": "Test",
        "last_name": "User",
        "password": new_password,
        "is_active": True,
        "is_superuser": False,
    }

    response = await superuser_client.post("/users", json=user_data)
    assert response.status_code == status.HTTP_200_OK

    mock_send_email.assert_not_called()


@pytest.mark.asyncio
async def test_user(user_client, new_email, new_password):
    user_data = {
        "email": new_email,
        "first_name": "New",
        "last_name": "User",
        "password": new_password,
        "is_active": True,
        "is_superuser": False,
    }

    response = await user_client.post("/users", json=user_data)

    assert response.status_code == AccessDeniedException.default_status_code
    assert response.json()["detail"] == AccessDeniedException.default_message


@pytest.mark.asyncio
async def test_unauth(unauth_client, new_email, new_password):
    user_data = {
        "email": new_email,
        "first_name": "New",
        "last_name": "User",
        "password": new_password,
        "is_active": True,
        "is_superuser": False,
    }

    response = await unauth_client.post("/users", json=user_data)

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
