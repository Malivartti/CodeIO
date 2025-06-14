import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_success(unauth_client, new_email, new_password):
    user_data = {
        "email": new_email,
        "first_name": "Signup",
        "last_name": "User",
        "password": new_password,
    }

    response = await unauth_client.post("/signup", json=user_data)

    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert "access_token" in response_data
    assert "refresh_token" in response_data
