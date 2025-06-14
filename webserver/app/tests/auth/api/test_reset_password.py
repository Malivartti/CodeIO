import pytest
from fastapi import status

from app.auth.exceptions import (
    InvalidTokenException,
    UserNotExistsException,
)
from app.core.security import create_password_reset_token
from app.user.exceptions import UserInactiveException


@pytest.mark.asyncio
async def test_reset_password(unauth_client, user, new_password, store):
    user_hashed_password = user.hashed_password

    update_data = {
        "token": create_password_reset_token(email=user.email),
        "new_password": new_password,
    }

    response = await unauth_client.post("/reset-password", json=update_data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Пароль успешно изменен"

    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user.hashed_password != user_hashed_password


@pytest.mark.asyncio
async def test_reset_password_invalide_token(
    unauth_client, user, new_password, store
):
    user_hashed_password = user.hashed_password

    update_data = {
        "token": "123",
        "new_password": new_password,
    }

    response = await unauth_client.post("/reset-password", json=update_data)

    assert response.status_code == InvalidTokenException.default_status_code
    assert response.json()["detail"] == InvalidTokenException.default_message

    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user.hashed_password == user_hashed_password


@pytest.mark.asyncio
async def test_reset_password_not_existent_email(
    unauth_client, user, new_password, not_existent_email, store
):
    user_hashed_password = user.hashed_password

    update_data = {
        "token": create_password_reset_token(email=not_existent_email),
        "new_password": new_password,
    }

    response = await unauth_client.post("/reset-password", json=update_data)

    assert response.status_code == UserNotExistsException.default_status_code
    assert response.json()["detail"] == UserNotExistsException.default_message

    db_user = await store.user.get_user_by_id(user_id=user.id)
    assert db_user.hashed_password == user_hashed_password


@pytest.mark.asyncio
async def test_reset_password_inactive_user(
    unauth_client, inactive_user, new_password, store
):
    user_hashed_password = inactive_user.hashed_password

    update_data = {
        "token": create_password_reset_token(email=inactive_user.email),
        "new_password": new_password,
    }

    response = await unauth_client.post("/reset-password", json=update_data)

    assert response.status_code == UserInactiveException.default_status_code
    assert response.json()["detail"] == UserInactiveException.default_message

    db_user = await store.user.get_user_by_id(user_id=inactive_user.id)
    assert db_user.hashed_password == user_hashed_password
