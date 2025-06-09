#!/usr/bin/env bash
# Use this script to start a docker container for a local development database
# This script supports monorepo setups with multiple databases in one PostgreSQL instance

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop or Podman Desktop
# - Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# - Podman Desktop - https://podman.io/getting-started/installation
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# Configuration
DB_CONTAINER_NAME="tools-mono-postgres"
DB_PORT="5434"
DB_USER="postgres"
DB_PASSWORD="tools_mono_dev_password"

# Automatically detect apps from the apps/ directory
APPS=()
if [ -d "apps" ]; then
  while IFS= read -r -d '' app; do
    app_name=$(basename "$app")
    # Skip hidden directories and files
    if [[ ! "$app_name" =~ ^\. ]]; then
      APPS+=("$app_name")
    fi
  done < <(find apps -mindepth 1 -maxdepth 1 -type d -print0)
fi

if [ ${#APPS[@]} -eq 0 ]; then
  echo "No apps found in the apps/ directory"
  exit 1
fi

echo "Detected apps: ${APPS[*]}"

# Database naming convention: tools_mono_{app_name}
DB_PREFIX="tools_mono"

if ! [ -x "$(command -v docker)" ] && ! [ -x "$(command -v podman)" ]; then
  echo -e "Docker or Podman is not installed. Please install docker or podman and try again.\nDocker install guide: https://docs.docker.com/engine/install/\nPodman install guide: https://podman.io/getting-started/installation"
  exit 1
fi

# determine which docker command to use
if [ -x "$(command -v docker)" ]; then
  DOCKER_CMD="docker"
elif [ -x "$(command -v podman)" ]; then
  DOCKER_CMD="podman"
fi

if ! $DOCKER_CMD info > /dev/null 2>&1; then
  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
  exit 1
fi

# Check if port is available
if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $DB_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

# Check if container is already running
if [ "$($DOCKER_CMD ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  echo "Available databases:"
  for app in "${APPS[@]}"; do
    echo "  - ${DB_PREFIX}_${app}"
  done
  exit 0
fi

# Start existing container if it exists
if [ "$($DOCKER_CMD ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  $DOCKER_CMD start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  echo "Available databases:"
  for app in "${APPS[@]}"; do
    echo "  - ${DB_PREFIX}_${app}"
  done
  exit 0
fi

# Create new container
echo "Creating new PostgreSQL container with multiple databases..."

# Start PostgreSQL container
$DOCKER_CMD run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="postgres" \
  -p "$DB_PORT":5432 \
  docker.io/postgres

if [ $? -ne 0 ]; then
  echo "Failed to create database container"
  exit 1
fi

echo "Database container '$DB_CONTAINER_NAME' created successfully"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if $DOCKER_CMD exec $DB_CONTAINER_NAME pg_isready -U $DB_USER > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Create databases for each app
echo "Creating databases for apps..."
for app in "${APPS[@]}"; do
  db_name="${DB_PREFIX}_${app}"
  echo "Creating database: $db_name"
  $DOCKER_CMD exec $DB_CONTAINER_NAME psql -U $DB_USER -c "CREATE DATABASE $db_name;" 2>/dev/null || echo "Database $db_name might already exist"
done

echo ""
echo "✅ Setup complete!"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Databases created:"
for app in "${APPS[@]}"; do
  db_name="${DB_PREFIX}_${app}"
  echo "  - $app: $db_name"
  echo "    DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$db_name"
done
echo ""
echo "To connect to a specific database:"
echo "  $DOCKER_CMD exec -it $DB_CONTAINER_NAME psql -U $DB_USER -d <database_name>" 