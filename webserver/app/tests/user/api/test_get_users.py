import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.core.exceptions import AccessDeniedException


@pytest.mark.asyncio
async def test_superuser(superuser_client):
    response = await superuser_client.get("/users?skip=0&limit=10")

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert "data" in response_data
    assert "count" in response_data
    assert isinstance(response_data["data"], list)
    assert isinstance(response_data["count"], int)


@pytest.mark.asyncio
async def test_user(user_client):
    response = await user_client.get("/users")

    assert response.status_code == AccessDeniedException.default_status_code
    assert response.json()["detail"] == AccessDeniedException.default_message


@pytest.mark.asyncio
async def test_unauth(unauth_client):
    response = await unauth_client.get("/users")

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
