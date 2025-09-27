import * as vscode from "vscode"
import { JiraProvider } from "../providers/JiraProvider"
import { ChatProvider } from "../providers/ChatProvider"
import { GeneratedContentProvider } from "../virtualDocs/GeneratedContentProvider"
import { CodeIndexer } from "../services/CodeIndexer"

interface Ctx {
  jira: JiraProvider
  chatProvider: ChatProvider
  generatedDocProvider: GeneratedContentProvider
  codeIndexer: CodeIndexer
  statusBarItem: vscode.StatusBarItem
}

export function registerCommands(context: vscode.ExtensionContext, deps: Ctx) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ticket-to-code.connectJira", async () => {
      try {
        const ok = await deps.jira.connect()
        deps.statusBarItem.text = ok
          ? "$(plug) Ticket to Code: Connected"
          : "$(plug) Ticket to Code: Disconnected"
        await vscode.commands.executeCommand(
          "setContext",
          "ticketToCode.connected",
          ok
        )
      } catch (error) {
        console.error("Failed to connect to JIRA:", error)
        vscode.window.showErrorMessage(
          "Failed to connect to JIRA. Please check your credentials and try again."
        )
      }
    }),

    vscode.commands.registerCommand("ticket-to-code.startSession", async () => {
      const key = await vscode.window.showInputBox({
        prompt: "Enter AI API Key",
        password: true,
        value: process.env["AI_API_KEY"] || "",
      })
      if (key) await context.secrets.store("ticket-to-code.aiKey", key)
      vscode.window.showInformationMessage("AI session configured.")
    }),

    vscode.commands.registerCommand("ticket-to-code.showTickets", async () => {
      await vscode.commands.executeCommand(
        "workbench.view.extension.ticket-to-code"
      )
    }),

    vscode.commands.registerCommand(
      "ticket-to-code.showTicket",
      async (ticketId?: string) => {
        const id =
          ticketId ||
          (await vscode.window.showInputBox({
            prompt: "Enter Ticket ID (e.g., PROJ-1234)",
          }))
        if (!id) return

        const doc = await vscode.workspace.openTextDocument({
          content: `# ${id}\n\nTicket details would appear here…`,
          language: "markdown",
        })
        await vscode.window.showTextDocument(doc, { preview: true })

        const cfg = vscode.workspace.getConfiguration("ticket-to-code")
        if (cfg.get("gitIntegration.autoCreateBranch")) {
          const pattern =
            cfg.get<string>("gitIntegration.branchNamingPattern") ??
            "feature/{ticket-id}"
          const name = pattern
            .replace("{ticket-id}", id)
            .replace("{description}", "work")
          try {
            await vscode.commands.executeCommand("git.branch", { name })
          } catch {
            /* noop if Git not available */
          }
        }
      }
    ),

    vscode.commands.registerCommand("ticket-to-code.openWebsite", async () => {
      const websiteUrl = "https://ticket-to-code.dev" // Replace with your actual website URL
      await vscode.env.openExternal(vscode.Uri.parse(websiteUrl))
      vscode.window.showInformationMessage("Opening Ticket to Code website...")
    }),

    vscode.commands.registerCommand("ticket-to-code.disconnectJira", async () => {
      try {
        await deps.jira.disconnect()
        deps.statusBarItem.text = "$(plug) Ticket to Code: Disconnected"
        await vscode.commands.executeCommand(
          "setContext",
          "ticketToCode.connected",
          false
        )
        vscode.window.showInformationMessage("Disconnected from JIRA successfully.")
      } catch (error) {
        console.error("Failed to disconnect from JIRA:", error)
        vscode.window.showErrorMessage("Failed to disconnect from JIRA.")
      }
    }),

    vscode.commands.registerCommand("ticket-to-code.importSettings", async () => {
      try {
        // Show file picker for settings file
        const fileUri = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            'JSON Files': ['json'],
            'All Files': ['*']
          },
          title: 'Select Settings File to Import'
        })

        if (fileUri && fileUri[0]) {
          const settingsContent = await vscode.workspace.fs.readFile(fileUri[0])
          const settings = JSON.parse(settingsContent.toString())
          
          // Import JIRA settings
          if (settings.jira) {
            const config = vscode.workspace.getConfiguration('ticket-to-code')
            if (settings.jira.url) {
              await config.update('jira.url', settings.jira.url, vscode.ConfigurationTarget.Global)
            }
          }
          
          // Import AI settings
          if (settings.ai && settings.ai.apiKey) {
            await context.secrets.store('ticket-to-code.aiKey', settings.ai.apiKey)
          }
          
          vscode.window.showInformationMessage('Settings imported successfully!')
        }
      } catch (error) {
        console.error("Failed to import settings:", error)
        vscode.window.showErrorMessage("Failed to import settings. Please check the file format.")
      }
    }),

    vscode.commands.registerCommand("ticket-to-code.loadTickets", async () => {
      try {
        const isConnected = await deps.jira.isConnected()
        if (!isConnected) {
          vscode.window.showWarningMessage("Please connect to JIRA first.")
          return
        }
        
        // Refresh the JIRA connection view
        await vscode.commands.executeCommand("ticket-to-code.refreshViews")
        vscode.window.showInformationMessage("Loading tickets...")
      } catch (error) {
        console.error("Failed to load tickets:", error)
        vscode.window.showErrorMessage("Failed to load tickets.")
      }
    })
  )
}
