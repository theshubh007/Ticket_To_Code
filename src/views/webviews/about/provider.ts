import * as vscode from 'vscode';

export class AboutProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ticketToCode.about';

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
          case 'openWebsite':
            await vscode.env.openExternal(vscode.Uri.parse('https://ticket-to-code.dev'));
            break;
          case 'openGitHub':
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/ticket-to-code/ticket-to-code'));
            break;
          case 'openDocumentation':
            await vscode.env.openExternal(vscode.Uri.parse('https://ticket-to-code.dev/docs'));
            break;
          case 'openIssues':
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/ticket-to-code/ticket-to-code/issues'));
            break;
          case 'openChangelog':
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/ticket-to-code/ticket-to-code/blob/main/CHANGELOG.md'));
            break;
          case 'openSettings':
            await vscode.commands.executeCommand('workbench.action.openSettings', 'ticketToCode');
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const extension = vscode.extensions.getExtension('ticket-to-code.ticket-to-code');
    const version = extension?.packageJSON.version || '1.0.0';
    const publisher = extension?.packageJSON.publisher || 'ticket-to-code';

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>About Ticket to Code</title>
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
            
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: white;
                font-weight: bold;
            }
            
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
                color: var(--vscode-foreground);
            }
            
            .version {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 16px;
            }
            
            .description {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
                max-width: 400px;
                margin: 0 auto 30px;
                text-align: center;
            }
            
            .section {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 12px;
                color: var(--vscode-foreground);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .section-icon {
                font-size: 18px;
            }
            
            .link-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .link-item {
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                color: var(--vscode-foreground);
            }
            
            .link-item:hover {
                background: var(--vscode-input-hoverBackground);
                border-color: var(--vscode-focusBorder);
            }
            
            .link-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .link-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .link-description {
                font-size: 10px;
                color: var(--vscode-descriptionForeground);
            }
            
            .features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .feature-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 0;
            }
            
            .feature-icon {
                font-size: 16px;
                width: 20px;
                text-align: center;
            }
            
            .feature-text {
                font-size: 12px;
                color: var(--vscode-foreground);
            }
            
            .stats {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 16px;
                text-align: center;
            }
            
            .stat-item {
                padding: 12px;
                background: var(--vscode-input-background);
                border-radius: 6px;
                border: 1px solid var(--vscode-input-border);
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: var(--vscode-foreground);
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 10px;
                color: var(--vscode-descriptionForeground);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .changelog {
                max-height: 200px;
                overflow-y: auto;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                padding: 12px;
            }
            
            .changelog-item {
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .changelog-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .changelog-version {
                font-size: 12px;
                font-weight: 600;
                color: var(--vscode-foreground);
                margin-bottom: 4px;
            }
            
            .changelog-date {
                font-size: 10px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 6px;
            }
            
            .changelog-changes {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.4;
            }
            
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid var(--vscode-panel-border);
                color: var(--vscode-descriptionForeground);
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🎫</div>
            <div class="title">Ticket to Code</div>
            <div class="version">Version ${version}</div>
            <div class="description">
                Transform your Jira tickets into production-ready code with AI assistance, intelligent code indexing, and seamless development workflow integration.
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">📋</span>
                About Ticket to Code
            </div>
            <div style="font-size: 13px; color: var(--vscode-descriptionForeground); line-height: 1.6; margin-bottom: 16px;">
                <p>Ticket to Code is a revolutionary VS Code extension that bridges the gap between project management and development. It seamlessly connects to your Jira instance, fetches your assigned tickets, and provides an AI-powered development assistant to help you implement features, fix bugs, and write code efficiently.</p>
                
                <p><strong>How it works:</strong></p>
                <ol style="margin: 8px 0; padding-left: 20px;">
                    <li>Connect to your Jira instance using OAuth 2.0 or Personal Access Token</li>
                    <li>Configure your preferred AI provider (OpenAI, Azure, OpenRouter, or Custom)</li>
                    <li>Let the extension index your codebase for context-aware assistance</li>
                    <li>Select a ticket and start chatting with AI to implement it</li>
                    <li>Use built-in tools for code search, file operations, and git integration</li>
                </ol>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">🔗</span>
                Links & Resources
            </div>
            <div class="link-grid">
                <a href="#" class="link-item" onclick="openWebsite()">
                    <div class="link-icon">🌐</div>
                    <div class="link-title">Website</div>
                    <div class="link-description">ticket-to-code.dev</div>
                </a>
                <a href="#" class="link-item" onclick="openGitHub()">
                    <div class="link-icon">📚</div>
                    <div class="link-title">GitHub</div>
                    <div class="link-description">Source code & issues</div>
                </a>
                <a href="#" class="link-item" onclick="openDocumentation()">
                    <div class="link-icon">📖</div>
                    <div class="link-title">Documentation</div>
                    <div class="link-description">User guide & API docs</div>
                </a>
                <a href="#" class="link-item" onclick="openIssues()">
                    <div class="link-icon">🐛</div>
                    <div class="link-title">Report Issue</div>
                    <div class="link-description">Bug reports & feature requests</div>
                </a>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">✨</span>
                Key Features
            </div>
            <div class="features">
                <div class="feature-item">
                    <span class="feature-icon">🎫</span>
                    <span class="feature-text">Jira Integration</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🤖</span>
                    <span class="feature-text">AI Code Generation</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📁</span>
                    <span class="feature-text">Live Code Indexing</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">💬</span>
                    <span class="feature-text">Interactive Chat</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🔧</span>
                    <span class="feature-text">Code Tools</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span class="feature-text">Fast & Efficient</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">📊</span>
                Extension Stats
            </div>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${version}</div>
                    <div class="stat-label">Version</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${publisher}</div>
                    <div class="stat-label">Publisher</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">Active</div>
                    <div class="stat-label">Status</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">📝</span>
                Recent Changes
            </div>
            <div class="changelog">
                <div class="changelog-item">
                    <div class="changelog-version">v1.0.0</div>
                    <div class="changelog-date">December 2024</div>
                    <div class="changelog-changes">
                        • Initial release with Jira integration<br>
                        • AI-powered code generation<br>
                        • Live code indexing and search<br>
                        • Interactive chat interface<br>
                        • Multiple AI provider support
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">
                <span class="section-icon">⚙️</span>
                Quick Actions
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn" onclick="openSettings()">Open Settings</button>
                <button class="btn" onclick="openChangelog()">View Changelog</button>
            </div>
        </div>
        
        <div class="footer">
            <div>Made with ❤️ for developers</div>
            <div style="margin-top: 8px;">
                <a href="#" onclick="openWebsite()" style="color: var(--vscode-textLink-foreground); text-decoration: none;">ticket-to-code.dev</a>
                •
                <a href="#" onclick="openGitHub()" style="color: var(--vscode-textLink-foreground); text-decoration: none;">GitHub</a>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            function openWebsite() {
                vscode.postMessage({ command: 'openWebsite' });
            }
            
            function openGitHub() {
                vscode.postMessage({ command: 'openGitHub' });
            }
            
            function openDocumentation() {
                vscode.postMessage({ command: 'openDocumentation' });
            }
            
            function openIssues() {
                vscode.postMessage({ command: 'openIssues' });
            }
            
            function openChangelog() {
                vscode.postMessage({ command: 'openChangelog' });
            }
            
            function openSettings() {
                vscode.postMessage({ command: 'openSettings' });
            }
        </script>
    </body>
    </html>`;
  }
}