import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException


@pytest.mark.asyncio
async def test_user(user_client, user):
    response = await user_client.get("/users/me")

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert response_data["id"] == str(user.id)
    assert response_data["email"] == user.email


@pytest.mark.asyncio
async def test_unauth(unauth_client, user):
    response = await unauth_client.get("/users/me")

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
