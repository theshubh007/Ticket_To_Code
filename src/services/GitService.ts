import * as vscode from 'vscode';

type GitAPI = any;

export class GitService {
  private gitApi: GitAPI | undefined;

  async init(): Promise<void> {
    const ext = vscode.extensions.getExtension('vscode.git');
    if (!ext) return;
    if (!ext.isActive) await ext.activate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.gitApi = (ext.exports as any).getAPI(1);
  }

  async createBranch(name: string): Promise<void> {
    if (!this.gitApi) await this.init();
    const repo = this.gitApi?.repositories?.[0];
    if (!repo) return;
    await repo.createBranch(name, true);
    await repo.checkout(name);
  }
}