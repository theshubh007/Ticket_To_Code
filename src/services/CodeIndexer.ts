import * as vscode from 'vscode';

export class CodeIndexer {
  private index = new Map<string, { mtime: number; tokens: string[] }>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  async indexWorkspace(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    for (const folder of folders) {
      const uris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/*.{ts,tsx,js,jsx,py,java,go}'),
        '**/{node_modules,.git,dist,build}/**'
      );
      await Promise.all(uris.map(u => this.indexFile(u)));
    }
  }

  async indexFile(uri: vscode.Uri): Promise<void> {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const key = uri.toString();
      const prev = this.index.get(key);
      if (prev && prev.mtime === stat.mtime) return;

      const content = (await vscode.workspace.fs.readFile(uri)).toString();
      const tokens = this.tokenize(content);
      this.index.set(key, { mtime: stat.mtime, tokens });
    } catch { /* ignore */ }
  }

  search(term: string): vscode.Uri[] {
    const results: vscode.Uri[] = [];
    for (const [k, v] of this.index) {
      if (v.tokens.some(t => t.includes(term.toLowerCase()))) {
        results.push(vscode.Uri.parse(k));
      }
    }
    return results;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean).slice(0, 5000);
  }
}