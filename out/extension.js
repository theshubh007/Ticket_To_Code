"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const treeDataProvider_1 = require("./treeDataProvider");
function activate(context) {
    console.log("Ticket to Code extension is now active!");
    // Create the tree data provider
    const treeDataProvider = new treeDataProvider_1.TicketToCodeTreeDataProvider(context);
    // Register the tree data provider
    vscode.window.createTreeView('ticketToCodeView', {
        treeDataProvider: treeDataProvider
    });
    // Register commands
    const openPanelCommand = vscode.commands.registerCommand("ticketToCode.openPanel", () => {
        treeDataProvider.createWebviewPanel();
    });
    const attachFilesCommand = vscode.commands.registerCommand("ticketToCode.attachFiles", () => {
        vscode.window.showInformationMessage("File attachment will be available in the chat panel");
    });
    const settingsCommand = vscode.commands.registerCommand("ticketToCode.settings", () => {
        vscode.window.showInformationMessage("Settings panel coming soon!");
    });
    context.subscriptions.push(openPanelCommand, attachFilesCommand, settingsCommand);
}
exports.activate = activate;
function deactivate() {
    console.log("Ticket to Code extension is now deactivated!");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map