from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class JiraUser(BaseModel):
    accountId: str
    displayName: str
    emailAddress: Optional[str] = None

class JiraStatus(BaseModel):
    id: str
    name: str
    statusCategory: Dict[str, Any]

class JiraIssueType(BaseModel):
    id: str
    name: str
    iconUrl: Optional[str] = None

class JiraPriority(BaseModel):
    id: str
    name: str
    iconUrl: Optional[str] = None

class JiraProject(BaseModel):
    id: str
    key: str
    name: str

class JiraFields(BaseModel):
    summary: str
    description: Optional[str] = None
    status: JiraStatus
    assignee: Optional[JiraUser] = None
    reporter: Optional[JiraUser] = None
    priority: Optional[JiraPriority] = None
    issuetype: JiraIssueType
    project: JiraProject
    created: str
    updated: str
    labels: List[str] = []

class JiraIssue(BaseModel):
    id: str
    key: str
    self: str
    fields: JiraFields

class JiraComment(BaseModel):
    id: str
    author: JiraUser
    body: str
    created: str
    updated: str

class JiraCommentsResponse(BaseModel):
    comments: List[JiraComment]
    total: int

class HealthResponse(BaseModel):
    status: str
    mode: str
    timestamp: str

class JiraIssuesResponse(BaseModel):
    issues: List[JiraIssue]
    total: int