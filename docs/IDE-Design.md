# 🎫 Ticket to Code — IDE Design & Feature Guide

## 1. Overview

**Ticket to Code** streamlines your workflow from JIRA tickets to code implementation with AI assistance. It integrates a JIRA tickets sidebar, an AI assistant webview, inline CodeLens actions, and safe diffs via virtual documents - all without leaving VS Code.

## 2. Architecture

- **Activity Bar:** Ticket to Code
- **Views:** JIRA Tickets (TreeView), AI Assistant (Webview)
- **Providers:** JiraProvider, TicketCodeLensProvider, GeneratedContentProvider
- **Services:** AIService, CodeIndexer, GitService
- **Utils:** .env loader (dotenv) → SecretStorage migration → config seeding

## 3. Welcome & Sign-in Flow

- The **Welcome panel** shows in the JIRA Tickets view until connected.
- It includes **"Welcome to Ticket to Code"**, short info, and a **Sign in to JIRA** button.
- On successful sign-in, tickets load and the normal workflow begins.

## 4. Secrets & Config

- Use `.env` for initial values (`AI_API_KEY`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, toggles).
- On activation: `.env` loads → **SecretStorage** migration → workspace config seeded.
- `.env` is **gitignored**; never commit secrets.

## 5. Core Flows

1. **Sign in to JIRA** (Welcome panel) → Tickets populate; status shows **Connected**.
2. **Chat with AI** (Ctrl/Cmd+Enter) → Response appears → Apply generated code as diff or new file.
3. **Open Ticket** → Optional Git branch auto-create via naming pattern.
4. **CodeLens** above functions to link/view tickets.
5. **Indexing** runs on activation.

## 6. UI Notes (Webview)

- Header banner, live region for messages, keyboard shortcut hints.
- Theme-aware colors via VS Code variables.
- Buttons: Send / Apply Sample Code / Set AI Key / **Sign in to JIRA**.

## 7. Build & Run

```
npm install
npm run build
npm run watch
# Press F5 in VS Code
```

## 8. Commands

- ticket-to-code.connectJira
- ticket-to-code.startSession
- ticket-to-code.showTickets
- ticket-to-code.showTicket

## 9. Settings

See package.json → contributes.configuration
