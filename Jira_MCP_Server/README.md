# Jira MCP Server

A production-style FastAPI service for Jira integration with switchable mock/live modes.

## Features

- **Mock Mode**: Reads from local JSON files in `jira_tickets/` directory
- **Live Mode**: Connects to Jira Cloud REST API v3 with Basic Auth
- **Clean APIs**: `/health`, `/issues`, `/issues/{key}`, `/issues/{key}/comments`
- **CORS Support**: Configured for local development and VS Code webviews
- **Production Ready**: Proper error handling, logging, and configuration

## Quick Start

1. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run the server**:
   ```bash
   python run.py
   ```

## Configuration

### Environment Variables

- `MODE`: `MOCK` or `LIVE` (default: `MOCK`)
- `PORT`: Server port (default: `8000`)
- `JIRA_BASE_URL`: Your Jira instance URL (for LIVE mode)
- `JIRA_EMAIL`: Your Jira email (for LIVE mode)
- `JIRA_API_TOKEN`: Your Jira API token (for LIVE mode)
- `ALLOWED_ORIGINS`: CORS origins (comma-separated)

### Mock Mode

Place your Jira issue JSON files in the `jira_tickets/` directory. The service will automatically load all `.json` files.

### Live Mode

Set up your Jira credentials:

1. Go to Jira → Profile → Personal Access Tokens
2. Create an API token
3. Use your email and token for Basic Auth

## API Endpoints

### GET /health

Returns service health and current mode.

**Response**:

```json
{
  "status": "healthy",
  "mode": "MOCK",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

### GET /issues

Get all issues with optional JQL filtering.

**Query Parameters**:

- `jql` (optional): JQL query string

**Response**:

```json
{
  "issues": [...],
  "total": 2
}
```

### GET /issues/{key}

Get a specific issue by key.

**Response**: Single Jira issue object

### GET /issues/{key}/comments

Get comments for a specific issue.

**Response**:

```json
{
  "comments": [...],
  "total": 5
}
```

## Development

The server runs with auto-reload enabled for development. Modify any file and the server will restart automatically.

## VS Code Extension Integration

The service is designed to work seamlessly with VS Code extensions:

- CORS configured for `vscode-webview://*`
- Clean JSON responses
- Proper error handling with HTTP status codes
- Consistent API structure between mock and live modes
