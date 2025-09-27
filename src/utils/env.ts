import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export function loadEnv(context: vscode.ExtensionContext) {
  const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const candidates = [
    ws ? path.join(ws, '.env') : '',
    path.join(context.extensionPath, '.env')
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    try { 
      if (p && fs.existsSync(p)) { 
        dotenv.config({ path: p }); 
        break; 
      } 
    } catch { /* ignore */ }
  }
}

export async function migrateEnvToSecrets(context: vscode.ExtensionContext) {
  const mapping: Array<[string, string]> = [
    ['AI_API_KEY', 'ticket-to-code.aiKey'],
    ['JIRA_EMAIL', 'ticket-to-code.jiraEmail'],
    ['JIRA_API_TOKEN', 'ticket-to-code.jiraToken']
  ];

  for (const [envVar, secretKey] of mapping) {
    const val = process.env[envVar];
    if (val && !(await context.secrets.get(secretKey))) {
      await context.secrets.store(secretKey, val);
    }
  }
}

export async function seedConfigFromEnv() {
  const cfg = vscode.workspace.getConfiguration('ticket-to-code');
  
  // Determine the appropriate configuration target
  // Use Global if no workspace is open, otherwise use Workspace
  const configTarget = vscode.workspace.workspaceFolders 
    ? vscode.ConfigurationTarget.Workspace 
    : vscode.ConfigurationTarget.Global;

  try {
    if (!cfg.get<string>('jira.url') && process.env['JIRA_URL']) {
      await cfg.update('jira.url', process.env['JIRA_URL'], configTarget);
    }

    if (!cfg.get<string>('ai.model') && process.env['AI_MODEL']) {
      await cfg.update('ai.model', process.env['AI_MODEL'], configTarget);
    }

    if (cfg.get<boolean>('autoIndex') === undefined && process.env['AUTO_INDEX']) {
      await cfg.update('autoIndex', process.env['AUTO_INDEX'] === 'true', configTarget);
    }

    if (cfg.get<boolean>('autoGenerateTests') === undefined && process.env['AUTO_GENERATE_TESTS']) {
      await cfg.update('autoGenerateTests', process.env['AUTO_GENERATE_TESTS'] === 'true', configTarget);
    }

    if (cfg.get<boolean>('gitIntegration.autoCreateBranch') === undefined && process.env['GIT_AUTO_CREATE_BRANCH']) {
      await cfg.update('gitIntegration.autoCreateBranch', process.env['GIT_AUTO_CREATE_BRANCH'] === 'true', configTarget);
    }

    if (!cfg.get<string>('gitIntegration.branchNamingPattern') && process.env['GIT_BRANCH_PATTERN']) {
      await cfg.update('gitIntegration.branchNamingPattern', process.env['GIT_BRANCH_PATTERN'], configTarget);
    }
  } catch (error) {
    // If configuration update fails, log the error but don't prevent extension activation
    console.warn('Failed to seed configuration from environment variables:', error);
  }
}