import * as vscode from "vscode"
import { TicketTreeDataProvider } from "./providers/TreeDataProvider"
import { ChatProvider } from "./providers/ChatProvider"
import { JiraProvider } from "./providers/JiraProvider"
import { JiraConnectionProvider } from "./providers/JiraConnectionProvider"
import { TicketCodeLensProvider } from "./providers/CodeLensProvider"
import { registerCommands } from "./commands"
import { GeneratedContentProvider } from "./virtualDocs/GeneratedContentProvider"
import { CodeIndexer } from "./services/CodeIndexer"
import { loadEnv, migrateEnvToSecrets, seedConfigFromEnv } from "./utils/env"

let statusBarItem: vscode.StatusBarItem

export async function activate(context: vscode.ExtensionContext) {
  loadEnv(context)
  await migrateEnvToSecrets(context)
  await seedConfigFromEnv()

  const jira = new JiraProvider(context)
  const isConn = await jira.isConnected()
  await vscode.commands.executeCommand(
    "setContext",
    "ticketToCode.connected",
    isConn
  )

  const ticketsTree = new TicketTreeDataProvider(jira)
  const codeIndexer = new CodeIndexer(context)
  const jiraConnectionProvider = new JiraConnectionProvider(context, jira)
  const chatProvider = new ChatProvider(context, jira, codeIndexer)
  const generatedDocProvider = new GeneratedContentProvider()

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("jiraConnection", jiraConnectionProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.window.registerTreeDataProvider("ticketList", ticketsTree),
    vscode.window.registerWebviewViewProvider("aiChat", chatProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.workspace.registerTextDocumentContentProvider(
      "generated",
      generatedDocProvider
    ),
    vscode.languages.registerCodeLensProvider(
      { scheme: "file" },
      new TicketCodeLensProvider()
    )
  )

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBarItem.text = isConn
    ? "$(plug) Ticket to Code: Connected"
    : "$(plug) Ticket to Code: Disconnected"
  statusBarItem.command = "ticket-to-code.connectJira"
  statusBarItem.show()
  context.subscriptions.push(statusBarItem)

  registerCommands(context, {
    jira,
    ticketsTree,
    chatProvider,
    generatedDocProvider,
    codeIndexer,
    statusBarItem,
  })

  const cfg = vscode.workspace.getConfiguration("ticket-to-code")
  if (cfg.get("autoIndex", true)) {
    codeIndexer
      .indexWorkspace()
      .catch((err) => console.error("Index error", err))
  }
}

export function deactivate() {}
