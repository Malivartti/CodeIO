import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.core.exceptions import AccessDeniedException


@pytest.mark.asyncio
async def test_superuser(superuser_client, user):
    response = await superuser_client.delete(f"/users/{user.id}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Пользователь успешно удален"


@pytest.mark.asyncio
async def test_user(user_client, user):
    response = await user_client.delete(f"/users/{user.id}")

    assert response.status_code == AccessDeniedException.default_status_code
    assert response.json()["detail"] == AccessDeniedException.default_message


@pytest.mark.asyncio
async def test_unauth(unauth_client, user):
    response = await unauth_client.delete(f"/users/{user.id}")

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
