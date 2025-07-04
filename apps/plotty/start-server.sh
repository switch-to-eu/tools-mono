#!/bin/sh
# This script ensures the database is up-to-date before starting the application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database migrations
echo "Running database migrations..."
pnpm drizzle-kit migrate

# Start the application using the standalone server file
echo "Starting server..."
exec node .next/standalone/server.js