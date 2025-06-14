import os

import pytest
import pytest_asyncio
from fastapi.applications import FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core import db
from app.core.config import settings
from app.main import app as origin_app
from app.store import Store

from .fixtures import *  # noqa: F403


@pytest.fixture(scope="session", autouse=True)
def override_db_url():
    settings.POSTGRES_DB += "_test"


@pytest.fixture(autouse=True, scope="session")
def schema_name(worker_id) -> str:
    """Возвращает уникальное имя схемы для каждого процесса pytest."""
    if worker_id == "master":
        schema_name = "public"
    else:
        schema_name = f"test_schema_{worker_id}"
    os.environ["SCHEMA_NAME"] = schema_name
    return schema_name


@pytest_asyncio.fixture
async def pg_sessionmaker(schema_name: str, override_db_url):
    engine = create_async_engine(
        str(settings.SQLALCHEMY_DATABASE_URI),
        connect_args={"server_settings": {"search_path": schema_name}},
    )
    sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
    yield sessionmaker
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True, scope="session", loop_scope="session")
async def _add_schema(schema_name: str, override_db_url):
    if schema_name == "public":
        yield
        return

    engine = create_async_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    async with engine.begin() as conn:
        await conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name};"))

    yield
    async with engine.begin() as conn:
        await conn.execute(text(f"DROP SCHEMA {schema_name} CASCADE;"))


@pytest.fixture(autouse=True, scope="session")
def _migrations(schema_name: str, _add_schema):
    import alembic.config  # noqa: PLC0415

    if schema_name == "public":
        alembic.config.main(["downgrade", "base"])
    alembic.config.main(["upgrade", "head"])

    yield
    if schema_name == "public":
        alembic.config.main(["downgrade", "base"])


@pytest_asyncio.fixture(autouse=True)
async def _pg_connect_to_schema(
    schema_name: str, monkeypatch, _add_schema, override_db_url
):
    test_engine = create_async_engine(
        str(settings.SQLALCHEMY_DATABASE_URI),
        connect_args={
            "server_settings": {"search_path": schema_name}
        },  # Указываем схему к которой хотим подключиться
    )
    test_sessionmaker = async_sessionmaker(test_engine, expire_on_commit=False)
    monkeypatch.setattr(db, "engine", test_engine)
    monkeypatch.setattr(db, "sessionmaker", test_sessionmaker)
    yield
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _truncate_all(
    schema_name: str, pg_sessionmaker: async_sessionmaker[AsyncSession]
):
    yield
    async with pg_sessionmaker() as pg_session:
        except_tables = ("alembic_version",)
        res = list(
            await pg_session.scalars(
                text(
                    "select tablename from pg_catalog.pg_tables "
                    "where schemaname = '{}' {};".format(
                        schema_name,
                        "".join(
                            [
                                f" and tablename != '{table}'"
                                for table in except_tables
                            ]
                        ),
                    )
                )
            )
        )
        if not res:
            return
        await pg_session.execute(
            text(
                "truncate table {}".format(
                    ", ".join(f"{schema_name}.{r}" for r in res)
                )
            )
        )
        await pg_session.commit()


@pytest_asyncio.fixture
async def db_session(pg_sessionmaker):
    async with pg_sessionmaker() as session:
        yield session


@pytest.fixture
def store(db_session: AsyncSession) -> Store:
    return Store(db_session)


@pytest.fixture
def app() -> FastAPI:
    return origin_app
