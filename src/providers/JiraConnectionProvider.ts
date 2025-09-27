import * as vscode from "vscode"
import { JiraProvider } from "./JiraProvider"

export class JiraConnectionProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "jiraConnection"
  private _view?: vscode.WebviewView

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly jira: JiraProvider
  ) {}

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this._view = webviewView
    const webview = webviewView.webview

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    }

    // Check if JIRA is connected
    const isConnected = await this.jira.isConnected()
    webview.html = this.getHtml(webview, isConnected)

    webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case "connectJira": {
          await vscode.commands.executeCommand("ticket-to-code.connectJira")
          // Refresh the webview after connection
          const isConnected = await this.jira.isConnected()
          webview.html = this.getHtml(webview, isConnected)
          // Notify other views that connection status changed
          vscode.commands.executeCommand("ticket-to-code.refreshViews")
          break
        }
        case "loadTickets": {
          vscode.commands.executeCommand("ticket-to-code.loadTickets")
          break
        }
        case "disconnectJira": {
          vscode.commands.executeCommand("ticket-to-code.disconnectJira")
          // Refresh the webview after disconnection
          const isConnected = await this.jira.isConnected()
          webview.html = this.getHtml(webview, isConnected)
          break
        }
        case "importSettings": {
          vscode.commands.executeCommand("ticket-to-code.importSettings")
          break
        }
      }
    })
  }

  private getHtml(
    webview: vscode.Webview,
    isConnected: boolean = false
  ): string {
    const nonce = String(Date.now())
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${
      webview.cspSource
    } https:; style-src ${
      webview.cspSource
    } 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ticket to Code</title>
<style>
:root {
  --bg: #1e1e1e;
  --fg: #ffffff;
  --muted: #cccccc;
  --border: #333333;
  --accent: #007acc;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --card-bg: #252526;
  --input-bg: #3c3c3c;
  --hover-bg: #2a2d2e;
}

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  color: var(--fg); 
  background: var(--bg); 
  line-height: 1.6;
  overflow-x: hidden;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%);
}

.header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--accent);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 24px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.main-content {
  flex: 1;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.welcome-description {
  color: var(--muted);
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.7;
}

.api-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--fg);
}

.llm-recommendations {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.llm-option {
  background: var(--input-bg);
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.llm-option:hover {
  border-color: var(--accent);
  background: var(--hover-bg);
}

.llm-option.selected {
  border-color: var(--accent);
  background: rgba(0, 122, 204, 0.1);
}

.llm-icon {
  width: 32px;
  height: 32px;
  background: var(--accent);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 16px;
}

.llm-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.llm-description {
  font-size: 14px;
  color: var(--muted);
}

.llm-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #333;
  color: var(--muted);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.provider-section {
  margin-bottom: 24px;
}

.provider-label {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--fg);
}

.provider-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--fg);
  font-size: 14px;
  margin-bottom: 12px;
}

.provider-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.import-settings {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.import-settings:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: #005a9e;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--hover-bg);
  border-color: var(--accent);
}

.error-message {
  color: var(--error);
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.success-message {
  color: var(--success);
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.connected-state {
  text-align: center;
  padding: 32px;
}

.connected-icon {
  width: 64px;
  height: 64px;
  background: var(--success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.connected-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--success);
}

.connected-description {
  color: var(--muted);
  margin-bottom: 24px;
}

@media (max-width: 480px) {
  .llm-recommendations {
    grid-template-columns: 1fr;
  }
  
  .welcome-card {
    padding: 24px;
  }
  
  .title {
    font-size: 24px;
  }
}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎫</div>
      <h1 class="title">Ticket to Code</h1>
      <p class="subtitle">Streamline your workflow from JIRA tickets to code implementation with AI assistance, safe diffs, and Git integration.</p>
    </div>
    
    <div class="main-content">
      ${
        !isConnected
          ? `
      <div class="welcome-card">
        <h2 class="welcome-title">Welcome to Ticket to Code!</h2>
        <p class="welcome-description">
          With a range of built-in and extensible features, Ticket to Code lets you plan, architect, code, debug and boost your productivity like never before.
        </p>
        
        <div class="api-section">
          <h3 class="section-title">We recommend using an LLM Router:</h3>
          <div class="llm-recommendations">
            <div class="llm-option" data-provider="openrouter">
              <div class="llm-icon">🔄</div>
              <div class="llm-name">OpenRouter</div>
              <div class="llm-description">A unified interface for LLMs</div>
            </div>
            <div class="llm-option" data-provider="requesty">
              <div class="llm-icon">💬</div>
              <div class="llm-name">Requesty</div>
              <div class="llm-description">Your optimized LLM router</div>
              <div class="llm-badge">$1 free credit</div>
            </div>
          </div>
          
          <div class="provider-section">
            <div class="provider-label">Or you can bring your provider API key:</div>
            <input type="text" class="provider-input" id="apiProvider" placeholder="API Provider...">
            <a href="#" class="import-settings" id="importSettings">Import Settings</a>
          </div>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary" id="connect">Let's go!</button>
        </div>
        
        <div class="error-message" id="errorMessage" style="display: none;">
          You must provide a valid API key.
        </div>
      </div>
      `
          : `
      <div class="welcome-card">
        <div class="connected-state">
          <div class="connected-icon">✅</div>
          <h2 class="connected-title">Connected Successfully!</h2>
          <p class="connected-description">
            You're all set to start working with JIRA tickets and AI assistance. 
            Browse tickets, ask questions, and get intelligent code suggestions.
          </p>
          <div class="actions">
            <button class="btn btn-primary" id="loadTickets">Browse Tickets</button>
            <button class="btn btn-secondary" id="disconnect">Disconnect</button>
          </div>
        </div>
      </div>
      `
      }
    </div>
  </div>

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();

// LLM option selection
const llmOptions = document.querySelectorAll('.llm-option');
llmOptions.forEach(option => {
  option.addEventListener('click', () => {
    llmOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
  });
});

// Connect button
const connectBtn = document.getElementById('connect');
const loadTicketsBtn = document.getElementById('loadTickets');
const disconnectBtn = document.getElementById('disconnect');
const errorMessage = document.getElementById('errorMessage');
const apiProviderInput = document.getElementById('apiProvider');

if (connectBtn) {
  connectBtn.addEventListener('click', () => {
    const selectedProvider = document.querySelector('.llm-option.selected');
    const apiKey = apiProviderInput?.value.trim();
    
    if (!selectedProvider && !apiKey) {
      errorMessage.style.display = 'block';
      return;
    }
    
    errorMessage.style.display = 'none';
    vscode.postMessage({command: 'connectJira'});
  });
}

if (loadTicketsBtn) {
  loadTicketsBtn.addEventListener('click', () => {
    vscode.postMessage({command: 'loadTickets'});
  });
}

if (disconnectBtn) {
  disconnectBtn.addEventListener('click', () => {
    vscode.postMessage({command: 'disconnectJira'});
  });
}

// Import settings
const importSettings = document.getElementById('importSettings');
if (importSettings) {
  importSettings.addEventListener('click', (e) => {
    e.preventDefault();
    vscode.postMessage({command: 'importSettings'});
  });
}

// Auto-hide error message when user starts typing
if (apiProviderInput) {
  apiProviderInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
  });
}
</script>
</body>
</html>`
  }
}
