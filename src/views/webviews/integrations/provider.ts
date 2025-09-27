import * as vscode from 'vscode';

export class IntegrationsProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ticketToCode.integrations';

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'saveAIKey':
            vscode.window.showInformationMessage(`Save AI key for ${message.provider} (UI only)`);
            break;
          case 'testAIKey':
            vscode.window.showInformationMessage(`Test AI key for ${message.provider} (UI only)`);
            break;
          case 'clearAIKey':
            vscode.window.showInformationMessage(`Clear AI key for ${message.provider} (UI only)`);
            break;
          case 'saveJiraSettings':
            vscode.window.showInformationMessage('Save Jira settings clicked (UI only)');
            break;
          case 'testJiraConnection':
            vscode.window.showInformationMessage('Test Jira connection clicked (UI only)');
            break;
          case 'signOutJira':
            vscode.window.showInformationMessage('Sign out Jira clicked (UI only)');
            break;
          case 'saveIndexingSettings':
            vscode.window.showInformationMessage('Save indexing settings clicked (UI only)');
            break;
          case 'exportSettings':
            vscode.window.showInformationMessage('Export settings clicked (UI only)');
            break;
          case 'importSettings':
            vscode.window.showInformationMessage('Import settings clicked (UI only)');
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Integrations</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            
            .section {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
                color: var(--vscode-foreground);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .section-icon {
                font-size: 20px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--vscode-foreground);
                margin-bottom: 4px;
            }
            
            .form-input {
                width: 100%;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                padding: 8px 12px;
                color: var(--vscode-input-foreground);
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
            }
            
            .form-input:focus {
                outline: none;
                border-color: var(--vscode-focusBorder);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 60px;
            }
            
            .form-select {
                background: var(--vscode-dropdown-background);
                border: 1px solid var(--vscode-dropdown-border);
                color: var(--vscode-dropdown-foreground);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .btn {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: background 0.2s ease;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            
            .btn:hover:not(:disabled) {
                background: var(--vscode-button-hoverBackground);
            }
            
            .btn:disabled {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                cursor: not-allowed;
            }
            
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: 1px solid var(--vscode-button-border);
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: var(--vscode-button-secondaryHoverBackground);
            }
            
            .btn-danger {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-errorForeground);
                border: 1px solid var(--vscode-errorForeground);
            }
            
            .btn-danger:hover:not(:disabled) {
                background: var(--vscode-errorForeground);
                color: var(--vscode-button-foreground);
            }
            
            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 6px;
            }
            
            .status-connected {
                background: var(--vscode-charts-green);
            }
            
            .status-disconnected {
                background: var(--vscode-charts-red);
            }
            
            .api-key-display {
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                padding: 8px 12px;
                font-family: var(--vscode-editor-font-family);
                font-size: 12px;
                color: var(--vscode-input-foreground);
                word-break: break-all;
            }
            
            .api-key-masked {
                color: var(--vscode-descriptionForeground);
            }
            
            .help-text {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                margin-top: 4px;
            }
            
            .credits-info {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 12px;
                margin-top: 12px;
            }
            
            .credits-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 8px;
                color: var(--vscode-foreground);
            }
            
            .credits-content {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <!-- AI Provider Section -->
        <div class="section">
            <div class="section-title">
                <span class="section-icon">🤖</span>
                AI Provider Configuration
            </div>
            
            <div class="form-group">
                <label class="form-label">Provider</label>
                <select class="form-input form-select" id="aiProvider">
                    <option value="openai" selected>OpenAI</option>
                    <option value="azure">Azure OpenAI</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">API Key</label>
                <div class="api-key-display" id="apiKeyDisplay">
                    No API key configured
                </div>
                <div class="help-text">Your API key is stored securely in VS Code's secret storage</div>
            </div>
            
            <div class="form-group">
                <label class="form-label">New API Key</label>
                <input type="password" class="form-input" id="newApiKey" placeholder="Enter your API key">
            </div>
            
            <div class="form-group">
                <label class="form-label">Custom Router URL (Optional)</label>
                <input type="text" class="form-input" id="routerUrl" placeholder="https://your-router.com/api">
                <div class="help-text">Leave empty to use the default provider endpoints</div>
            </div>
            
            <div>
                <button class="btn" onclick="saveAIKey()">Save API Key</button>
                <button class="btn btn-secondary" onclick="testAIKey()">Test Connection</button>
                <button class="btn btn-danger" onclick="clearAIKey()">Clear Key</button>
            </div>
            
            <div class="credits-info">
                <div class="credits-title">Usage Credits</div>
                <div class="credits-content">
                    <div>• OpenAI: Pay per token usage</div>
                    <div>• Azure: Pay per token usage</div>
                    <div>• OpenRouter: Pay per token usage</div>
                    <div>• Custom: Depends on your provider</div>
                </div>
            </div>
        </div>
        
        <!-- Jira Configuration Section -->
        <div class="section">
            <div class="section-title">
                <span class="section-icon">🎫</span>
                Jira Configuration
            </div>
            
            <div class="form-group">
                <label class="form-label">Base URL</label>
                <input type="url" class="form-input" id="jiraBaseUrl" placeholder="https://company.atlassian.net">
                <div class="help-text">The base URL of your Jira instance</div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Authentication Method</label>
                    <select class="form-input form-select" id="jiraAuthMethod">
                        <option value="oauth" selected>OAuth 2.0 (Recommended)</option>
                        <option value="pat">Personal Access Token</option>
                    </select>
                </div>
                <div class="form-group" id="jiraEmailGroup" style="display: none">
                    <label class="form-label">Email (for PAT)</label>
                    <input type="email" class="form-input" id="jiraEmail" placeholder="your.email@company.com">
                </div>
            </div>
            
            <div>
                <button class="btn" onclick="saveJiraSettings()">Save Settings</button>
                <button class="btn btn-secondary" onclick="testJiraConnection()">Test Connection</button>
                <button class="btn btn-danger" onclick="signOutJira()">Sign Out</button>
            </div>
        </div>
        
        <!-- Indexing Configuration Section -->
        <div class="section">
            <div class="section-title">
                <span class="section-icon">📁</span>
                Indexing Configuration
            </div>
            
            <div class="form-group">
                <label class="form-label">Include Patterns</label>
                <textarea class="form-input form-textarea" id="indexPaths" placeholder="**/*">**/*</textarea>
                <div class="help-text">One pattern per line. Use glob patterns to specify which files to index.</div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Exclude Patterns</label>
                <textarea class="form-input form-textarea" id="indexExclude" placeholder="**/node_modules/**">**/node_modules/**
**/.git/**
**/dist/**
**/build/**</textarea>
                <div class="help-text">One pattern per line. Files matching these patterns will be excluded from indexing.</div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Max File Size (KB)</label>
                <input type="number" class="form-input" id="maxFileSizeKB" value="512" min="1" max="10240">
                <div class="help-text">Files larger than this size will be skipped during indexing.</div>
            </div>
            
            <div>
                <button class="btn" onclick="saveIndexingSettings()">Save Settings</button>
            </div>
        </div>
        
        <!-- Settings Management Section -->
        <div class="section">
            <div class="section-title">
                <span class="section-icon">⚙️</span>
                Settings Management
            </div>
            
            <div>
                <button class="btn btn-secondary" onclick="exportSettings()">Export Settings</button>
                <button class="btn btn-secondary" onclick="importSettings()">Import Settings</button>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            // AI Provider functions
            function saveAIKey() {
                const provider = document.getElementById('aiProvider').value;
                const apiKey = document.getElementById('newApiKey').value;
                
                if (!apiKey) {
                    vscode.window.showErrorMessage('Please enter an API key');
                    return;
                }
                
                vscode.postMessage({
                    command: 'saveAIKey',
                    provider: provider,
                    apiKey: apiKey
                });
            }
            
            function testAIKey() {
                const provider = document.getElementById('aiProvider').value;
                const apiKey = document.getElementById('newApiKey').value;
                
                if (!apiKey) {
                    vscode.window.showErrorMessage('Please enter an API key to test');
                    return;
                }
                
                vscode.postMessage({
                    command: 'testAIKey',
                    provider: provider,
                    apiKey: apiKey
                });
            }
            
            function clearAIKey() {
                const provider = document.getElementById('aiProvider').value;
                
                vscode.postMessage({
                    command: 'clearAIKey',
                    provider: provider
                });
            }
            
            // Jira functions
            function saveJiraSettings() {
                const baseUrl = document.getElementById('jiraBaseUrl').value;
                const authMethod = document.getElementById('jiraAuthMethod').value;
                const email = document.getElementById('jiraEmail').value;
                
                if (!baseUrl) {
                    vscode.window.showErrorMessage('Please enter a Jira base URL');
                    return;
                }
                
                vscode.postMessage({
                    command: 'saveJiraSettings',
                    settings: {
                        baseUrl: baseUrl,
                        authMethod: authMethod,
                        email: email
                    }
                });
            }
            
            function testJiraConnection() {
                vscode.postMessage({
                    command: 'testJiraConnection'
                });
            }
            
            function signOutJira() {
                vscode.postMessage({
                    command: 'signOutJira'
                });
            }
            
            // Indexing functions
            function saveIndexingSettings() {
                const paths = document.getElementById('indexPaths').value.split('\\n').filter(p => p.trim());
                const exclude = document.getElementById('indexExclude').value.split('\\n').filter(p => p.trim());
                const maxFileSizeKB = parseInt(document.getElementById('maxFileSizeKB').value);
                
                vscode.postMessage({
                    command: 'saveIndexingSettings',
                    settings: {
                        paths: paths,
                        exclude: exclude,
                        maxFileSizeKB: maxFileSizeKB
                    }
                });
            }
            
            // Settings management functions
            function exportSettings() {
                vscode.postMessage({
                    command: 'exportSettings'
                });
            }
            
            function importSettings() {
                vscode.postMessage({
                    command: 'importSettings'
                });
            }
            
            // Handle auth method change
            document.getElementById('jiraAuthMethod').addEventListener('change', function() {
                const emailGroup = document.getElementById('jiraEmailGroup');
                emailGroup.style.display = this.value === 'pat' ? 'block' : 'none';
            });
            
            // Handle provider change
            document.getElementById('aiProvider').addEventListener('change', function() {
                updateApiKeyDisplay();
            });
            
            function updateApiKeyDisplay() {
                const provider = document.getElementById('aiProvider').value;
                const display = document.getElementById('apiKeyDisplay');
                display.textContent = \`No API key configured for \${provider}\`;
            }
        </script>
    </body>
    </html>`;
  }
}