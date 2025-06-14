from unittest.mock import patch

import pytest
from fastapi import status

from app.auth.exceptions import InvalidTokenException
from app.core.security import create_email_change_token
from app.user.exceptions import (
    UserAlreadyExistsException,
    UserEmailMismatchException,
)


@pytest.mark.asyncio
async def test_success(user_client, new_email, user):
    update_data = {
        "token": create_email_change_token(
            email=user.email, new_email=new_email
        )
    }
    response = await user_client.post(
        "/users/me/update-email/confirm", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Email успешно изменен"


@pytest.mark.asyncio
async def test_invalide_token(user_client):
    update_data = {"token": "123"}
    response = await user_client.post(
        "/users/me/update-email/confirm", json=update_data
    )
    assert response.status_code == InvalidTokenException.default_status_code
    assert response.json()["detail"] == InvalidTokenException.default_message


@pytest.mark.asyncio
async def test_mismatch_email(user_client, not_existent_email, new_email):
    update_data = {
        "token": create_email_change_token(
            email=not_existent_email, new_email=new_email
        )
    }

    response = await user_client.post(
        "/users/me/update-email/confirm", json=update_data
    )
    assert (
        response.status_code == UserEmailMismatchException.default_status_code
    )
    assert (
        response.json()["detail"] == UserEmailMismatchException.default_message
    )


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_email_already_exists(
    mock_send_email, user_client, user, superuser
):
    update_data = {
        "token": create_email_change_token(
            email=user.email, new_email=superuser.email
        )
    }

    response = await user_client.post(
        "/users/me/update-email/confirm", json=update_data
    )
    assert (
        response.status_code == UserAlreadyExistsException.default_status_code
    )
    assert (
        response.json()["detail"] == UserAlreadyExistsException.default_message
    )

    mock_send_email.assert_not_called()
