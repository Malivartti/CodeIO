import asyncio
import json
from typing import Annotated, Any

from aio_pika.abc import AbstractIncomingMessage
from fastapi import Depends

from app.core.background_store import background_store_service
from app.core.logger import create_log
from app.store import Store

from .models import AttemptStatusEnum, AttemptUpdate

log = create_log(__name__)


class ExecutionResultHandler:
    def __init__(self) -> None:
        self.pending_requests: dict[int, asyncio.Event] = {}

    async def handle_result(self, message: AbstractIncomingMessage):
        async with message.process():
            store = None
            try:
                store = await background_store_service.get_store()

                result_data = json.loads(message.body.decode())
                attempt_id = result_data["id"]

                await self._update_attempt(store, attempt_id, result_data)

                if attempt_id in self.pending_requests:
                    self.pending_requests[attempt_id].set()

            except Exception as e:
                log(e, level="error")
            finally:
                if store:
                    await background_store_service.close_store(store)

    async def _update_attempt(
        self, store: Store, attempt_id: int, result_data: dict[str, Any]
    ):
        update_data = AttemptUpdate(
            status=AttemptStatusEnum(result_data["status"]),
            time_used_ms=result_data.get("time_used_ms"),
            memory_used_bytes=result_data.get("memory_used_bytes"),
            error_traceback=result_data.get("error_traceback"),
            failed_test_number=result_data.get("failed_test_number"),
            source_code_output=result_data.get("source_code_output"),
            expected_output=result_data.get("expected_output"),
        )

        await store.attempt.update_attempt(
            attempt_id=attempt_id, attempt_update=update_data
        )

    def add_pending_request(self, attempt_id: int) -> asyncio.Event:
        if attempt_id not in self.pending_requests:
            self.pending_requests[attempt_id] = asyncio.Event()
        return self.pending_requests[attempt_id]

    def remove_pending_request(self, attempt_id: int):
        if attempt_id in self.pending_requests:
            del self.pending_requests[attempt_id]


execution_result_handler = ExecutionResultHandler()


def get_execution_result_handler() -> ExecutionResultHandler:
    return execution_result_handler


ExecutionResultHandlerDep = Annotated[
    ExecutionResultHandler, Depends(get_execution_result_handler)
]
