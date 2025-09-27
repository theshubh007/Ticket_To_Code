import * as vscode from 'vscode';

export class TicketCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void> | undefined;

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const lenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const header = text.split('\n').slice(0, 10).join('\n');
    const match = header.match(/[A-Z]+-\d+/);
    const ticket = match?.[0];

    for (let i = 0; i < Math.min(2000, text.length); i++) {
      const idx = text.indexOf('function ', i);
      if (idx === -1) break;

      const line = document.positionAt(idx).line;
      const range = new vscode.Range(line, 0, line, 0);

      lenses.push(new vscode.CodeLens(range, {
        title: ticket ? `📎 ${ticket}: View Ticket` : '📎 Link Ticket…',
        command: ticket ? 'ticket-to-code.showTicket' : 'ticket-to-code.connectJira',
        arguments: ticket ? [ticket] : []
      }));

      i = idx + 8;
    }

    return lenses;
  }
}