from unittest.mock import patch

import pytest
from fastapi import status

from app.auth.exceptions import (
    UserNotExistsException,
)


@pytest.mark.asyncio
@patch("app.auth.api.send_email")
async def test_recover_password(mock_send_email, unauth_client, user):
    response = await unauth_client.post(f"/password-recovery/{user.email}")

    assert response.status_code == status.HTTP_200_OK
    assert (
        response.json()["message"]
        == "Письмо для восстановления пароля отправлено на почту"
    )

    mock_send_email.assert_called_once_with(
        email_to=user.email,
        subject=mock_send_email.call_args[1]["subject"],
        html_content=mock_send_email.call_args[1]["html_content"],
    )


@pytest.mark.asyncio
@patch("app.auth.api.send_email")
async def test_recover_password_not_existent_email(
    mock_send_email, unauth_client, not_existent_email
):
    response = await unauth_client.post(
        f"/password-recovery/{not_existent_email}"
    )

    assert response.status_code == UserNotExistsException.default_status_code
    assert response.json()["detail"] == UserNotExistsException.default_message

    mock_send_email.assert_not_called()
