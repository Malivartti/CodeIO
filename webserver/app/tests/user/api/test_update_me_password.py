import pytest
from fastapi import status

from app.user.exceptions import (
    UserIncorrectPasswordException,
)


@pytest.mark.asyncio
async def test_success(user_client, correct_password):
    password_data = {
        "current_password": correct_password,
        "new_password": "new_password",
    }

    response = await user_client.post(
        "/users/me/update-password", json=password_data
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Пароль успешно изменен"


@pytest.mark.asyncio
async def test_wrong_current(user_client, incorrect_password, new_password):
    password_data = {
        "current_password": incorrect_password,
        "new_password": new_password,
    }

    response = await user_client.post(
        "/users/me/update-password", json=password_data
    )
    assert (
        response.status_code
        == UserIncorrectPasswordException.default_status_code
    )
    assert (
        response.json()["detail"]
        == UserIncorrectPasswordException.default_message
    )
