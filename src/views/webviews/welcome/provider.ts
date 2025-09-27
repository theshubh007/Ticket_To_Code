import * as vscode from 'vscode';

export class WelcomeProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ticketToCode.welcome';

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
          case 'signInJira':
            await vscode.commands.executeCommand('ticketToCode.signInJira');
            break;
          case 'importSettings':
            vscode.window.showInformationMessage('Import Settings clicked (UI only)');
            break;
          case 'openSettings':
            await vscode.commands.executeCommand('ticketToCode.openSettings');
            break;
          case 'openIntegrations':
            await vscode.commands.executeCommand('ticketToCode.openIntegrations');
            break;
          case 'openAbout':
            await vscode.commands.executeCommand('ticketToCode.openAbout');
            break;
          case 'letsGo':
            vscode.window.showInformationMessage('Let\'s go! clicked (UI only)');
            break;
          case 'openWebsite':
            await vscode.env.openExternal(vscode.Uri.parse('https://ticket-to-code.dev'));
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
        <title>Welcome to Ticket to Code</title>
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
                width: 64px;
                height: 64px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: white;
                font-weight: bold;
            }
            
            .title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                color: var(--vscode-foreground);
            }
            
            .subtitle {
                font-size: 16px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 30px;
            }
            
            .description-section {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: left;
            }
            
            .description-section h3 {
                font-size: 18px;
                font-weight: 600;
                color: var(--vscode-foreground);
                margin-bottom: 12px;
                margin-top: 0;
            }
            
            .description-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: var(--vscode-foreground);
                margin-bottom: 8px;
                margin-top: 16px;
            }
            
            .description-section p {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.6;
                margin-bottom: 16px;
            }
            
            .description-section ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .description-section li {
                font-size: 13px;
                color: var(--vscode-descriptionForeground);
                line-height: 1.5;
                margin-bottom: 6px;
            }
            
            .description-section strong {
                color: var(--vscode-foreground);
                font-weight: 600;
            }
            
            .actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 30px;
            }
            
            .btn {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                text-align: center;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            }
            
            .btn-primary:disabled {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: 1px solid var(--vscode-button-border);
            }
            
            .btn-secondary:hover {
                background: var(--vscode-button-secondaryHoverBackground);
            }
            
            .btn-row {
                display: flex;
                gap: 8px;
            }
            
            .btn-small {
                flex: 1;
                padding: 8px 12px;
                font-size: 12px;
            }
            
            .integrations {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .integrations-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 15px;
                color: var(--vscode-foreground);
            }
            
            .integration-tiles {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .integration-tile {
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }
            
            .integration-tile:hover {
                background: var(--vscode-input-hoverBackground);
                border-color: var(--vscode-focusBorder);
            }
            
            .integration-tile.configured {
                border-color: var(--vscode-charts-green);
                background: var(--vscode-charts-green);
                color: white;
            }
            
            .integration-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .integration-name {
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .integration-status {
                font-size: 10px;
                opacity: 0.8;
            }
            
            .learn-more {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .learn-more a {
                color: var(--vscode-textLink-foreground);
                text-decoration: none;
            }
            
            .learn-more a:hover {
                text-decoration: underline;
            }
            
            .lets-go {
                position: sticky;
                bottom: 0;
                background: var(--vscode-editor-background);
                padding: 20px 0;
                border-top: 1px solid var(--vscode-panel-border);
                margin: 0 -20px;
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .lets-go-btn {
                width: 100%;
                padding: 16px;
                font-size: 16px;
                font-weight: 600;
            }
            
            .error-message {
                color: var(--vscode-errorForeground);
                font-size: 12px;
                margin-top: 8px;
                text-align: center;
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
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🎫</div>
            <div class="title">Ticket to Code</div>
            <div class="subtitle">Transform your Jira tickets into production-ready code with AI assistance, intelligent code indexing, and seamless development workflow integration.</div>
        </div>
        
        <div class="description-section">
            <h3>What is Ticket to Code?</h3>
            <p>Ticket to Code is a powerful VS Code extension that bridges the gap between project management and development. It connects directly to your Jira instance, fetches your assigned tickets, and provides an AI-powered development assistant to help you implement features, fix bugs, and write code efficiently.</p>
            
            <h4>Key Features:</h4>
            <ul>
                <li><strong>Jira Integration:</strong> Direct connection to your Jira instance with OAuth 2.0 authentication</li>
                <li><strong>AI-Powered Development:</strong> Get intelligent code suggestions and implementation help</li>
                <li><strong>Live Code Indexing:</strong> AI understands your entire codebase for context-aware assistance</li>
                <li><strong>Interactive Chat:</strong> Natural language interface for development tasks</li>
                <li><strong>Smart Tools:</strong> Built-in commands for searching, opening files, and git operations</li>
            </ul>
        </div>
        
        <div class="actions">
            <button class="btn btn-primary" id="signInJira">
                <span class="status-indicator status-disconnected"></span>
                Sign in with Jira
            </button>
            
            <div class="btn-row">
                <button class="btn btn-secondary btn-small" id="importSettings">Import Settings</button>
                <button class="btn btn-secondary btn-small" id="openSettings">Open Settings</button>
            </div>
        </div>
        
        <div class="integrations">
            <div class="integrations-title">We recommend setting up your AI provider:</div>
            <div class="integration-tiles">
                <div class="integration-tile" id="aiProvider">
                    <div class="integration-icon">🤖</div>
                    <div class="integration-name">AI Provider (API Key)</div>
                    <div class="integration-status">Enter key to enable</div>
                </div>
                <div class="integration-tile" id="indexingSettings">
                    <div class="integration-icon">📁</div>
                    <div class="integration-name">Indexing Settings</div>
                    <div class="integration-status">Paths/Excludes</div>
                </div>
            </div>
        </div>
        
        <div class="learn-more">
            <a href="#" id="openWebsite">Learn more: https://ticket-to-code.dev</a>
        </div>
        
        <div class="lets-go">
            <button class="btn btn-primary lets-go-btn" id="letsGo" disabled>
                Let's go!
            </button>
            <div class="error-message">You must provide a valid API key.</div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            document.getElementById('signInJira').addEventListener('click', () => {
                vscode.postMessage({ command: 'signInJira' });
            });
            
            document.getElementById('importSettings').addEventListener('click', () => {
                vscode.postMessage({ command: 'importSettings' });
            });
            
            document.getElementById('openSettings').addEventListener('click', () => {
                vscode.postMessage({ command: 'openSettings' });
            });
            
            document.getElementById('aiProvider').addEventListener('click', () => {
                vscode.postMessage({ command: 'openIntegrations' });
            });
            
            document.getElementById('indexingSettings').addEventListener('click', () => {
                vscode.postMessage({ command: 'openSettings' });
            });
            
            document.getElementById('letsGo').addEventListener('click', () => {
                vscode.postMessage({ command: 'letsGo' });
            });
            
            document.getElementById('openWebsite').addEventListener('click', (e) => {
                e.preventDefault();
                vscode.postMessage({ command: 'openWebsite' });
            });
        </script>
    </body>
    </html>`;
  }
}