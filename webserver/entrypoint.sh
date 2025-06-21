#!/bin/bash
set -e

if [ -f "alembic.ini" ]; then
    echo "Running database migrations..."
    alembic upgrade head
    echo "Migrations completed!"
else
    echo "Warning: alembic.ini not found, skipping migrations"
fi

echo "Running initial data setup..."
python -m app.initial_data
echo "Initial data setup completed!"

echo "Starting application..."
exec "$@"
