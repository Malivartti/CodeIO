import pytest
from fastapi import status

from app.auth.exceptions import UnauthorizedException
from app.task.exceptions import TaskAlreadyExistsException
from app.task.models import DifficultyEnum


@pytest.mark.asyncio
async def test_user_create(user_client, user):
    payload = {
        "user_id": str(user.id),
        "title": "New task",
        "description": "desc",
        "difficulty": DifficultyEnum.easy.value,
        "time_limit_seconds": 1,
        "memory_limit_megabytes": 64,
        "tests": [[["in"], ["out"]]],
        "is_public": True,
    }
    response = await user_client.post("/tasks", json=payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == payload["title"]


@pytest.mark.asyncio
async def test_duplicate_title(user_client, user):
    payload = {
        "user_id": str(user.id),
        "title": "Duplicated title",
        "description": "desc",
        "difficulty": DifficultyEnum.easy,
        "time_limit_seconds": 1,
        "memory_limit_megabytes": 64,
        "tests": [[["in"], ["out"]]],
        "is_public": True,
    }
    await user_client.post("/tasks", json=payload)
    response = await user_client.post("/tasks", json=payload)
    assert (
        response.status_code == TaskAlreadyExistsException.default_status_code
    )
    assert (
        response.json()["detail"] == TaskAlreadyExistsException.default_message
    )


@pytest.mark.asyncio
async def test_unauth_create(unauth_client, user):
    payload = {
        "userid": str(user.id),
        "title": "Unauth",
        "description": "desc",
        "difficulty": DifficultyEnum.easy.value,
        "timelimitseconds": 1,
        "memorylimitmegabytes": 64,
        "tests": [["in", "out"]],
        "ispublic": True,
    }
    response = await unauth_client.post("/tasks", json=payload)
    assert response.status_code == UnauthorizedException.default_status_code
    assert response.json()["detail"] == UnauthorizedException.default_message
