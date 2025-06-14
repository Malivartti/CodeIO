import pytest
from fastapi import status

from app.task.exceptions import TaskNotFoundException


@pytest.mark.asyncio
async def test_superuser_private(superuser_client, raw_tasks):
    private_task = next(t for t in raw_tasks if not t.is_public)
    response = await superuser_client.get(f"/tasks/{private_task.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == private_task.id


@pytest.mark.asyncio
async def test_user_owner_private(user_client, raw_tasks):
    private_task = next(t for t in raw_tasks if not t.is_public)
    response = await user_client.get(f"/tasks/{private_task.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == private_task.id


@pytest.mark.asyncio
async def test_unauth_public(unauth_client, raw_task):
    response = await unauth_client.get(f"/tasks/{raw_task.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == raw_task.id


@pytest.mark.asyncio
async def test_not_found(superuser_client):
    fake_id = 10_000_000
    response = await superuser_client.get(f"/tasks/{fake_id}")
    assert response.status_code == TaskNotFoundException.default_status_code
    assert response.json()["detail"] == TaskNotFoundException.default_message
