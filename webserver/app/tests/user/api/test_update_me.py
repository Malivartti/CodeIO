import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException


@pytest.mark.asyncio
async def test_user(user_client):
    update_data = {"first_name": "UpdatedFirst", "last_name": "UpdatedLast"}

    response = await user_client.patch("/users/me", json=update_data)

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert response_data["first_name"] == update_data["first_name"]
    assert response_data["last_name"] == update_data["last_name"]


@pytest.mark.asyncio
async def test_unauth(unauth_client):
    update_data = {"first_name": "UpdatedFirst", "last_name": "UpdatedLast"}

    response = await unauth_client.patch("/users/me", json=update_data)

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
