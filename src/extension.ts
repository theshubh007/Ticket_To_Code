import * as vscode from 'vscode';
import { TicketTreeDataProvider } from './providers/TreeDataProvider';
import { ChatProvider } from './providers/ChatProvider';
import { JiraProvider } from './providers/JiraProvider';
import { TicketCodeLensProvider } from './providers/CodeLensProvider';
import { registerCommands } from './commands';
import { GeneratedContentProvider } from './virtualDocs/GeneratedContentProvider';
import { CodeIndexer } from './services/CodeIndexer';
import { loadEnv, migrateEnvToSecrets, seedConfigFromEnv } from './utils/env';

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Load environment variables
    loadEnv(context);
    
    // Migrate secrets (this should always work)
    await migrateEnvToSecrets(context);
    
    // Seed configuration (with error handling)
    await seedConfigFromEnv();

    const jira = new JiraProvider(context);
    let isConn = false;
    
    try {
      isConn = await jira.isConnected();
      await vscode.commands.executeCommand('setContext', 'ticketToCode.connected', isConn);
    } catch (error) {
      console.warn('Failed to check JIRA connection status:', error);
    }

    const ticketsTree = new TicketTreeDataProvider(jira);
    const chatProvider = new ChatProvider(context, jira);
    const generatedDocProvider = new GeneratedContentProvider();
    const codeIndexer = new CodeIndexer(context);

    context.subscriptions.push(
      vscode.window.registerTreeDataProvider('ticketList', ticketsTree),
      vscode.window.registerWebviewViewProvider('aiChat', chatProvider, { webviewOptions: { retainContextWhenHidden: true } }),
      vscode.workspace.registerTextDocumentContentProvider('generated', generatedDocProvider),
      vscode.languages.registerCodeLensProvider({ scheme: 'file' }, new TicketCodeLensProvider())
    );

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = isConn ? '$(plug) Ticket to Code: Connected' : '$(plug) Ticket to Code: Disconnected';
    statusBarItem.command = 'ticket-to-code.connectJira';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    registerCommands(context, { jira, ticketsTree, chatProvider, generatedDocProvider, codeIndexer, statusBarItem });

    // Auto-index workspace if enabled and workspace is available
    const cfg = vscode.workspace.getConfiguration('ticket-to-code');
    if (cfg.get('autoIndex', true) && vscode.workspace.workspaceFolders) {
      codeIndexer.indexWorkspace().catch(err => console.error('Index error', err));
    }
    
    console.log('Ticket to Code extension activated successfully');
  } catch (error) {
    console.error('Failed to activate Ticket to Code extension:', error);
    vscode.window.showErrorMessage('Failed to activate Ticket to Code extension. Please check the output panel for details.');
  }
}

export function deactivate() {}