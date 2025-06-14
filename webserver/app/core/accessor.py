from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

from app.core.context import is_in_explicit_transaction


@dataclass
class BaseAccessor:
    session: AsyncSession

    async def commit(self) -> None:
        if is_in_explicit_transaction():
            await self.session.flush()
        else:
            await self.session.commit()

    async def rollback(self) -> None:
        if not is_in_explicit_transaction():
            await self.session.rollback()

    async def refresh(self, obj: SQLModel) -> None:
        await self.session.refresh(obj)
