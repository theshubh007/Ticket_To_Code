import * as vscode from 'vscode';

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ticketToCode.chat';

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
          case 'sendMessage':
            vscode.window.showInformationMessage(`Message sent: ${message.content} (UI only)`);
            break;
          case 'stopStreaming':
            vscode.window.showInformationMessage('Stop streaming clicked (UI only)');
            break;
          case 'useTool':
            vscode.window.showInformationMessage(`Tool used: ${message.toolName} (UI only)`);
            break;
          case 'openFile':
            vscode.window.showInformationMessage(`Open file: ${message.filePath} (UI only)`);
            break;
          case 'applyPatch':
            vscode.window.showInformationMessage('Apply patch clicked (UI only)');
            break;
          case 'runCommand':
            vscode.window.showInformationMessage(`Run command: ${message.command} (UI only)`);
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
        <title>AI Chat</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: var(--vscode-panel-background);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding: 12px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            }
            
            .ticket-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .ticket-key {
                font-weight: 600;
                color: var(--vscode-foreground);
            }
            
            .ticket-title {
                color: var(--vscode-descriptionForeground);
                font-size: 12px;
            }
            
            .status-pill {
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                background: var(--vscode-charts-blue);
                color: white;
            }
            
            .indexing-progress {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
            }
            
            .progress-bar {
                width: 100px;
                height: 4px;
                background: var(--vscode-progressBar-background);
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: var(--vscode-progressBar-background);
                transition: width 0.3s ease;
            }
            
            .messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .message {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .message.user {
                align-items: flex-end;
            }
            
            .message.assistant {
                align-items: flex-start;
            }
            
            .message.system {
                align-items: center;
            }
            
            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 12px;
                word-wrap: break-word;
                white-space: pre-wrap;
            }
            
            .message.user .message-content {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border-bottom-right-radius: 4px;
            }
            
            .message.assistant .message-content {
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-bottom-left-radius: 4px;
            }
            
            .message.system .message-content {
                background: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                text-align: center;
                font-style: italic;
                font-size: 12px;
            }
            
            .message-timestamp {
                font-size: 10px;
                color: var(--vscode-descriptionForeground);
                margin: 0 8px;
            }
            
            .input-area {
                background: var(--vscode-panel-background);
                border-top: 1px solid var(--vscode-panel-border);
                padding: 16px;
                flex-shrink: 0;
            }
            
            .input-container {
                display: flex;
                gap: 8px;
                align-items: flex-end;
            }
            
            .input-field {
                flex: 1;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                padding: 8px 12px;
                color: var(--vscode-input-foreground);
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                resize: none;
                min-height: 20px;
                max-height: 100px;
            }
            
            .input-field:focus {
                outline: none;
                border-color: var(--vscode-focusBorder);
            }
            
            .send-btn {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: background 0.2s ease;
            }
            
            .send-btn:hover:not(:disabled) {
                background: var(--vscode-button-hoverBackground);
            }
            
            .send-btn:disabled {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                cursor: not-allowed;
            }
            
            .stop-btn {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: 1px solid var(--vscode-button-border);
            }
            
            .tools {
                display: flex;
                gap: 4px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }
            
            .tool-btn {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: 1px solid var(--vscode-button-border);
                border-radius: 4px;
                padding: 4px 8px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
            }
            
            .tool-btn:hover {
                background: var(--vscode-button-secondaryHoverBackground);
            }
            
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: var(--vscode-descriptionForeground);
                text-align: center;
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .code-block {
                background: var(--vscode-textCodeBlock-background);
                border: 1px solid var(--vscode-textCodeBlock-border);
                border-radius: 4px;
                padding: 8px;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                overflow-x: auto;
                margin: 8px 0;
            }
            
            .streaming-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: var(--vscode-charts-blue);
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="ticket-info">
                <div>
                    <div class="ticket-key">TICKET-123</div>
                    <div class="ticket-title">Fix login bug in authentication flow</div>
                </div>
                <div class="status-pill">In Progress</div>
            </div>
            <div class="indexing-progress">
                <span>Indexing...</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 75%"></div>
                </div>
                <span>75%</span>
            </div>
        </div>
        
        <div class="messages" id="messages">
            <div class="message system">
                <div class="message-content">You are helping implement Jira ticket TICKET-123: Fix login bug in authentication flow

Description: The login form is not properly validating user credentials and allowing invalid logins.

Status: In Progress
Priority: High
Type: Bug
Assignee: John Doe

Available tools:
- /search &lt;query&gt; - Search the codebase
- /open &lt;file:line&gt; - Open a file at specific line
- /plan - Create an implementation plan
- /scaffold - Generate file structure
- /commit - Propose git changes
- /test - Run tests
- /explain &lt;code&gt; - Explain code functionality

Please help implement this ticket step by step.</div>
            </div>
            
            <div class="message user">
                <div class="message-content">Can you help me understand the current authentication flow?</div>
                <div class="message-timestamp">2:30 PM</div>
            </div>
            
            <div class="message assistant">
                <div class="message-content">I'll help you understand the authentication flow. Let me search for the relevant authentication code first.

<div class="code-block">// Found in auth/login.js
function validateCredentials(username, password) {
    // Current implementation has a bug
    if (username && password) {
        return true; // This is the bug - no actual validation
    }
    return false;
}</div>

The issue is in the \`validateCredentials\` function. It's returning \`true\` for any non-empty username and password combination without actually validating them against the database or authentication service.</div>
                <div class="message-timestamp">2:31 PM</div>
            </div>
        </div>
        
        <div class="input-area">
            <div class="tools">
                <button class="tool-btn" onclick="insertTool('/search')">Search</button>
                <button class="tool-btn" onclick="insertTool('/open')">Open File</button>
                <button class="tool-btn" onclick="insertTool('/plan')">Plan</button>
                <button class="tool-btn" onclick="insertTool('/scaffold')">Scaffold</button>
                <button class="tool-btn" onclick="insertTool('/commit')">Commit</button>
                <button class="tool-btn" onclick="insertTool('/test')">Test</button>
                <button class="tool-btn" onclick="insertTool('/explain')">Explain</button>
            </div>
            <div class="input-container">
                <textarea 
                    class="input-field" 
                    id="messageInput" 
                    placeholder="Ask me anything about implementing this ticket..."
                    rows="1"
                ></textarea>
                <button class="send-btn" id="sendBtn">
                    Send
                </button>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const messagesContainer = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            
            function scrollToBottom() {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            function insertTool(tool) {
                messageInput.value = tool + ' ';
                messageInput.focus();
            }
            
            function sendMessage() {
                const content = messageInput.value.trim();
                if (!content) return;
                
                // Add user message to UI
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.innerHTML = \`
                    <div class="message-content">\${content}</div>
                    <div class="message-timestamp">\${new Date().toLocaleTimeString()}</div>
                \`;
                messagesContainer.appendChild(userMessage);
                
                messageInput.value = '';
                messageInput.style.height = 'auto';
                
                // Add assistant response
                setTimeout(() => {
                    const assistantMessage = document.createElement('div');
                    assistantMessage.className = 'message assistant';
                    assistantMessage.innerHTML = \`
                        <div class="message-content">I understand you want to \${content.toLowerCase()}. Let me help you with that. This is a mock response for UI demonstration.</div>
                        <div class="message-timestamp">\${new Date().toLocaleTimeString()}</div>
                    \`;
                    messagesContainer.appendChild(assistantMessage);
                    scrollToBottom();
                }, 1000);
                
                vscode.postMessage({
                    command: 'sendMessage',
                    content: content
                });
                
                scrollToBottom();
            }
            
            sendBtn.addEventListener('click', sendMessage);
            
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
            });
            
            // Auto-scroll to bottom
            scrollToBottom();
        </script>
    </body>
    </html>`;
  }
}