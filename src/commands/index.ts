import * as vscode from 'vscode';
import { JiraProvider } from '../providers/JiraProvider';
import { TicketTreeDataProvider } from '../providers/TreeDataProvider';
import { ChatProvider } from '../providers/ChatProvider';
import { GeneratedContentProvider } from '../virtualDocs/GeneratedContentProvider';
import { CodeIndexer } from '../services/CodeIndexer';


interface Ctx {
  jira: JiraProvider;
  ticketsTree: TicketTreeDataProvider;
  chatProvider: ChatProvider;
  generatedDocProvider: GeneratedContentProvider;
  codeIndexer: CodeIndexer;
  statusBarItem: vscode.StatusBarItem;
}

export function registerCommands(context: vscode.ExtensionContext, deps: Ctx) {

  context.subscriptions.push(
    vscode.commands.registerCommand('ticket-to-code.connectJira', async () => {
      const ok = await deps.jira.connect();
      deps.statusBarItem.text = ok ? '$(plug) Ticket to Code: Connected' : '$(plug) Ticket to Code: Disconnected';
      await vscode.commands.executeCommand('setContext', 'ticketToCode.connected', ok);
      deps.ticketsTree.refresh();
    }),

    vscode.commands.registerCommand('ticket-to-code.startSession', async () => {
      const key = await vscode.window.showInputBox({ 
        prompt: 'Enter AI API Key', 
        password: true, 
        value: process.env['AI_API_KEY'] || '' 
      });
      if (key) await context.secrets.store('ticket-to-code.aiKey', key);
      vscode.window.showInformationMessage('AI session configured.');
    }),

    vscode.commands.registerCommand('ticket-to-code.showTickets', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.ticket-to-code');
    }),

    vscode.commands.registerCommand('ticket-to-code.showTicket', async (ticketId?: string) => {
      const id = ticketId || await vscode.window.showInputBox({ prompt: 'Enter Ticket ID (e.g., PROJ-1234)' });
      if (!id) return;

      const doc = await vscode.workspace.openTextDocument({ 
        content: `# ${id}\n\nTicket details would appear here…`, 
        language: 'markdown' 
      });
      await vscode.window.showTextDocument(doc, { preview: true });

      const cfg = vscode.workspace.getConfiguration('ticket-to-code');
      if (cfg.get('gitIntegration.autoCreateBranch')) {
        const pattern = cfg.get<string>('gitIntegration.branchNamingPattern') ?? 'feature/{ticket-id}';
        const name = pattern.replace('{ticket-id}', id).replace('{description}', 'work');
        try { 
          await vscode.commands.executeCommand('git.branch', { name }); 
        } catch { /* noop if Git not available */ }
      }
    })
  );
}