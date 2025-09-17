"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketToCodePanel = void 0;
const vscode = require("vscode");
class TicketToCodePanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (TicketToCodePanel.currentPanel) {
            TicketToCodePanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(TicketToCodePanel.viewType, "Ticket to Code", column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "media"),
                vscode.Uri.joinPath(extensionUri, "out"),
            ],
        });
        TicketToCodePanel.currentPanel = new TicketToCodePanel(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        TicketToCodePanel.currentPanel = new TicketToCodePanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "sendMessage":
                    this._handleSendMessage(message.text, message.attachments);
                    return;
                case "attachFile":
                    this._handleFileAttachment();
                    return;
            }
        }, null, this._disposables);
    }
    async _handleSendMessage(text, attachments) {
        // Here you would integrate with your AI service
        // For now, we'll just echo back the message
        await this._panel.webview.postMessage({
            command: "receiveMessage",
            text: `You said: ${text}`,
            attachments: attachments,
            isUser: false,
        });
    }
    async _handleFileAttachment() {
        const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: "Attach Files",
            filters: {
                "All files": ["*"],
            },
        });
        if (files && files.length > 0) {
            const filePaths = files.map((file) => file.fsPath);
            await this._panel.webview.postMessage({
                command: "filesAttached",
                files: filePaths,
            });
        }
    }
    dispose() {
        TicketToCodePanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket to Code</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            margin: 0;
            color: var(--vscode-textLink-foreground);
            font-size: 24px;
        }

        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px 0;
            margin-bottom: 20px;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            max-width: 80%;
        }

        .message.user {
            background-color: var(--vscode-input-background);
            margin-left: auto;
            border: 1px solid var(--vscode-input-border);
        }

        .message.assistant {
            background-color: var(--vscode-textBlockQuote-background);
            border: 1px solid var(--vscode-textBlockQuote-border);
        }

        .message-content {
            margin-bottom: 8px;
        }

        .attachments {
            margin-top: 8px;
        }

        .attachment {
            display: inline-block;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 4px;
        }

        .input-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .input-row {
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }

        .text-input {
            flex: 1;
            min-height: 60px;
            max-height: 200px;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            resize: vertical;
            outline: none;
        }

        .text-input:focus {
            border-color: var(--vscode-focusBorder);
        }

        .button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .button-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .button-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .button-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .attached-files {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
        }

        .attached-file {
            display: flex;
            align-items: center;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
        }

        .remove-file {
            margin-left: 8px;
            cursor: pointer;
            font-weight: bold;
        }

        .remove-file:hover {
            color: var(--vscode-errorForeground);
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        .spinner {
            border: 2px solid var(--vscode-progressBar-background);
            border-top: 2px solid var(--vscode-progressBar-foreground);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎫 Ticket to Code</h1>
    </div>

    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="message assistant">
                <div class="message-content">
                    Welcome to Ticket to Code! I'm here to help you with your coding tasks. 
                    You can type your request and attach files if needed.
                </div>
            </div>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <div>Processing your request...</div>
        </div>

        <div class="input-container">
            <div class="attached-files" id="attachedFiles"></div>
            
            <div class="input-row">
                <textarea 
                    class="text-input" 
                    id="textInput" 
                    placeholder="Describe your coding task or ask a question..."
                    rows="3"
                ></textarea>
                <button class="button button-secondary" id="attachButton" title="Attach Files">
                    📎
                </button>
                <button class="button button-primary" id="sendButton">
                    Send
                </button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const textInput = document.getElementById('textInput');
        const sendButton = document.getElementById('sendButton');
        const attachButton = document.getElementById('attachButton');
        const attachedFilesContainer = document.getElementById('attachedFiles');
        const loadingContainer = document.getElementById('loading');

        let attachedFiles = [];

        function addMessage(content, isUser = false, attachments = []) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = content;
            messageDiv.appendChild(contentDiv);

            if (attachments.length > 0) {
                const attachmentsDiv = document.createElement('div');
                attachmentsDiv.className = 'attachments';
                attachments.forEach(file => {
                    const attachmentSpan = document.createElement('span');
                    attachmentSpan.className = 'attachment';
                    attachmentSpan.textContent = file.split('/').pop();
                    attachmentsDiv.appendChild(attachmentSpan);
                });
                messageDiv.appendChild(attachmentsDiv);
            }

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function updateAttachedFiles() {
            attachedFilesContainer.innerHTML = '';
            attachedFiles.forEach((file, index) => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'attached-file';
                fileDiv.innerHTML = \`
                    \${file.split('/').pop()}
                    <span class="remove-file" onclick="removeFile(\${index})">×</span>
                \`;
                attachedFilesContainer.appendChild(fileDiv);
            });
        }

        function removeFile(index) {
            attachedFiles.splice(index, 1);
            updateAttachedFiles();
        }

        function showLoading() {
            loadingContainer.style.display = 'block';
        }

        function hideLoading() {
            loadingContainer.style.display = 'none';
        }

        function sendMessage() {
            const text = textInput.value.trim();
            if (!text && attachedFiles.length === 0) {
                return;
            }

            // Add user message
            addMessage(text, true, attachedFiles);

            // Show loading
            showLoading();

            // Send to extension
            vscode.postMessage({
                command: 'sendMessage',
                text: text,
                attachments: attachedFiles
            });

            // Clear input
            textInput.value = '';
            attachedFiles = [];
            updateAttachedFiles();
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        attachButton.addEventListener('click', () => {
            vscode.postMessage({ command: 'attachFile' });
        });

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'receiveMessage':
                    hideLoading();
                    addMessage(message.text, false, message.attachments);
                    break;
                case 'filesAttached':
                    attachedFiles = attachedFiles.concat(message.files);
                    updateAttachedFiles();
                    break;
            }
        });

        // Focus text input on load
        textInput.focus();
    </script>
</body>
</html>`;
    }
}
exports.TicketToCodePanel = TicketToCodePanel;
TicketToCodePanel.viewType = "ticketToCodePanel";
//# sourceMappingURL=panel.js.map