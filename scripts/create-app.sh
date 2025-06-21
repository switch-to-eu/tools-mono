#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the monorepo root
if [ ! -f "turbo.json" ] || [ ! -d "apps/example" ]; then
  print_error "This script must be run from the monorepo root directory."
  print_error "Make sure you're in the directory containing turbo.json and apps/example"
  exit 1
fi

# Get the new app name
if [ -z "$1" ]; then
  echo -n "Enter the new app name (e.g., 'my-awesome-app'): "
  read -r APP_NAME
else
  APP_NAME="$1"
fi

# Validate app name
if [[ ! "$APP_NAME" =~ ^[a-z][a-z0-9-]*[a-z0-9]$ ]]; then
  print_error "App name must:"
  print_error "  - Start with a lowercase letter"
  print_error "  - Contain only lowercase letters, numbers, and hyphens"
  print_error "  - End with a letter or number"
  print_error "  - Examples: 'my-app', 'dashboard', 'user-portal'"
  exit 1
fi

APP_DIR="apps/$APP_NAME"

# Check if app already exists
if [ -d "$APP_DIR" ]; then
  print_error "App '$APP_NAME' already exists at $APP_DIR"
  exit 1
fi

print_status "Creating new app '$APP_NAME' based on the example app..."

# Create the new app directory
mkdir -p "$APP_DIR"

# Copy all files from example app, excluding generated directories
print_status "Copying files from apps/example..."
rsync -av \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.env*' \
  --exclude='*.log' \
  apps/example/ "$APP_DIR/"

# Function to replace text in files
replace_in_file() {
  local file="$1"
  local search="$2"
  local replace="$3"

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|$search|$replace|g" "$file"
  else
    # Linux
    sed -i "s|$search|$replace|g" "$file"
  fi
}

# Function to replace text in files (case insensitive for specific patterns)
replace_in_file_case_insensitive() {
  local file="$1"
  local search="$2"
  local replace="$3"

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|$search|$replace|gI" "$file"
  else
    # Linux
    sed -i "s|$search|$replace|gI" "$file"
  fi
}

print_status "Updating app-specific references..."

# Update package.json
replace_in_file "$APP_DIR/package.json" "@workspace/example" "@workspace/$APP_NAME"

# Update database table prefixes in drizzle config
replace_in_file "$APP_DIR/drizzle.config.ts" "example_" "${APP_NAME//-/_}_"

# Update database table prefixes in schema
if [ -f "$APP_DIR/server/db/schema.ts" ]; then
  replace_in_file "$APP_DIR/server/db/schema.ts" "example_" "${APP_NAME//-/_}_"
fi

# Update app name in layout and other components
find "$APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" \) -exec grep -l "Example" {} \; | while read -r file; do
  # Convert app name to different cases
  APP_NAME_PASCAL=$(echo "$APP_NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')  # PascalCase
  APP_NAME_TITLE=$(echo "$APP_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')   # Title Case

  # Replace "Example" with PascalCase version
  replace_in_file "$file" "Example" "$APP_NAME_PASCAL"

  # Replace "example" with lowercase version
  replace_in_file "$file" "example" "$APP_NAME"
done

# Update translation files
if [ -f "$APP_DIR/messages/en.json" ]; then
  APP_NAME_TITLE=$(echo "$APP_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
  replace_in_file "$APP_DIR/messages/en.json" "Example" "$APP_NAME_TITLE"
fi

if [ -f "$APP_DIR/messages/nl.json" ]; then
  APP_NAME_TITLE=$(echo "$APP_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
  replace_in_file "$APP_DIR/messages/nl.json" "Example" "$APP_NAME_TITLE"
fi

# Create a basic README for the new app
cat > "$APP_DIR/README.md" << EOF
# $APP_NAME

A Next.js application in the tools-mono monorepo.

## Development

From the monorepo root:

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter=@workspace/$APP_NAME dev

# Build the app
pnpm --filter=@workspace/$APP_NAME build

# Run database commands
pnpm --filter=@workspace/$APP_NAME db:push
pnpm --filter=@workspace/$APP_NAME db:studio
\`\`\`

## Environment Variables

Create a \`.env.local\` file in this directory with:

\`\`\`
DATABASE_URL="postgresql://..."
\`\`\`

## Features

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- tRPC for type-safe APIs
- Drizzle ORM with PostgreSQL
- Internationalization with next-intl
- Shared UI components from @workspace/ui
EOF

print_success "App '$APP_NAME' created successfully!"
print_status "Next steps:"
echo ""
echo "1. Navigate to the app directory:"
echo "   cd $APP_DIR"
echo ""
echo "2. Create environment variables:"
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your database URL"
echo ""
echo "3. Install dependencies (from monorepo root):"
echo "   pnpm install"
echo ""
echo "4. Set up the database:"
echo "   pnpm --filter=@workspace/$APP_NAME db:push"
echo ""
echo "5. Start the development server:"
echo "   pnpm --filter=@workspace/$APP_NAME dev"
echo ""
echo "Your new app will be available at: http://localhost:3000"
echo ""
print_warning "Don't forget to:"
print_warning "  - Update the app description and metadata"
print_warning "  - Customize the database schema in server/db/schema.ts"
print_warning "  - Add your specific business logic and components"
print_warning "  - Update translation files in messages/"