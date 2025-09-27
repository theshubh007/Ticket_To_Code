from .mock_service import MockJiraService
from .jira_service import JiraService
from ..config import settings

def get_jira_service():
    """Factory function to get the appropriate service based on configuration"""
    if settings.is_mock_mode:
        return MockJiraService()
    else:
        return JiraService()

__all__ = ["MockJiraService", "JiraService", "get_jira_service"]