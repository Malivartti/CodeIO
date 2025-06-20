from typing import Any

from fastapi import APIRouter, Depends

from app.auth.deps import get_current_active_superuser
from app.store import StoreDep

from .models import AdminStats

router = APIRouter(prefix="/stats", tags=["stat"])


@router.get(
    "",
    response_model=AdminStats,
    dependencies=[Depends(get_current_active_superuser)],
)
async def get_admin_stats(store: StoreDep) -> Any:
    return await store.statistics.get_admin_stats()
