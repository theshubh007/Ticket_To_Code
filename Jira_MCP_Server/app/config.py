import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Service Configuration
    mode: str = "MOCK"  # MOCK or LIVE
    port: int = 8000
    
    # Jira Configuration
    jira_base_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,vscode-webview://*"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_mock_mode(self) -> bool:
        return self.mode.upper() == "MOCK"

    @property
    def is_live_mode(self) -> bool:
        return self.mode.upper() == "LIVE"

settings = Settings()