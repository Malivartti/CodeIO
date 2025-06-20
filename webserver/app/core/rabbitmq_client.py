import json
import logging
from collections.abc import Callable
from typing import Any

import aio_pika
from aio_pika import ExchangeType, Message, connect
from aio_pika.abc import (
    AbstractChannel,
    AbstractConnection,
    AbstractExchange,
    AbstractQueue,
)

from app.core.config import settings
from app.core.logger import create_log

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
log = create_log(__name__)


class RabbitMQClient:
    def __init__(self) -> None:
        self.connection: AbstractConnection
        self.channel: AbstractChannel
        self.task_exchange: AbstractExchange
        self.result_exchange: AbstractExchange
        self.result_queue: AbstractQueue

    async def connect(self) -> None:
        try:
            self.connection = await connect(settings.RABBITMQ_URL)
            self.channel = await self.connection.channel()

            self.task_exchange = await self.channel.declare_exchange(
                "code_execution", ExchangeType.DIRECT, durable=True
            )

            self.result_exchange = await self.channel.declare_exchange(
                "execution_results", ExchangeType.FANOUT, durable=True
            )

            self.result_queue = await self.channel.declare_queue(
                "execution_results_queue", durable=True
            )

            await self.result_queue.bind(self.result_exchange, routing_key="")

            logger.info("Connected to RabbitMQ")

        except Exception as e:
            log(e, level="error")
            raise

    async def send_task(self, task_data: dict[str, Any]):
        if not self.task_exchange:
            await self.connect()

        message = Message(
            json.dumps(task_data).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )

        await self.task_exchange.publish(message, routing_key="execute_code")

    async def start_result_consumer(self, callback: Callable):
        if not self.result_queue:
            await self.connect()

        await self.result_queue.consume(callback)

    async def close(self):
        if self.connection:
            await self.connection.close()


rabbitmq_client = RabbitMQClient()
