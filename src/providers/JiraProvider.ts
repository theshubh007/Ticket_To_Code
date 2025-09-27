import * as vscode from 'vscode';

export interface Ticket {
  key: string;
  summary: string;
  status: string;
  assignee?: string;
}

export class JiraProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async isConnected(): Promise<boolean> {
    const url = vscode.workspace.getConfiguration('ticket-to-code').get<string>('jira.url');
    const email = await this.context.secrets.get('ticket-to-code.jiraEmail');
    const token = await this.context.secrets.get('ticket-to-code.jiraToken');
    return !!(url && email && token);
  }

  async connect(): Promise<boolean> {
    const cfg = vscode.workspace.getConfiguration('ticket-to-code');
    let url = cfg.get<string>('jira.url') || process.env['JIRA_URL'] || '';

    if (!url) {
      url = await vscode.window.showInputBox({ 
        prompt: 'Enter JIRA base URL', 
        placeHolder: 'https://company.atlassian.net' 
      }) || '';
      
      // Use Global config if no workspace is open
      const configTarget = vscode.workspace.workspaceFolders 
        ? vscode.ConfigurationTarget.Workspace 
        : vscode.ConfigurationTarget.Global;
      
      try {
        await cfg.update('jira.url', url, configTarget);
      } catch (error) {
        console.warn('Failed to save JIRA URL to configuration:', error);
      }
    }

    const email = (await this.context.secrets.get('ticket-to-code.jiraEmail')) ||
      (await vscode.window.showInputBox({ 
        prompt: 'Enter JIRA email', 
        value: process.env['JIRA_EMAIL'] || '' 
      }));

    const token = (await this.context.secrets.get('ticket-to-code.jiraToken')) ||
      (await vscode.window.showInputBox({ 
        prompt: 'Enter JIRA API Token', 
        password: true, 
        value: process.env['JIRA_API_TOKEN'] || '' 
      }));

    if (!email || !token || !url) return false;

    await this.context.secrets.store('ticket-to-code.jiraEmail', email);
    await this.context.secrets.store('ticket-to-code.jiraToken', token);

    // Set context so the Welcome view hides after sign-in
    await vscode.commands.executeCommand('setContext', 'ticketToCode.connected', true);
    return true;
  }

  async listTickets(): Promise<Ticket[]> {
    // Stubbed; replace with real JIRA REST calls
    return [
      { key: 'PROJ-1234', summary: 'Auth Implementation', status: 'In Progress', assignee: 'You' },
      { key: 'PROJ-1288', summary: 'Fix webhook retries', status: 'To Do' },
      { key: 'PROJ-1301', summary: 'Improve error telemetry', status: 'Review' }
    ];
  }

  async getTicket(key: string): Promise<Ticket | undefined> {
    const all = await this.listTickets();
    return all.find(t => t.key === key);
  }

  async disconnect(): Promise<void> {
    // Clear stored credentials
    await this.context.secrets.delete('ticket-to-code.jiraEmail');
    await this.context.secrets.delete('ticket-to-code.jiraToken');
    
    // Set context to disconnected
    await vscode.commands.executeCommand('setContext', 'ticketToCode.connected', false);
  }
}