import * as vscode from 'vscode';
import { AIService } from '../services/AIService';
import { JiraProvider } from './JiraProvider';
import { GeneratedContentProvider } from '../virtualDocs/GeneratedContentProvider';

export class ChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiChat';
  private _view?: vscode.WebviewView;
  private readonly ai: AIService;

  constructor(private readonly context: vscode.ExtensionContext, private readonly jira: JiraProvider) {
    this.ai = new AIService(context);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this._view = webviewView;
    const webview = webviewView.webview;

    webview.options = { enableScripts: true, localResourceRoots: [this.context.extensionUri] };
    webview.html = this.getHtml(webview);

    webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case 'sendMessage': {
          const response = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Window, title: 'AI is thinking…' },
            () => this.ai.process(msg.text)
          );
          webview.postMessage({ type: 'aiResponse', content: response });
          break;
        }
        case 'applyCode': {
          await this.applyGeneratedCode(msg.code);
          break;
        }
        case 'setAiKey': {
          await this.context.secrets.store('ticket-to-code.aiKey', msg.key);
          vscode.window.showInformationMessage('AI key saved.');
          break;
        }
        case 'connectJira': {
          await vscode.commands.executeCommand('ticket-to-code.connectJira');
          break;
        }
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = String(Date.now());
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
}
* { box-sizing: border-box; }
body { margin:0; font-family: var(--vscode-font-family); color: var(--fg); background: var(--bg); display:flex; flex-direction:column; height:100%; }
.banner { padding:12px; border-bottom:1px solid var(--border); background: rgba(127,127,127,0.06); }
.banner h2 { margin:0 0 6px 0; font-size:16px; }
.banner p { margin:0 0 8px 0; font-size:12px; color: var(--muted); }
.banner .actions { display:flex; gap:8px; }
.header { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid var(--border); }
.header .dot { width:10px; height:10px; border-radius:50%; background: var(--accent); }
.header h3 { margin:0; font-size:14px; }
.header .right { margin-left:auto; font-size:12px; color: var(--muted); }
.messages { flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
.msg { max-width:80%; padding:8px 10px; border:1px solid var(--border); border-radius:8px; white-space:pre-wrap; }
.msg.user { align-self:flex-end; background: transparent; }
.msg.ai { align-self:flex-start; background: rgba(127,127,127,0.08); }
.toolbar { display:flex; gap:8px; padding:8px 12px; border-top:1px solid var(--border); align-items:center; }
textarea { flex:1; resize:none; height:70px; padding:8px; border:1px solid var(--border); border-radius:8px; background:transparent; color:var(--fg); }
button { background: var(--btn); color: var(--btn-fg); border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
button:disabled { opacity:0.7; cursor:default; }
.small { font-size:12px; color: var(--muted); }
</style>
</head>
<body>
  <div class="banner">
    <h2>🎫 Ticket to Code - AI Assistant</h2>
    <p><strong>Streamline your workflow from JIRA tickets to code implementation.</strong></p>
    <p>Sign in to JIRA to load your tickets, then chat with the AI assistant for code guidance and safely apply suggested changes with side-by-side diffs.</p>
    <div class="actions">
      <button id="connect">🔗 Sign in to JIRA</button>
    </div>
  </div>
  <div class="header">
    <div class="dot"></div>
    <h3>AI Assistant</h3>
    <div class="right small">Press Ctrl+Enter to send</div>
  </div>
  <div id="log" class="messages" role="log" aria-live="polite"></div>
  <div class="toolbar">
    <textarea id="input" placeholder="Describe the change you need… (Ctrl+Enter to send)"></textarea>
    <button id="send">Send</button>
    <button id="apply">Apply Sample Code</button>
    <button id="setKey">Set AI Key</button>
  </div>

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const log = document.getElementById('log');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
function add(type, text){
  const el = document.createElement('div');
  el.className = 'msg ' + type;
  el.textContent = text;
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
sendBtn.onclick = send;
input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); send(); }
});
document.getElementById('apply').onclick=()=>{
  const code={ path:'src/newFeature.ts', content:'export const x=42;\\n' };
  vscode.postMessage({command:'applyCode', code});
};
document.getElementById('setKey').onclick=()=>{
  const key = prompt('Enter AI API key');
  if(key) vscode.postMessage({command:'setAiKey', key});
};
document.getElementById('connect').onclick=()=>{
  vscode.postMessage({command:'connectJira'});
};
window.addEventListener('message', (e)=>{
  const m = e.data;
  if(m.type==='aiResponse'){ add('ai', m.content); }
});
</script>
</body>
</html>`;
  }

  private async applyGeneratedCode(code: { path: string; content: string }) {
    const uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0].uri ?? this.context.extensionUri, code.path);
    const edit = new vscode.WorkspaceEdit();
    let exists = true;

    try { 
      await vscode.workspace.fs.stat(uri); 
    } catch { 
      exists = false; 
    }

    if (exists) {
      const generated = vscode.Uri.parse(`generated:${code.path}`);
      GeneratedContentProvider.updateContent(generated, code.content);
      await vscode.commands.executeCommand('vscode.diff', uri, generated, `Review Changes: ${code.path}`);
    } else {
      edit.createFile(uri, { contents: Buffer.from(code.content), overwrite: false });
      await vscode.workspace.applyEdit(edit);
      await vscode.window.showTextDocument(uri);
      await vscode.commands.executeCommand('editor.action.formatDocument');
    }
  }
}