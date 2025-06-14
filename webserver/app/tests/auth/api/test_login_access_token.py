from unittest.mock import AsyncMock

import pytest
from fastapi import status

from app.auth.exceptions import (
    InvalidCredentialsException,
)


@pytest.mark.asyncio
async def test_login_access_token(unauth_client, user, correct_password):
    form_data = {"username": user.email, "password": correct_password}

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert "access_token" in response_data
    assert response_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_access_token_invalid_credentials(
    unauth_client, store, user, incorrect_password
):
    store.user.authenticate = AsyncMock(
        side_effect=ValueError("Invalid credentials")
    )

    form_data = {
        "username": user.email,
        "password": incorrect_password,
    }

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert (
        response.status_code == InvalidCredentialsException.default_status_code
    )
    assert (
        response.json()["detail"] == InvalidCredentialsException.default_message
    )


@pytest.mark.asyncio
async def test_login_access_token_missing_username(unauth_client):
    form_data = {"password": "somepassword"}

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_login_access_token_missing_password(unauth_client):
    form_data = {"username": "test@email.com"}

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_login_access_token_empty_credentials(unauth_client):
    form_data = {"username": "", "password": ""}

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert (
        response.status_code == InvalidCredentialsException.default_status_code
    )
    assert (
        response.json()["detail"] == InvalidCredentialsException.default_message
    )


@pytest.mark.asyncio
async def test_login_access_token_nonexistent_user(
    unauth_client, not_existent_email, correct_password
):
    form_data = {
        "username": not_existent_email,
        "password": correct_password,
    }

    response = await unauth_client.post(
        "/login/access-token",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert (
        response.status_code == InvalidCredentialsException.default_status_code
    )
    assert (
        response.json()["detail"] == InvalidCredentialsException.default_message
    )
