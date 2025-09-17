import * as vscode from "vscode"
import { TicketToCodeTreeDataProvider } from "./treeDataProvider"

export function activate(context: vscode.ExtensionContext) {
  console.log("Ticket to Code extension is now active!")

  // Create the tree data provider
  const treeDataProvider = new TicketToCodeTreeDataProvider(context)

  // Register the tree data provider
  vscode.window.createTreeView("ticketToCodeView", {
    treeDataProvider: treeDataProvider,
  })

  // Register commands
  const openPanelCommand = vscode.commands.registerCommand(
    "ticketToCode.openPanel",
    () => {
      treeDataProvider.createWebviewPanel()
    }
  )

  const attachFilesCommand = vscode.commands.registerCommand(
    "ticketToCode.attachFiles",
    () => {
      vscode.window.showInformationMessage(
        "File attachment will be available in the chat panel"
      )
    }
  )

  const settingsCommand = vscode.commands.registerCommand(
    "ticketToCode.settings",
    () => {
      vscode.window.showInformationMessage("Settings panel coming soon!")
    }
  )

  context.subscriptions.push(
    openPanelCommand,
    attachFilesCommand,
    settingsCommand
  )
}

export function deactivate() {
  console.log("Ticket to Code extension is now deactivated!")
}
