#!/usr/bin/env python3
"""
MCP Server for Date and Time utilities

Provides tools for getting current timestamps and dates with customizable formatting.
"""

from mcp.server.fastmcp import FastMCP
from datetime import datetime
import sys

# Initialize the MCP server
mcp = FastMCP(name='Time Server')

@mcp.tool()
async def get_timestamp(format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Returns the current timestamp in the specified format.
    
    Args:
        format: strftime format string (default: "%Y-%m-%d %H:%M:%S")
                Examples: 
                - "%Y-%m-%d %H:%M:%S" -> 2024-01-15 14:30:25
                - "%B %d, %Y at %I:%M %p" -> January 15, 2024 at 02:30 PM
                - "%Y%m%d_%H%M%S" -> 20240115_143025
    
    Returns:
        Formatted timestamp string
    """
    try:
        return datetime.now().strftime(format)
    except ValueError as e:
        return f"Error: Invalid format string '{format}'. {str(e)}"

@mcp.tool()
async def get_date(format: str = "%Y-%m-%d") -> str:
    """
    Returns the current date in the specified format.
    
    Args:
        format: strftime format string (default: "%Y-%m-%d")
                Examples:
                - "%Y-%m-%d" -> 2024-01-15
                - "%B %d, %Y" -> January 15, 2024
                - "%m/%d/%Y" -> 01/15/2024
                - "%A, %B %d" -> Monday, January 15
    
    Returns:
        Formatted date string
    """
    try:
        return datetime.now().strftime(format)
    except ValueError as e:
        return f"Error: Invalid format string '{format}'. {str(e)}"

if __name__ == "__main__":
    # Run the server
    mcp.run()

