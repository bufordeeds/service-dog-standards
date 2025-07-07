# PostgreSQL MCP Server Setup

This document explains how to use the PostgreSQL MCP (Model Context Protocol) server for enhanced development assistance with Claude Code.

## What is MCP?

MCP allows Claude to directly interact with your PostgreSQL database, providing:
- ✅ Real-time database inspection
- ✅ Direct query execution and testing
- ✅ Schema debugging assistance  
- ✅ Migration verification
- ✅ Performance optimization help

## Setup

The PostgreSQL MCP server is already configured for this project.

### Configuration Files

- **`.mcp-config.json`** - MCP server configuration
- **`scripts/start-mcp-postgres.js`** - MCP server launcher
- **Database Connection** - Uses your Neon PostgreSQL from `.env`

### Available Commands

```bash
# Start PostgreSQL MCP server for Claude assistance
npm run mcp:postgres

# Start Prisma Studio (visual database browser)
npm run db:studio

# Run database migrations
npm run db:migrate

# Reset database (careful!)
npm run db:reset
```

## How to Use with Claude Code

1. **Start the MCP server:**
   ```bash
   npm run mcp:postgres
   ```

2. **Claude can now:**
   - Inspect your database schema
   - Test queries directly
   - Help debug database issues
   - Verify migrations worked
   - Optimize your database design

## Database Information

- **Provider:** Neon PostgreSQL (Vercel Postgres)
- **Schema:** Comprehensive Service Dog Standards database
- **Connection:** Configured via environment variables
- **Migration Status:** Ready for development

## Troubleshooting

If the MCP server fails to start:

1. **Check your `.env` file** - Ensure `DATABASE_URL` is set
2. **Verify connection** - Test with `npm run db:studio`  
3. **Check dependencies** - Run `npm install`
4. **Database access** - Ensure your Neon database is accessible

## Security Notes

- Connection strings are loaded from environment variables
- Never commit database credentials to version control
- The MCP server runs locally and connects to your database
- Only use MCP in development environments