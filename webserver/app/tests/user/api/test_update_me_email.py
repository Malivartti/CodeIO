from unittest.mock import patch

import pytest
from fastapi import status

from app.user.exceptions import (
    UserAlreadyExistsException,
    UserSameEmailException,
)


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_update_me_email(mock_send_email, user_client, new_email, user):
    update_data = {"new_email": new_email}

    response = await user_client.post(
        "/users/me/update-email", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    assert (
        response.json()["message"]
        == "Письмо для подтверждения смены email отправлено на вашу почту"
    )

    mock_send_email.assert_called_once_with(
        email_to=user.email,
        subject=mock_send_email.call_args[1]["subject"],
        html_content=mock_send_email.call_args[1]["html_content"],
    )


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_update_me_email_wln_client(
    mock_send_email, user_wln_client, new_email, user_wln
):
    update_data = {"new_email": new_email}

    response = await user_wln_client.post(
        "/users/me/update-email", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    assert (
        response.json()["message"]
        == "Письмо для подтверждения смены email отправлено на вашу почту"
    )

    mock_send_email.assert_called_once_with(
        email_to=user_wln.email,
        subject=mock_send_email.call_args[1]["subject"],
        html_content=mock_send_email.call_args[1]["html_content"],
    )


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_email_already_exists(mock_send_email, user_client, superuser):
    update_data = {"new_email": superuser.email}

    response = await user_client.post(
        "/users/me/update-email", json=update_data
    )
    assert (
        response.status_code == UserAlreadyExistsException.default_status_code
    )
    assert (
        response.json()["detail"] == UserAlreadyExistsException.default_message
    )

    mock_send_email.assert_not_called()


@pytest.mark.asyncio
@patch("app.user.api.send_email")
async def test_same_email(mock_send_email, user_client, user):
    update_data = {"new_email": user.email}

    response = await user_client.post(
        "/users/me/update-email", json=update_data
    )
    assert response.status_code == UserSameEmailException.default_status_code
    assert response.json()["detail"] == UserSameEmailException.default_message

    mock_send_email.assert_not_called()
