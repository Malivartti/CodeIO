#!/bin/bash
set -e

echo "Waiting for database to be ready..."

while ! pg_isready -h ${POSTGRES_SERVER:-postgres} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-postgres}; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done

echo "Database is ready!"

if [ -f "alembic.ini" ]; then
    echo "Running database migrations..."
    alembic upgrade head
    echo "Migrations completed!"
else
    echo "Warning: alembic.ini not found, skipping migrations"
fi

echo "Starting application..."
exec "$@"
