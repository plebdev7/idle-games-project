# Cursor Integration Guide

## How to Use MCP Servers in Cursor

### 1. Installation
Ensure dependencies are installed:
```bash
pip install -r .cursor/mcp/requirements.txt
```

### 2. Configuration
The `.cursor/mcp.json` file configures which MCP servers Cursor should load:

```json
{
  "mcpServers": {
    "time-server": {
      "command": "python",
      "args": [".cursor/mcp/time/server.py"],
      "env": {}
    }
  }
}
```

### 3. Restart Cursor
After creating/updating the configuration, restart Cursor to load the MCP servers.

### 4. Using the Tools
Once loaded, you can access the MCP tools in Cursor:

#### Time Server Tools:
- **`get_timestamp(format)`** - Get current timestamp
  - Default format: `%Y-%m-%d %H:%M:%S` (e.g., "2024-01-15 14:30:25")
  - Custom formats: `%B %d, %Y at %I:%M %p` (e.g., "January 15, 2024 at 02:30 PM")

- **`get_date(format)`** - Get current date  
  - Default format: `%Y-%m-%d` (e.g., "2024-01-15")
  - Custom formats: `%B %d, %Y` (e.g., "January 15, 2024")

### 5. Adding New Servers
To add additional MCP servers:

1. Create new directory under `.cursor/mcp/`
2. Add `server.py` with your FastMCP implementation
3. Update `.cursor/mcp.json` with new server configuration
4. Restart Cursor

### Troubleshooting
- Ensure Python is in your system PATH
- Check that the mcp package is installed in your Python environment
- Verify file paths in `mcp.json` are correct
- Look at Cursor's developer console for any MCP-related error messages

