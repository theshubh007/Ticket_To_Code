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
  --bg: var(--vscode-editor-background);
  --fg: var(--vscode-editor-foreground);
  --muted: var(--vscode-descriptionForeground);
  --border: var(--vscode-editorWidget-border);
  --accent: var(--vscode-focusBorder);
  --btn: var(--vscode-button-background);
  --btn-fg: var(--vscode-button-foreground);
  --success: var(--vscode-testing-iconPassed);
  --warning: var(--vscode-testing-iconQueued);
  --error: var(--vscode-testing-iconFailed);
}
* { box-sizing: border-box; }
body { margin:0; font-family: var(--vscode-font-family); color: var(--fg); background: var(--bg); display:flex; flex-direction:column; height:100%; }
.messages { flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
.msg { max-width:80%; padding:8px 10px; border:1px solid var(--border); border-radius:8px; white-space:pre-wrap; }
.msg.user { align-self:flex-end; background: transparent; }
.msg.ai { align-self:flex-start; background: rgba(127,127,127,0.08); }
.msg.context { align-self:flex-start; background: rgba(127,127,127,0.05); border-left:3px solid var(--accent); }
.msg.progress { align-self:center; background: rgba(127,127,127,0.1); text-align:center; }
.context-files { margin-top:8px; }
.context-file { padding:4px 8px; margin:2px 0; background: rgba(127,127,127,0.1); border-radius:4px; font-size:11px; }
.input-container { border-top:1px solid var(--border); background: var(--bg); }
.input-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid var(--border); }
.context-tabs { display:flex; gap:4px; }
.tab { padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer; background: transparent; color: var(--muted); border:1px solid transparent; }
.tab.active { background: var(--accent); color: var(--fg); border-color: var(--accent); }
.tab:hover { background: rgba(127,127,127,0.1); }
.input-actions { display:flex; align-items:center; gap:8px; }
.action-btn { padding:4px 8px; border-radius:4px; font-size:11px; border:1px solid var(--border); background: transparent; color: var(--fg); cursor:pointer; }
.action-btn.primary { background: var(--btn); color: var(--btn-fg); border-color: var(--btn); }
.progress-indicator { display:flex; align-items:center; }
.progress-circle { width:24px; height:24px; border-radius:50%; border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; position:relative; }
.progress-circle::before { content:''; position:absolute; top:-2px; left:-2px; right:-2px; bottom:-2px; border-radius:50%; border:2px solid transparent; border-top-color: var(--accent); animation:spin 2s linear infinite; }
.progress-text { font-size:8px; font-weight:bold; color: var(--accent); }
@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
.input-area { padding:12px; }
.input-field-container { position:relative; margin-bottom:12px; }
textarea { width:100%; min-height:80px; padding:12px 12px 40px 12px; border:1px solid var(--border); border-radius:8px; background: var(--bg); color:var(--fg); font-family: var(--vscode-font-family); font-size:14px; resize:vertical; outline:none; line-height:1.4; }
textarea:focus { border-color: var(--accent); }
.input-overlay { position:absolute; bottom:8px; left:12px; pointer-events:none; z-index:1; }
.context-hints { display:flex; gap:8px; align-items:center; }
.hint { background: var(--accent); color: var(--bg); padding:2px 6px; border-radius:3px; font-size:11px; font-weight:bold; }
.hint-text { color: var(--muted); font-size:11px; }
.input-footer { display:flex; justify-content:space-between; align-items:center; }
.footer-left { display:flex; align-items:center; gap:8px; }
.agent-btn { display:flex; align-items:center; gap:4px; padding:6px 10px; border-radius:6px; background: transparent; border:1px solid var(--border); color: var(--fg); cursor:pointer; font-size:12px; }
.agent-btn:hover { background: rgba(127,127,127,0.1); }
.agent-icon { font-size:14px; }
.agent-text { font-weight:500; }
.shortcut { color: var(--muted); font-size:10px; }
.mode-selector select { padding:4px 8px; border-radius:4px; border:1px solid var(--border); background: var(--bg); color: var(--fg); font-size:11px; }
.footer-right { display:flex; align-items:center; gap:6px; }
.attach-btn, .send-btn { width:32px; height:32px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.attach-btn { background: transparent; color: var(--muted); }
.attach-btn:hover { background: rgba(127,127,127,0.1); }
.send-btn { background: var(--btn); color: var(--btn-fg); }
.send-btn:hover { background: var(--accent); }
.attach-icon, .send-icon { font-size:16px; }
.small { font-size:12px; color: var(--muted); }
.status { display:flex; align-items:center; gap:6px; font-size:12px; }
.status.success { color: var(--success); }
.status.warning { color: var(--warning); }
.status.error { color: var(--error); }
.context-menu, .command-menu { position: absolute; z-index: 1000; }
.menu-item { padding: 6px 12px; cursor: pointer; border-radius: 4px; font-size: 12px; }
.menu-item:hover { background: rgba(127,127,127,0.1); }
</style>
</head>
<body>
  
  
  
  <div id="log" class="messages" role="log" aria-live="polite"></div>
  
  <div class="input-container">
    <div class="input-header">
      <div class="context-tabs">
        <div class="tab active" data-context="general">@</div>
        <div class="tab" data-context="files">1 Tab</div>
        <div class="tab" data-context="ticket">Ticket</div>
      </div>
      <div class="input-actions">
        <button class="action-btn" id="undoAll">Undo All</button>
        <button class="action-btn primary" id="keepAll">Keep All</button>
        <div class="progress-indicator">
          <div class="progress-circle">
            <span class="progress-text">75.9%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="input-area">
      <div class="input-field-container">
        <textarea id="input" placeholder="Write your message here..."></textarea>
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
            <span class="agent-text">Agent</span>
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

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const log = document.getElementById('log');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

// New UI elements
const contextTabs = document.querySelectorAll('.tab');
const undoAllBtn = document.getElementById('undoAll');
const keepAllBtn = document.getElementById('keepAll');
const agentModeBtn = document.getElementById('agentMode');
const modeSelect = document.getElementById('modeSelect');
const attachFileBtn = document.getElementById('attachFile');

let currentContext = 'general';

function add(type, text, data = null){
  const el = document.createElement('div');
  el.className = 'msg ' + type;
  
  if (type === 'context' && data && data.context) {
    el.innerHTML = \`<div>\${text}</div><div class="context-files">\${data.context.map(f => 
      \`<div class="context-file">\${f.type}: \${f.path} (relevance: \${f.relevance})\${f.ticketRelevant ? ' 🎫' : ''}</div>\`
    ).join('')}</div>\`;
  } else if (type === 'progress') {
    el.innerHTML = \`<div class="status \${data?.status || 'warning'}">\${text}</div>\`;
  } else {
    el.textContent = text;
  }
  
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function send(){
  const t = input.value.trim();
  if(!t) return;
  
  add('user', t);
  vscode.postMessage({command:'sendMessage', text:t});
  input.value = '';
}

function findContext(){
  const t = input.value.trim();
  if(!t) return;
  
  vscode.postMessage({command:'findContext', query:t});
}

function showContextMenu() {
  // Show context selection menu
  const contexts = ['files', 'tickets', 'code', 'docs'];
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.innerHTML = contexts.map(ctx => 
    \`<div class="menu-item" onclick="selectContext('\${ctx}')">@\${ctx}</div>\`
  ).join('');
  
  // Position and show menu
  menu.style.position = 'absolute';
  menu.style.top = '100%';
  menu.style.left = '0';
  menu.style.background = 'var(--bg)';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = '6px';
  menu.style.padding = '4px';
  menu.style.zIndex = '1000';
  
  input.parentElement.appendChild(menu);
  
  // Remove menu after selection
  setTimeout(() => {
    if (menu.parentElement) {
      menu.parentElement.removeChild(menu);
    }
  }, 5000);
}

function showCommandMenu() {
  // Show command selection menu
  const commands = ['/analyze', '/generate', '/test', '/refactor', '/explain'];
  const menu = document.createElement('div');
  menu.className = 'command-menu';
  menu.innerHTML = commands.map(cmd => 
    \`<div class="menu-item" onclick="selectCommand('\${cmd}')">\${cmd}</div>\`
  ).join('');
  
  // Position and show menu
  menu.style.position = 'absolute';
  menu.style.top = '100%';
  menu.style.left = '0';
  menu.style.background = 'var(--bg)';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = '6px';
  menu.style.padding = '4px';
  menu.style.zIndex = '1000';
  
  input.parentElement.appendChild(menu);
  
  // Remove menu after selection
  setTimeout(() => {
    if (menu.parentElement) {
      menu.parentElement.removeChild(menu);
    }
  }, 5000);
}

function selectContext(context) {
  input.value += \`@\${context} \`;
  input.focus();
}

function selectCommand(command) {
  input.value += \`\${command} \`;
  input.focus();
}

sendBtn.onclick = send;

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
        input.placeholder = 'Write your message here...';
    }
  });
});

// Action buttons
undoAllBtn.onclick = () => {
  vscode.postMessage({command: 'undoAll'});
};

keepAllBtn.onclick = () => {
  vscode.postMessage({command: 'keepAll'});
};

// Agent mode toggle
agentModeBtn.onclick = () => {
  agentModeBtn.classList.toggle('active');
  vscode.postMessage({command: 'toggleAgentMode'});
};

// Mode selector
modeSelect.addEventListener('change', (e) => {
  vscode.postMessage({command: 'changeMode', mode: e.target.value});
});

// Attach file
attachFileBtn.onclick = () => {
  vscode.postMessage({command: 'attachFile'});
};

input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); send(); }
});

// Remove references to non-existent DOM elements that were causing JavaScript errors
// These elements were removed when we cleaned up the UI but the JavaScript references remained
window.addEventListener('message', (e)=>{
  if(e.key === '@') {
    // Handle @ context selection
    e.preventDefault();
    showContextMenu();
  }
  if(e.key === '/') {
    // Handle / command selection
    e.preventDefault();
    showCommandMenu();
  }
});


// Connection buttons are now handled in the Connection section

window.addEventListener('message', (e) => {
  const m = e.data;
  
  switch(m.type) {
      
      
    case 'contextFinding':
      if (m.status === 'started') {
        add('progress', m.message, {status: 'warning'});
      } else if (m.status === 'progress') {
        add('context', m.message, {context: m.context});
      } else if (m.status === 'completed') {
        add('context', m.message, {context: m.context, status: 'success'});
      } else if (m.status === 'error') {
        add('progress', m.message, {status: 'error'});
      }
      break;
      
    case 'aiResponse':
      add('ai', m.content);
      if (m.context && m.context.length > 0) {
        add('context', \`Found \${m.context.length} relevant files:\`, {context: m.context});
      }
      break;
      
    case 'error':
      add('progress', m.content, {status: 'error'});
      break;
  }
});
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
