from typing import Annotated

from fastapi import Depends

from app.core.logger import create_log
from app.core.rabbitmq_client import rabbitmq_client
from app.store import Store, StoreDep

from .models import Attempt, AttemptStatusEnum, AttemptUpdate

log = create_log(__name__)


class CodeExecutionService:
    def __init__(self, store: Store):
        self.store = store

    async def execute_attempt(self, attempt: Attempt):
        """Отправка попытки на выполнение в воркер"""
        try:
            task = await self.store.task.get_task_by_id(task_id=attempt.task_id)
            if not task:
                raise Exception(f"Task {attempt.task_id} not found")

            task_data = {
                "id": attempt.id,
                "programming_language": attempt.programming_language,
                "source_code": attempt.source_code,
                "time_limit_seconds": task.time_limit_seconds,
                "memory_limit_megabytes": task.memory_limit_megabytes,
                "tests": task.tests,
            }

            await rabbitmq_client.send_task(task_data)

        except Exception as e:
            log(e, level="error", additional_info="attempd_id: {attempt.id}")

            await self.store.attempt.update_attempt(
                attempt_id=attempt.id,
                attempt_update=AttemptUpdate(
                    status=AttemptStatusEnum.RUNTIME_ERROR,
                    error_traceback=str(e),
                ),
            )
            raise


def get_code_execution_service(store: StoreDep) -> CodeExecutionService:
    return CodeExecutionService(store)


CodeExecutionServiceDep = Annotated[
    CodeExecutionService, Depends(get_code_execution_service)
]
