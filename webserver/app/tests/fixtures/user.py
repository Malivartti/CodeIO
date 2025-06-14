from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_session
from app.core.security import create_access_token
from app.store import Store
from app.user.models import User, UserCreate


@pytest.fixture
def new_email():
    return "new-test-user@example.com"


@pytest.fixture
def not_existent_email():
    return "not-existent-email@example.com"


@pytest.fixture
def correct_password():
    return "testpassword123"


@pytest.fixture
def new_password():
    return "newtestpassword123"


@pytest.fixture
def incorrect_password():
    return "incorrecttestpassword"


@pytest_asyncio.fixture
async def user(store: Store, correct_password) -> User:
    user_create = UserCreate(
        email="test-user@example.com",
        first_name="Test",
        last_name="User",
        password=correct_password,
        is_active=True,
        is_superuser=False,
    )
    return await store.user.create_user(user_create=user_create)


@pytest_asyncio.fixture
async def user_wln(store: Store, correct_password) -> User:
    user_wln_create = UserCreate(
        email="test-user-wln@example.com",
        first_name="Test",
        password=correct_password,
        is_active=True,
        is_superuser=False,
    )
    return await store.user.create_user(user_create=user_wln_create)


@pytest_asyncio.fixture
async def superuser(store: Store, correct_password) -> User:
    superuser_create = UserCreate(
        email="test-superuser@example.com",
        first_name="Test",
        last_name="Superuser",
        password=correct_password,
        is_active=True,
        is_superuser=True,
    )
    return await store.user.create_user(user_create=superuser_create)


@pytest_asyncio.fixture
async def inactive_user(store: Store, correct_password: str) -> User:
    inactive_user_create = UserCreate(
        email="test-inactive-user@example.com",
        first_name="Test",
        last_name="User",
        password=correct_password,
        is_active=False,
        is_superuser=False,
    )
    return await store.user.create_user(user_create=inactive_user_create)


@pytest_asyncio.fixture
async def unauth_client(
    app: FastAPI, db_session: AsyncSession
) -> AsyncGenerator[AsyncClient, None]:
    def override_get_session():
        return db_session

    app.dependency_overrides[get_session] = override_get_session
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url=f"http://test{settings.API_V1_STR}",
    ) as client:
        yield client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def user_client(
    app: FastAPI, db_session: AsyncSession, user: User
) -> AsyncGenerator[AsyncClient, None]:
    def override_get_session() -> AsyncSession:
        return db_session

    app.dependency_overrides[get_session] = override_get_session

    access_token = create_access_token(str(user.id))

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url=f"http://test{settings.API_V1_STR}",
        headers={"Authorization": f"Bearer {access_token}"},
    ) as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def user_wln_client(
    app: FastAPI, db_session: AsyncSession, user_wln: User
) -> AsyncGenerator[AsyncClient, None]:
    def override_get_session() -> AsyncSession:
        return db_session

    app.dependency_overrides[get_session] = override_get_session

    access_token = create_access_token(
        str(user_wln.id),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url=f"http://test{settings.API_V1_STR}",
        headers={"Authorization": f"Bearer {access_token}"},
    ) as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def superuser_client(
    app: FastAPI, db_session: AsyncSession, superuser: User
) -> AsyncGenerator[AsyncClient, None]:
    def override_get_session() -> AsyncSession:
        return db_session

    app.dependency_overrides[get_session] = override_get_session

    access_token = create_access_token(str(superuser.id))

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url=f"http://test{settings.API_V1_STR}",
        headers={"Authorization": f"Bearer {access_token}"},
    ) as client:
        yield client

    app.dependency_overrides.clear()
