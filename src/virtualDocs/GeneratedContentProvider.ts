import * as vscode from 'vscode';

export class GeneratedContentProvider implements vscode.TextDocumentContentProvider {
  private static contents = new Map<string, string>();
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange?: vscode.Event<vscode.Uri> | undefined = this._onDidChange.event;

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
    return GeneratedContentProvider.contents.get(uri.toString()) ?? '// No generated content.';
  }

  static updateContent(uri: vscode.Uri, text: string) {
    this.contents.set(uri.toString(), text);
  }
}