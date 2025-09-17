"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketToCodeItem = exports.TicketToCodeTreeDataProvider = void 0;
const vscode = require("vscode");
class TicketToCodeTreeDataProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve([
                new TicketToCodeItem('💬 Open Chat', 'Open the chat interface', vscode.TreeItemCollapsibleState.None, {
                    command: 'ticketToCode.openPanel',
                    title: 'Open Chat'
                }),
                new TicketToCodeItem('📎 Attach Files', 'Attach files to your conversation', vscode.TreeItemCollapsibleState.None, {
                    command: 'ticketToCode.attachFiles',
                    title: 'Attach Files'
                }),
                new TicketToCodeItem('⚙️ Settings', 'Configure Ticket to Code', vscode.TreeItemCollapsibleState.None, {
                    command: 'ticketToCode.settings',
                    title: 'Settings'
                })
            ]);
        }
        return Promise.resolve([]);
    }
    createWebviewPanel() {
        if (this._webviewPanel) {
            this._webviewPanel.reveal();
            return this._webviewPanel;
        }
        this._webviewPanel = vscode.window.createWebviewPanel('ticketToCodeChat', 'Ticket to Code Chat', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out')
            ]
        });
        this._webviewPanel.webview.html = this.getWebviewContent();
        // Handle messages from the webview
        this._webviewPanel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'sendMessage':
                    this.handleSendMessage(message.text, message.attachments);
                    return;
                case 'attachFile':
                    this.handleFileAttachment();
                    return;
            }
        }, null, []);
        // Clean up when panel is disposed
        this._webviewPanel.onDidDispose(() => {
            this._webviewPanel = undefined;
        });
        return this._webviewPanel;
    }
    async handleSendMessage(text, attachments) {
        if (!this._webviewPanel)
            return;
        // Here you would integrate with your AI service
        // For now, we'll just echo back the message
        await this._webviewPanel.webview.postMessage({
            command: 'receiveMessage',
            text: `You said: ${text}`,
            attachments: attachments,
            isUser: false
        });
    }
    async handleFileAttachment() {
        if (!this._webviewPanel)
            return;
        const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: 'Attach Files',
            filters: {
                'All files': ['*']
            }
        });
        if (files && files.length > 0) {
            const filePaths = files.map(file => file.fsPath);
            await this._webviewPanel.webview.postMessage({
                command: 'filesAttached',
                files: filePaths
            });
        }
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket to Code Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 15px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h2 {
            margin: 0;
            color: var(--vscode-textLink-foreground);
            font-size: 18px;
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
            padding: 8px 0;
            margin-bottom: 15px;
            max-height: 400px;
        }

        .message {
            margin-bottom: 12px;
            padding: 10px;
            border-radius: 6px;
            max-width: 90%;
            font-size: 13px;
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
            margin-bottom: 6px;
            line-height: 1.4;
        }

        .attachments {
            margin-top: 6px;
        }

        .attachment {
            display: inline-block;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 11px;
            margin-right: 6px;
            margin-bottom: 3px;
        }

        .input-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-row {
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .text-input {
            flex: 1;
            min-height: 50px;
            max-height: 120px;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            font-size: 13px;
            resize: vertical;
            outline: none;
        }

        .text-input:focus {
            border-color: var(--vscode-focusBorder);
        }

        .button {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
            white-space: nowrap;
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
            gap: 6px;
            margin-bottom: 8px;
        }

        .attached-file {
            display: flex;
            align-items: center;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
        }

        .remove-file {
            margin-left: 6px;
            cursor: pointer;
            font-weight: bold;
        }

        .remove-file:hover {
            color: var(--vscode-errorForeground);
        }

        .loading {
            display: none;
            text-align: center;
            padding: 15px;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }

        .spinner {
            border: 2px solid var(--vscode-progressBar-background);
            border-top: 2px solid var(--vscode-progressBar-foreground);
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>💬 Chat</h2>
    </div>

    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="message assistant">
                <div class="message-content">
                    Welcome! I'm here to help with your coding tasks. Type your request below.
                </div>
            </div>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <div>Processing...</div>
        </div>

        <div class="input-container">
            <div class="attached-files" id="attachedFiles"></div>
            
            <div class="input-row">
                <textarea 
                    class="text-input" 
                    id="textInput" 
                    placeholder="Ask a question or describe your task..."
                    rows="2"
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
exports.TicketToCodeTreeDataProvider = TicketToCodeTreeDataProvider;
class TicketToCodeItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = tooltip;
    }
}
exports.TicketToCodeItem = TicketToCodeItem;
//# sourceMappingURL=treeDataProvider.js.map