from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.attempt.execution_result_handler import execution_result_handler
from app.core.rabbitmq_client import rabbitmq_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    await rabbitmq_client.connect()
    await rabbitmq_client.start_result_consumer(
        execution_result_handler.handle_result
    )

    yield

    await rabbitmq_client.close()
