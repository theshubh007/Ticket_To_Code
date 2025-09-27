import * as vscode from "vscode"
import { AIService } from "../services/AIService"
import { JiraProvider } from "./JiraProvider"
import { GeneratedContentProvider } from "../virtualDocs/GeneratedContentProvider"
import { CodeIndexer } from "../services/CodeIndexer"
import { APIService } from "../services/APIService"

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "aiChat"
  private _view?: vscode.WebviewView
  private readonly ai: AIService
  private readonly apiService: APIService

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly jira: JiraProvider,
    private readonly codeIndexer: CodeIndexer
  ) {
    this.ai = new AIService(context)
    this.apiService = new APIService({
      baseUrl: "http://localhost:8000/api/v1", // Default backend URL
      timeout: 30000,
    })
  }

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
        case "sendMessage": {
          await this.processUserQuery(msg.text)
          break
        }
        case "findContext": {
          await this.findRelevantContext(msg.query)
          break
        }
        case "applyCode": {
          await this.applyGeneratedCode(msg.code)
          break
        }
        case "setAiKey": {
          await this.context.secrets.store("ticket-to-code.aiKey", msg.key)
          vscode.window.showInformationMessage("AI key saved.")
          break
        }
        case "undoAll": {
          // Handle undo all changes
          vscode.window.showInformationMessage("Undo all changes")
          break
        }
        case "keepAll": {
          // Handle keep all changes
          vscode.window.showInformationMessage("Keep all changes")
          break
        }
        case "toggleAgentMode": {
          // Handle agent mode toggle
          vscode.window.showInformationMessage("Agent mode toggled")
          break
        }
        case "changeMode": {
          // Handle mode change
          vscode.window.showInformationMessage(`Mode changed to: ${msg.mode}`)
          break
        }
        case "attachFile": {
          // Handle file attachment
          vscode.window.showInformationMessage("File attachment feature")
          break
        }
        case "openWebsite": {
          await vscode.commands.executeCommand("ticket-to-code.openWebsite")
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
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Assistant</title>
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
  --message-user: #007acc;
  --message-ai: #2d2d30;
  --message-context: #1e3a8a;
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%);
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.header-subtitle {
  font-size: 14px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg);
}

.action-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent);
}

.action-btn.primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.action-btn.primary:hover {
  background: #005a9e;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.progress-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--accent);
  animation: spin 2s linear infinite;
}

@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background: var(--message-user);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai {
  align-self: flex-start;
  background: var(--message-ai);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.message.context {
  align-self: flex-start;
  background: var(--message-context);
  border: 1px solid var(--accent);
  border-left: 4px solid var(--accent);
  border-bottom-left-radius: 4px;
}

.message.progress {
  align-self: center;
  background: var(--input-bg);
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.context-files {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.context-file {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: var(--muted);
}

.input-container {
  border-top: 1px solid var(--border);
  background: var(--card-bg);
  padding: 20px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.context-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--muted);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.tab.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.tab:hover:not(.active) {
  background: var(--hover-bg);
  border-color: var(--border);
}

.input-area {
  position: relative;
}

.input-field-container {
  position: relative;
  margin-bottom: 16px;
}

.textarea {
  width: 100%;
  min-height: 100px;
  padding: 16px 20px 50px 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--input-bg);
  color: var(--fg);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.input-overlay {
  position: absolute;
  bottom: 16px;
  left: 20px;
  pointer-events: none;
  z-index: 1;
}

.context-hints {
  display: flex;
  gap: 8px;
  align-items: center;
}

.hint {
  background: var(--accent);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.hint-text {
  color: var(--muted);
  font-size: 11px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.agent-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent);
}

.agent-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.agent-icon {
  font-size: 16px;
}

.agent-text {
  font-weight: 600;
}

.shortcut {
  color: var(--muted);
  font-size: 10px;
  margin-left: 4px;
}

.mode-selector select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--fg);
  font-size: 12px;
  cursor: pointer;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attach-btn, .send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.attach-btn {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
}

.attach-btn:hover {
  background: var(--hover-bg);
  color: var(--fg);
}

.send-btn {
  background: var(--accent);
  color: white;
}

.send-btn:hover {
  background: #005a9e;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: var(--border);
  cursor: not-allowed;
  transform: none;
}

.attach-icon, .send-icon {
  font-size: 18px;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status.success { color: var(--success); }
.status.warning { color: var(--warning); }
.status.error { color: var(--error); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--fg);
}

.empty-description {
  font-size: 14px;
  max-width: 400px;
  line-height: 1.6;
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--muted);
}

/* Responsive design */
@media (max-width: 480px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .messages-container {
    padding: 16px;
  }
  
  .input-container {
    padding: 16px;
  }
  
  .message {
    max-width: 90%;
  }
}
</style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-left">
        <h2 class="header-title">AI Assistant</h2>
        <span class="header-subtitle">Powered by AI</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" id="undoAll">Undo All</button>
        <button class="action-btn primary" id="keepAll">Keep All</button>
        <div class="progress-indicator">
          <div class="progress-circle">
            <span class="progress-text">75%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="messages-container" id="messages">
      <div class="empty-state">
        <div class="empty-icon">🤖</div>
        <h3 class="empty-title">Welcome to AI Assistant</h3>
        <p class="empty-description">
          Ask me anything about your code, tickets, or development workflow. 
          I'm here to help you write better code and solve problems faster.
        </p>
      </div>
    </div>
    
    <div class="input-container">
      <div class="input-header">
        <div class="context-tabs">
          <div class="tab active" data-context="general">General</div>
          <div class="tab" data-context="files">Files</div>
          <div class="tab" data-context="ticket">Ticket</div>
        </div>
      </div>
      
      <div class="input-area">
        <div class="input-field-container">
          <textarea id="input" class="textarea" placeholder="Ask me anything about your code or tickets..."></textarea>
          <div class="input-overlay">
            <div class="context-hints">
              <span class="hint">@</span>
              <span class="hint-text">context</span>
              <span class="hint">/</span>
              <span class="hint-text">commands</span>
            </div>
          </div>
        </div>
        
        <div class="input-footer">
          <div class="footer-left">
            <button class="agent-btn" id="agentMode">
              <span class="agent-icon">∞</span>
              <span class="agent-text">Agent Mode</span>
              <span class="shortcut">Ctrl+I</span>
            </button>
            <div class="mode-selector">
              <select id="modeSelect">
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
                <option value="assist">Assist</option>
              </select>
            </div>
          </div>
          
          <div class="footer-right">
            <button class="attach-btn" id="attachFile" title="Attach file">
              <span class="attach-icon">📎</span>
            </button>
            <button class="send-btn" id="send" title="Send message">
              <span class="send-icon">↑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const messagesContainer = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

// UI elements
const contextTabs = document.querySelectorAll('.tab');
const undoAllBtn = document.getElementById('undoAll');
const keepAllBtn = document.getElementById('keepAll');
const agentModeBtn = document.getElementById('agentMode');
const modeSelect = document.getElementById('modeSelect');
const attachFileBtn = document.getElementById('attachFile');

let currentContext = 'general';
let isAgentMode = false;

// Remove empty state when first message is added
function removeEmptyState() {
  const emptyState = messagesContainer.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
}

function addMessage(type, text, data = null) {
  removeEmptyState();
  
  const messageEl = document.createElement('div');
  messageEl.className = 'message ' + type;
  
  if (type === 'context' && data && data.context) {
    messageEl.innerHTML = \`
      <div>\${text}</div>
      <div class="context-files">
        \${data.context.map(f => 
          \`<div class="context-file">\${f.type}: \${f.path} (relevance: \${f.relevance})\${f.ticketRelevant ? ' 🎫' : ''}</div>\`
        ).join('')}
      </div>
    \`;
  } else if (type === 'progress') {
    messageEl.innerHTML = \`<div class="status \${data?.status || 'warning'}">\${text}</div>\`;
  } else {
    messageEl.textContent = text;
  }
  
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  
  addMessage('user', text);
  vscode.postMessage({command: 'sendMessage', text: text});
  input.value = '';
  
  // Disable send button while processing
  sendBtn.disabled = true;
  sendBtn.style.opacity = '0.6';
}

function findContext() {
  const text = input.value.trim();
  if (!text) return;
  
  vscode.postMessage({command: 'findContext', query: text});
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

// Context tab switching
contextTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    contextTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentContext = tab.dataset.context;
    
    // Update placeholder based on context
    switch(currentContext) {
      case 'files':
        input.placeholder = 'Ask about files and code...';
        break;
      case 'ticket':
        input.placeholder = 'Ask about the selected ticket...';
        break;
      default:
        input.placeholder = 'Ask me anything about your code or tickets...';
    }
  });
});

// Action buttons
undoAllBtn.addEventListener('click', () => {
  vscode.postMessage({command: 'undoAll'});
});

keepAllBtn.addEventListener('click', () => {
  vscode.postMessage({command: 'keepAll'});
});

// Agent mode toggle
agentModeBtn.addEventListener('click', () => {
  isAgentMode = !isAgentMode;
  agentModeBtn.classList.toggle('active', isAgentMode);
  vscode.postMessage({command: 'toggleAgentMode'});
});

// Mode selector
modeSelect.addEventListener('change', (e) => {
  vscode.postMessage({command: 'changeMode', mode: e.target.value});
});

// Attach file
attachFileBtn.addEventListener('click', () => {
  vscode.postMessage({command: 'attachFile'});
});

// Keyboard shortcuts
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    sendMessage();
  }
});

// Handle incoming messages from extension
window.addEventListener('message', (e) => {
  const message = e.data;
  
  switch(message.type) {
    case 'contextFinding':
      if (message.status === 'started') {
        addMessage('progress', message.message, {status: 'warning'});
      } else if (message.status === 'progress') {
        addMessage('context', message.message, {context: message.context});
      } else if (message.status === 'completed') {
        addMessage('context', message.message, {context: message.context, status: 'success'});
      } else if (message.status === 'error') {
        addMessage('progress', message.message, {status: 'error'});
      }
      break;
      
    case 'aiResponse':
      addMessage('ai', message.content);
      if (message.context && message.context.length > 0) {
        addMessage('context', \`Found \${message.context.length} relevant files:\`, {context: message.context});
      }
      // Re-enable send button
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      break;
      
    case 'error':
      addMessage('progress', message.content, {status: 'error'});
      // Re-enable send button
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      break;
  }
});

// Auto-resize textarea
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 200) + 'px';
});

// Initialize textarea height
input.style.height = '100px';
</script>
</body>
</html>`
  }

  private async processUserQuery(query: string) {
    if (!this._view) return

    try {
      // Step 1: Find relevant context using enhanced local analysis
      const context = await this.findRelevantContext(query)

      // If no context found, provide a helpful response
      if (context.length === 0) {
        this._view.webview.postMessage({
          type: "aiResponse",
          content: `I couldn't find any relevant code files for your query: "${query}"\n\nThis could be because:\n• No files match your search terms\n• The workspace hasn't been indexed yet\n• You're searching for terms that don't exist in the codebase\n\nTry using different keywords or check if your workspace contains the files you're looking for.`,
          context: [],
          analysis: "No relevant files found",
          confidence: 0,
          suggestions: [
            "Try different search terms",
            "Check if workspace is properly indexed",
            "Verify file types are supported",
          ],
        })
        return
      }

      // Step 2: Enhanced analysis via API service (hybrid approach)
      const enhancedAnalysis = await this.apiService.analyzeContext({
        query,
        localContext: context,
        workspaceFiles: context.map((f) => f.path),
      })

      // Step 3: Generate AI solution
      const response = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: "AI is analyzing context and generating response…",
        },
        async () => {
          // Use enhanced context for better AI processing
          const aiResponse = await this.ai.processWithContext(
            query,
            enhancedAnalysis.relevantFiles
          )

          // Generate additional solution via API service
          const apiSolution = await this.apiService.generateSolution(
            enhancedAnalysis.relevantFiles,
            query
          )

          return `${aiResponse}\n\n--- Enhanced Analysis ---\n${apiSolution}`
        }
      )

      this._view.webview.postMessage({
        type: "aiResponse",
        content: response,
        context: enhancedAnalysis.relevantFiles,
        analysis: enhancedAnalysis.analysis,
        confidence: enhancedAnalysis.confidence,
        suggestions: enhancedAnalysis.suggestions,
      })
    } catch (error) {
      this._view.webview.postMessage({
        type: "error",
        content: `Error processing query: ${error}`,
      })
    }
  }

  private async findRelevantContext(query: string) {
    if (!this._view) return []

    // Show context finding progress
    this._view.webview.postMessage({
      type: "contextFinding",
      status: "started",
      message: "Finding relevant code context...",
    })

    try {
      // Local file analysis
      const context = await this.findLocalContext(query)

      if (context.length === 0) {
        this._view.webview.postMessage({
          type: "contextFinding",
          status: "completed",
          message:
            "No relevant files found for your query. Try using different keywords or check if the workspace is properly indexed.",
          context: context,
        })
      } else {
        this._view.webview.postMessage({
          type: "contextFinding",
          status: "completed",
          message: `Context analysis complete - ${context.length} relevant files found`,
          context: context,
        })
      }

      return context
    } catch (error) {
      this._view.webview.postMessage({
        type: "contextFinding",
        status: "error",
        message: `Error finding context: ${error}`,
      })
      return []
    }
  }

  private async findLocalContext(query: string) {
    try {
      console.log(`Starting context search for query: "${query}"`)

      // Ensure workspace is indexed first
      await this.codeIndexer.indexWorkspace()
      console.log("Workspace indexing completed")

      // Use the enhanced CodeIndexer with multi-layered analysis
      const contextResults = await this.codeIndexer.findRelevantContext(query)

      console.log(
        `Found ${contextResults.length} relevant files for query: "${query}"`
      )
      console.log(
        "Context results:",
        contextResults.map((r) => ({ path: r.path, relevance: r.relevance }))
      )

      // Convert to the format expected by the rest of the system
      const relevantFiles = contextResults.map((result) => ({
        uri: result.uri,
        path: result.path,
        content: result.content,
        relevance: result.relevance,
        type: result.type,
        functions: result.functions,
        classes: result.classes,
        matches: result.matches,
      }))

      return relevantFiles
    } catch (error) {
      console.error("Error in findLocalContext:", error)
      // Send error message to frontend
      if (this._view) {
        this._view.webview.postMessage({
          type: "error",
          content: `Context finding failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        })
      }
      return []
    }
  }

  private async applyGeneratedCode(code: { path: string; content: string }) {
    const uri = vscode.Uri.joinPath(
      vscode.workspace.workspaceFolders?.[0].uri ?? this.context.extensionUri,
      code.path
    )
    const edit = new vscode.WorkspaceEdit()
    let exists = true

    try {
      await vscode.workspace.fs.stat(uri)
    } catch {
      exists = false
    }

    if (exists) {
      const generated = vscode.Uri.parse(`generated:${code.path}`)
      GeneratedContentProvider.updateContent(generated, code.content)
      await vscode.commands.executeCommand(
        "vscode.diff",
        uri,
        generated,
        `Review Changes: ${code.path}`
      )
    } else {
      edit.createFile(uri, {
        contents: Buffer.from(code.content),
        overwrite: false,
      })
      await vscode.workspace.applyEdit(edit)
      await vscode.window.showTextDocument(uri)
      await vscode.commands.executeCommand("editor.action.formatDocument")
    }
  }
}
