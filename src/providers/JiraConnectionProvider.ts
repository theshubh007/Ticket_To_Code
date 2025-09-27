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
<title>JIRA Connection</title>
<style>
:root {
  --bg: var(--vscode-editor-background);
  --fg: var(--vscode-editor-foreground);
  --muted: var(--vscode-descriptionForeground);
  --border: var(--vscode-editorWidget-border);
  --btn: var(--vscode-button-background);
  --btn-fg: var(--vscode-button-foreground);
}
* { box-sizing: border-box; }
body { margin:0; font-family: var(--vscode-font-family); color: var(--fg); background: var(--bg); padding:12px; }
.connection-section { text-align: center; }
.connection-section h3 { margin:0 0 12px 0; font-size:14px; }
.connection-section p { margin:0 0 16px 0; font-size:12px; color: var(--muted); }
.actions { display:flex; gap:8px; justify-content:center; }
.actions button { background: var(--btn); color: var(--btn-fg); border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px; }
.actions button.secondary { background: transparent; border:1px solid var(--border); color: var(--fg); }
.actions button:hover { opacity:0.9; }
.connected { color: var(--vscode-testing-iconPassed); }
</style>
</head>
<body>
  ${
    !isConnected
      ? `
  <div class="connection-section">
    <h3>🎫 Ticket to Code</h3>
    <p><strong>Streamline your workflow from JIRA tickets to code implementation.</strong></p>
    <p>Select a JIRA ticket, ask questions, and get AI-powered code context and solutions.</p>
    <div class="actions">
      <button id="connect"> Sign in to JIRA</button>
      <button id="loadTickets" class="secondary"> Load Tickets</button>
    </div>
  </div>
  `
      : `
  <div class="connection-section">
    <h3>🎫 Ticket to Code</h3>
    <p><strong>Streamline your workflow from JIRA tickets to code implementation.</strong></p>
    <p>Select a JIRA ticket, ask questions, and get AI-powered code context and solutions.</p>
    <p class="connected">✅ Connected to JIRA - Ready to work with tickets and AI assistance.</p>
  </div>
  `
  }

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();

const connectBtn = document.getElementById('connect');
const loadTicketsBtn = document.getElementById('loadTickets');

if (connectBtn) {
  connectBtn.onclick = () => {
    vscode.postMessage({command: 'connectJira'});
  };
}

if (loadTicketsBtn) {
  loadTicketsBtn.onclick = () => {
    vscode.postMessage({command: 'loadTickets'});
  };
}
</script>
</body>
</html>`
  }
}
