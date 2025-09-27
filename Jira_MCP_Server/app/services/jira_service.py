import httpx
import base64
from typing import Optional
from ..config import settings
from ..models import JiraIssue, JiraIssuesResponse, JiraCommentsResponse

class JiraService:
    def __init__(self):
        self.base_url = settings.jira_base_url.rstrip('/')
        self.email = settings.jira_email
        self.api_token = settings.jira_api_token
        
        # Create Basic Auth header
        auth_string = f"{self.email}:{self.api_token}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        self.headers = {
            "Authorization": f"Basic {auth_b64}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def get_issues(self, jql: Optional[str] = None) -> JiraIssuesResponse:
        """Get issues from Jira Cloud API"""
        url = f"{self.base_url}/rest/api/3/search"
        
        params = {
            "maxResults": 100,
            "fields": "summary,description,status,assignee,reporter,priority,issuetype,project,created,updated,labels"
        }
        
        if jql:
            params["jql"] = jql
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Convert to our models
            issues = []
            for issue_data in data.get("issues", []):
                try:
                    issue = JiraIssue(**issue_data)
                    issues.append(issue)
                except Exception as e:
                    print(f"Error parsing issue {issue_data.get('key', 'unknown')}: {e}")
                    continue
            
            return JiraIssuesResponse(
                issues=issues,
                total=data.get("total", len(issues))
            )
    
    async def get_issue(self, issue_key: str) -> Optional[JiraIssue]:
        """Get a specific issue by key"""
        url = f"{self.base_url}/rest/api/3/issue/{issue_key}"
        
        params = {
            "fields": "summary,description,status,assignee,reporter,priority,issuetype,project,created,updated,labels"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                return JiraIssue(**data)
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return None
                raise
    
    async def get_issue_comments(self, issue_key: str) -> JiraCommentsResponse:
        """Get comments for an issue"""
        url = f"{self.base_url}/rest/api/3/issue/{issue_key}/comment"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            
            return JiraCommentsResponse(
                comments=data.get("comments", []),
                total=data.get("total", 0)
            )