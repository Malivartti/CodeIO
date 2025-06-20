import json
import logging
from typing import Any

import aio_pika
from aio_pika import ExchangeType, Message
from aio_pika.abc import (
    AbstractChannel,
    AbstractConnection,
    AbstractExchange,
    AbstractIncomingMessage,
)

from .enums import ExecutionStatus, ProgrammingLanguage
from .executor import AttemptExecutor
from .models import Attempt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TASK_EXCHANGE = "code_execution"
TASK_ROUTING_KEY = "execute_code"


class CodeExecutionWorker:
    def __init__(self, rabbit_url: str):
        self.rabbit_url = rabbit_url
        self.connection: AbstractConnection
        self.channel: AbstractChannel
        self.result_exchange: AbstractExchange

    async def connect(self) -> None:
        self.connection = await aio_pika.connect_robust(self.rabbit_url)
        self.channel = await self.connection.channel()
        await self.channel.set_qos(prefetch_count=1)

        await self.channel.declare_exchange(
            TASK_EXCHANGE, ExchangeType.DIRECT, durable=True
        )

        self.result_exchange = await self.channel.declare_exchange(
            "execution_results", ExchangeType.FANOUT, durable=True
        )

        logger.info("RabbitMQ connected")

    async def consume(self) -> None:
        queue = await self.channel.declare_queue(TASK_ROUTING_KEY, durable=True)
        await queue.bind(exchange=TASK_EXCHANGE, routing_key=TASK_ROUTING_KEY)
        await queue.consume(self._process_message)

    async def _process_message(self, message: AbstractIncomingMessage):
        async with message.process():
            data: dict[str, Any] = json.loads(message.body.decode())
            attempt = Attempt(
                id=data["id"],
                programming_language=ProgrammingLanguage(
                    data["programming_language"]
                ),
                source_code=data["source_code"],
                time_limit_seconds=data["time_limit_seconds"],
                memory_limit_megabytes=data["memory_limit_megabytes"],
                tests=data["tests"],
            )

            try:
                result = AttemptExecutor(attempt).execute()
            except Exception:
                payload = {
                    "id": attempt.id,
                    "status": ExecutionStatus.RUNTIME_ERROR.value,
                }
            else:
                payload = {
                    **result.__dict__,
                    "status": result.status.value,
                }

            await self._publish_result(payload)

    async def _publish_result(self, result: dict[str, Any]) -> None:
        msg = Message(
            json.dumps(result).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )
        await self.result_exchange.publish(msg, routing_key="")
