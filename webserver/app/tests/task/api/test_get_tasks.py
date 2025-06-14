import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_superuser(superuser_client, raw_tasks):
    response = await superuser_client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK

    resp = response.json()
    assert resp["count"] >= len(raw_tasks)


@pytest.mark.asyncio
async def test_user(user_client, raw_tasks):
    response = await user_client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK

    resp = response.json()
    public_ids = {str(t.id) for t in raw_tasks if t.is_public}
    assert resp["count"] == len(public_ids)


@pytest.mark.asyncio
async def test_unauth(unauth_client, raw_tasks):
    response = await unauth_client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK

    resp = response.json()
    public_ids = {str(t.id) for t in raw_tasks if t.is_public}

    assert resp["count"] == len(public_ids)
