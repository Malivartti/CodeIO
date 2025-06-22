
FROM python:3.12-slim-bookworm AS base

LABEL description="Code execution worker with RabbitMQ"
LABEL version="1.0.0"


ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1


RUN echo "Acquire::http::Pipeline-Depth 0;" > /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::http::No-Cache true;" >> /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::BrokenProxy true;" >> /etc/apt/apt.conf.d/99custom


RUN apt-get update && apt-get install -y --no-install-recommends \
    # Основные компиляторы и рантаймы
    gcc g++ libc6-dev \
    nodejs npm \
    golang-go \
    rustc \
    default-jdk \
    kotlin \
    mono-mcs mono-runtime \
    # Системные утилиты
    curl \
    procps \
    # Для безопасности
    sudo \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean


# Стадия установки зависимостей
FROM base AS dependencies


COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv


ENV UV_SYSTEM_PYTHON=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_CACHE_DIR=/tmp/uv-cache

WORKDIR /app


COPY pyproject.toml uv.lock ./


RUN --mount=type=cache,target=/tmp/uv-cache \
    uv sync --frozen --no-install-project --no-dev


# Стадия сборки приложения
FROM dependencies AS builder

COPY app/ ./app/


RUN --mount=type=cache,target=/tmp/uv-cache \
    uv sync --frozen --no-dev

RUN python -m compileall app/ -b -q


# Финальная продакшн стадия
FROM base AS production

RUN groupadd -r appgroup && \
    useradd -r -g appgroup -d /app -s /bin/bash appuser

RUN groupadd -r coderunner && \
    useradd -r -g coderunner -d /tmp/sandbox -s /bin/bash -c "Code Runner" coderunner

RUN mkdir -p /app /tmp/sandbox /var/log/worker && \
    chown appuser:appgroup /app && \
    chown coderunner:coderunner /tmp/sandbox && \
    chown appuser:appgroup /var/log/worker

COPY --from=builder --chown=appuser:appgroup /app /app

RUN echo "appuser ALL=(coderunner) NOPASSWD: ALL" >> /etc/sudoers.d/appuser && \
    chmod 440 /etc/sudoers.d/appuser

WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"

USER appuser

ENTRYPOINT ["python", "-m", "app.main"]
