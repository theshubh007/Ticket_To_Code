#!/usr/bin/env python3
"""
Jira MCP Server - Production FastAPI Service
Run with: python run.py
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Starting Jira MCP Server in {settings.mode} mode on port {settings.port}")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )