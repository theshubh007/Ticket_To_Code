import * as vscode from 'vscode';

export class AIService {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async process(prompt: string): Promise<string> {
    const model = vscode.workspace.getConfiguration('ticket-to-code').get<string>('ai.model');
    const key = await this.context.secrets.get('ticket-to-code.aiKey');

    if (!key) {
      return '⚠️ AI key not set. Use "Ticket to Code: Start AI Session" or set AI_API_KEY in .env.';
    }

    const provider = process.env['AI_PROVIDER'] ?? 'OpenAI';
    // TODO: integrate real LLM SDK here
    return `[${provider}:${model}] → Ack: "${prompt}"\n\n(This is a stubbed response. Plug in your provider SDK.)`;
  }

  async generateTests(ticketId: string): Promise<string[]> {
    return [
      `should handle ${ticketId} happy path`,
      `should validate inputs for ${ticketId}`,
      `should persist changes for ${ticketId}`
    ];
  }
}