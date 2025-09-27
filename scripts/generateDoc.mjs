import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const outDir = path.join(root, 'docs');
const outFile = path.join(outDir, 'IDE-Design.md');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const doc = `# ${pkg.displayName || pkg.name} — IDE Design & Feature Guide

## 1. Overview

${pkg.displayName || pkg.name} streamlines ticket-to-code inside VS Code with a JIRA sidebar, AI chat webview, CodeLens, and safe diffs.

## 2. Architecture

- **Activity Bar:** Ticket to Code
- **Views:** JIRA Tickets (TreeView), AI Assistant (Webview)
- **Providers:** JiraProvider, TicketCodeLensProvider, GeneratedContentProvider
- **Services:** AIService, CodeIndexer, GitService
- **Utils:** .env loader (dotenv) → SecretStorage migration → config seeding

## 3. Secrets & Config

- **.env** → dotenv → **SecretStorage**
- AI: AI_PROVIDER, AI_MODEL, AI_API_KEY
- JIRA: JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN
- Toggles: AUTO_INDEX, AUTO_GENERATE_TESTS, GIT_AUTO_CREATE_BRANCH, GIT_BRANCH_PATTERN

## 4. Key Flows

1) Connect to JIRA → Tickets load → optional Git branch auto-create  
2) Chat prompts → AI responds → Apply code via virtual diff/new file  
3) CodeLens → Quick ticket linking above functions

## 5. UI (Webview)

Polished chat panel with theming, keyboard shortcuts, and action buttons.

## 6. Commands

- ticket-to-code.connectJira
- ticket-to-code.startSession
- ticket-to-code.showTickets
- ticket-to-code.showTicket

## 7. Settings

See package.json → contributes.configuration

## 8. Build & Run

\`\`\`
npm install
npm run watch  # or: npm run build
# Press F5 in VS Code
\`\`\`

## 9. Regenerate this doc

\`\`\`
npm run gen:doc
\`\`\`
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, doc, 'utf8');
console.log('Wrote', path.relative(root, outFile));