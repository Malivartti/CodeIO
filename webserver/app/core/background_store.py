from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.store import Store

from .db import sessionmaker


class BackgroundStoreService:
    """Сервис для работы с Store в background задачах"""

    def __init__(self, session_maker: async_sessionmaker[AsyncSession]):
        self.session_maker = session_maker

    async def get_store(self) -> Store:
        """Создает Store с новой сессией для background операций"""
        session = self.session_maker()
        return Store(session)

    async def close_store(self, store: Store) -> None:
        """Закрывает сессию Store"""
        await store.session.close()


background_store_service = BackgroundStoreService(sessionmaker)
