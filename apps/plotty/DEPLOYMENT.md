# Plotty Deployment Guide

## Automatic Database Migrations

The Plotty app now runs database migrations **automatically on every deployment** before starting the server.

### How It Works

1. **Docker Build**: Migrations are bundled into the Docker image
2. **Container Startup**: The start script runs migrations before starting Next.js
3. **Safety**: Uses PostgreSQL advisory locks to prevent race conditions

### Startup Sequence

```
1. 🔄 Running database migrations...
2. 🔒 Acquiring migration lock (prevents concurrent migrations)
3. ✅ Migrations complete
4. 🚀 Starting server...
```

### Environment Variables Required

Set these in your hosting provider (Railway, Fly.io, Render, etc.):

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

The migrations will automatically use this connection string.

### Migration Safety Features

✅ **Advisory Locks**: Only one container can run migrations at a time
✅ **Transactional**: All-or-nothing migrations (rollback on failure)
✅ **Credential Masking**: Passwords hidden in logs
✅ **Fail-Safe**: Server won't start if migrations fail

### What Gets Migrated

All SQL files in `drizzle/` directory:
- `0000_unique_khan.sql` - Initial schema (plotty_polls table)
- `0001_lying_the_executioner.sql` - Index cleanup
- Future migrations...

### Deployment Workflow

1. **Make schema changes** in `server/db/schema.ts`
2. **Generate migration**:
   ```bash
   pnpm db:generate
   ```
3. **Commit migration files** in `drizzle/` folder
4. **Deploy** - Migrations run automatically on startup

### Local Development

For local development, use:

```bash
# Push schema directly (no migration files)
pnpm db:push

# Or run migrations manually
pnpm db:migrate
```

### Troubleshooting

**Container fails to start after deployment:**
- Check logs for migration errors
- Verify DATABASE_URL is set correctly
- Check database connectivity from container

**"database is locked" error:**
- Another container is running migrations
- Wait 30-60 seconds and redeploy

**"relation already exists" error:**
- Migrations were already applied
- This is safe to ignore (migration should skip)

### Rollback Strategy

If a migration fails in production:

1. **Immediate**: Redeploy previous version (previous schema)
2. **Fix-Forward**: Create a new migration to fix the issue
3. **Manual**: Connect to DB and manually fix/rollback

### Multi-Instance Deployments

The advisory lock ensures safe multi-instance deployments:
- First instance acquires lock and runs migrations
- Other instances wait for lock, then skip (already applied)
- All instances start serving traffic after migrations complete

---

**Note**: This is different from manual migration approach. Migrations now run automatically on every deploy for convenience and reliability.
