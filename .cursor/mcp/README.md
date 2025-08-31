# MCP Server Collection

This directory contains Model Context Protocol (MCP) servers for extending Cursor's capabilities.

## Available Servers

### Time Server (`time/`)
Provides date and time utilities:
- `get_timestamp(format)` - Returns current timestamp with customizable format
- `get_date(format)` - Returns current date with customizable format

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure Cursor by ensuring `.cursor/mcp.json` is properly set up

3. Restart Cursor to load the MCP servers

## Server Structure

Each server follows this pattern:
```
server_name/
└── server.py          # Main server implementation
```

## Adding New Servers

1. Create a new directory under `.cursor/mcp/`
2. Add server.py with FastMCP implementation
3. Update `.cursor/mcp.json` configuration
4. Add server documentation to this README

## Common Utilities

The `common/` directory contains shared utilities used across multiple MCP servers.

