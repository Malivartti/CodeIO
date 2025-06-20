import asyncio
import os

from dotenv import load_dotenv

from app.rabbitmq_consumer import CodeExecutionWorker


async def main():
    load_dotenv("../.env")

    rabbitmq_default_user = os.getenv("RABBITMQ_DEFAULT_USER")
    rabbitmq_default_pass = os.getenv("RABBITMQ_DEFAULT_PASS")
    rabbitmq_host = os.getenv("RABBITMQ_HOST")
    rabbitmq_port = os.getenv("RABBITMQ_PORT")

    rabbitmq_url = f"amqp://{rabbitmq_default_user}:{rabbitmq_default_pass}@{rabbitmq_host}:{rabbitmq_port}/"

    worker = CodeExecutionWorker(rabbitmq_url)
    await worker.connect()
    await worker.consume()
    await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
