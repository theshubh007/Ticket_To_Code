from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional

from .config import settings
from .models import HealthResponse, JiraIssuesResponse, JiraIssue, JiraCommentsResponse
from .services import get_jira_service

# Create FastAPI app
app = FastAPI(
    title="Jira MCP Server",
    description="A FastAPI service for Jira integration with mock/live mode switching",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        mode=settings.mode,
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/issues", response_model=JiraIssuesResponse)
async def get_issues(jql: Optional[str] = Query(None, description="JQL query string")):
    """Get Jira issues"""
    try:
        service = get_jira_service()
        return await service.get_issues(jql=jql)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch issues: {str(e)}")

@app.get("/issues/{issue_key}", response_model=JiraIssue)
async def get_issue(issue_key: str):
    """Get a specific Jira issue by key"""
    try:
        service = get_jira_service()
        issue = await service.get_issue(issue_key)
        
        if not issue:
            raise HTTPException(status_code=404, detail=f"Issue {issue_key} not found")
        
        return issue
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch issue: {str(e)}")

@app.get("/issues/{issue_key}/comments", response_model=JiraCommentsResponse)
async def get_issue_comments(issue_key: str):
    """Get comments for a specific Jira issue"""
    try:
        service = get_jira_service()
        return await service.get_issue_comments(issue_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comments: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)