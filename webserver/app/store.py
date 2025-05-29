from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.context import (
    is_in_explicit_transaction,
    reset_explicit_transaction,
    set_explicit_transaction,
)
from app.core.db import SessionDep
from app.core.exceptions import InternalException
from app.core.logger import create_log
from app.user.accessor import UserAccessor

log = create_log(__name__)


class Store:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._user: UserAccessor | None = None

    @asynccontextmanager
    async def transaction(self) -> AsyncGenerator["Store", Any]:
        if is_in_explicit_transaction():
            yield self
            return

        token = set_explicit_transaction(True)
        try:
            async with self.session.begin():
                yield self
        except Exception as e:
            await self.session.rollback()
            log(e, additional_info="в транзакции")
            raise InternalException from e
        finally:
            reset_explicit_transaction(token)

    @property
    def user(self) -> UserAccessor:
        if self._user is None:
            self._user = UserAccessor(self.session)
        return self._user


def get_store(session: SessionDep) -> Store:
    return Store(session)


StoreDep = Annotated[Store, Depends(get_store)]
