import json
import os
from typing import List, Optional
from pathlib import Path
from ..models import JiraIssue, JiraIssuesResponse, JiraCommentsResponse

class MockJiraService:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "jira_tickets"
        self._ensure_data_dir()
    
    def _ensure_data_dir(self):
        """Ensure the jira_tickets directory exists"""
        self.data_dir.mkdir(exist_ok=True)
    
    def _load_json_files(self) -> List[dict]:
        """Load all JSON files from jira_tickets directory"""
        issues = []
        if not self.data_dir.exists():
            return issues
            
        for json_file in self.data_dir.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        issues.extend(data)
                    else:
                        issues.append(data)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading {json_file}: {e}")
        
        return issues
    
    async def get_issues(self, jql: Optional[str] = None) -> JiraIssuesResponse:
        """Get all issues from mock data"""
        raw_issues = self._load_json_files()
        
        # Convert to JiraIssue models
        issues = []
        for raw_issue in raw_issues:
            try:
                issue = JiraIssue(**raw_issue)
                issues.append(issue)
            except Exception as e:
                print(f"Error parsing issue: {e}")
                continue
        
        return JiraIssuesResponse(
            issues=issues,
            total=len(issues)
        )
    
    async def get_issue(self, issue_key: str) -> Optional[JiraIssue]:
        """Get a specific issue by key"""
        issues_response = await self.get_issues()
        
        for issue in issues_response.issues:
            if issue.key == issue_key:
                return issue
        
        return None
    
    async def get_issue_comments(self, issue_key: str) -> JiraCommentsResponse:
        """Get comments for an issue (mock implementation)"""
        # For mock mode, return empty comments or load from separate files
        return JiraCommentsResponse(
            comments=[],
            total=0
        )