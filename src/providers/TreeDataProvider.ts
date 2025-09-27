import * as vscode from 'vscode';
import { JiraProvider, Ticket } from './JiraProvider';

export class TicketItem extends vscode.TreeItem {
  constructor(public readonly ticket: Ticket) {
    super(`${ticket.key} — ${ticket.summary}`, vscode.TreeItemCollapsibleState.None);
    this.description = ticket.status;
    this.contextValue = 'ticket';
    this.command = { command: 'ticket-to-code.showTicket', title: 'Open Ticket', arguments: [ticket.key] };
    this.iconPath = new vscode.ThemeIcon('issues');
  }
}

export class TicketTreeDataProvider implements vscode.TreeDataProvider<TicketItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly jira: JiraProvider) {}

  refresh(): void { this._onDidChangeTreeData.fire(); }

  getTreeItem(element: TicketItem): vscode.TreeItem { return element; }

  async getChildren(): Promise<TicketItem[]> {
    if (!(await this.jira.isConnected())) {
      const item = new vscode.TreeItem('Welcome to Ticket to Code — Sign in to JIRA…', vscode.TreeItemCollapsibleState.None);
      item.command = { command: 'ticket-to-code.connectJira', title: 'Connect' };
      item.iconPath = new vscode.ThemeIcon('plug');
      // Use a cast to satisfy the return type
      return [item as unknown as TicketItem];
    }

    const tickets = await this.jira.listTickets();
    return tickets.map(t => new TicketItem(t));
  }
}