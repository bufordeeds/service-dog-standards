#!/usr/bin/env node

/**
 * PostgreSQL MCP Server Launcher for Service Dog Standards
 * 
 * This script starts the PostgreSQL MCP server with your Neon database connection
 * for use with Claude Code development assistance.
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const serverPath = path.join(__dirname, '../node_modules/@modelcontextprotocol/server-postgres/dist/index.js');

console.log('🚀 Starting PostgreSQL MCP Server for Service Dog Standards');
console.log('📁 Project: service-dog-standards');
console.log('🗄️  Database: Neon PostgreSQL');
console.log('📡 Server path:', serverPath);

const mcpServer = spawn('node', [serverPath, process.env.DATABASE_URL], {
  env: {
    ...process.env
  },
  stdio: 'inherit'
});

mcpServer.on('error', (error) => {
  console.error('❌ Failed to start MCP server:', error);
  process.exit(1);
});

mcpServer.on('close', (code) => {
  console.log(`🔴 MCP server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP server...');
  mcpServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down MCP server...');
  mcpServer.kill('SIGTERM');
});

console.log('✅ PostgreSQL MCP Server is ready for Claude Code!');
console.log('📋 Available for database operations, debugging, and development assistance.');