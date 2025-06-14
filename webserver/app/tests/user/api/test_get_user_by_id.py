from uuid import uuid4

import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.core.exceptions import AccessDeniedException
from app.user.exceptions import UserNotFoundException


@pytest.mark.asyncio
async def test_superuser(superuser_client, user):
    response = await superuser_client.get(f"/users/{user.id}")

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert response_data["id"] == str(user.id)
    assert response_data["email"] == user.email


@pytest.mark.asyncio
async def test_superuser_not_found(superuser_client):
    fake_uuid = uuid4()
    response = await superuser_client.get(f"/users/{fake_uuid}")

    assert response.status_code == UserNotFoundException.default_status_code
    assert response.json()["detail"] == UserNotFoundException.default_message


@pytest.mark.asyncio
async def test_user(user_client, user):
    response = await user_client.get(f"/users/{user.id}")

    assert response.status_code == AccessDeniedException.default_status_code
    assert response.json()["detail"] == AccessDeniedException.default_message


@pytest.mark.asyncio
async def test_unauth(unauth_client, user):
    response = await unauth_client.get(f"/users/{user.id}")

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
