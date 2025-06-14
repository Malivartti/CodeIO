import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.core.exceptions import AccessDeniedException


@pytest.mark.asyncio
async def test_superuser(superuser_client, user):
    update_data = {"first_name": "SuperUpdated", "last_name": "SuperUser"}

    response = await superuser_client.patch(
        f"/users/{user.id}", json=update_data
    )

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert response_data["first_name"] == update_data["first_name"]
    assert response_data["last_name"] == update_data["last_name"]


@pytest.mark.asyncio
async def test_user(user_client, user):
    update_data = {"first_name": "User"}

    response = await user_client.patch(f"/users/{user.id}", json=update_data)

    assert response.status_code == AccessDeniedException.default_status_code
    assert response.json()["detail"] == AccessDeniedException.default_message


@pytest.mark.asyncio
async def test_unauth(unauth_client, user):
    update_data = {"first_name": "User"}

    response = await unauth_client.patch(f"/users/{user.id}", json=update_data)

    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
