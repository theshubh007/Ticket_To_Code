import * as vscode from 'vscode';
import { WelcomeProvider } from './views/webviews/welcome/provider';
import { ChatProvider } from './views/webviews/chat/provider';
import { IntegrationsProvider } from './views/webviews/integrations/provider';
import { AboutProvider } from './views/webviews/about/provider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Ticket to Code extension is now active!');

	// Initialize webview providers
	const welcomeProvider = new WelcomeProvider(context.extensionUri, context);
	const chatProvider = new ChatProvider(context.extensionUri, context);
	const integrationsProvider = new IntegrationsProvider(context.extensionUri, context);
	const aboutProvider = new AboutProvider(context.extensionUri, context);

	// Register webview providers
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('ticketToCode.welcome', welcomeProvider),
		vscode.window.registerWebviewViewProvider('ticketToCode.chat', chatProvider),
		vscode.window.registerWebviewViewProvider('ticketToCode.integrations', integrationsProvider),
		vscode.window.registerWebviewViewProvider('ticketToCode.about', aboutProvider)
	);

	// Register commands
	context.subscriptions.push(
		// Welcome commands
		vscode.commands.registerCommand('ticketToCode.openWelcome', async () => {
			await vscode.commands.executeCommand('ticketToCode.welcome.focus');
		}),

		// Settings commands
		vscode.commands.registerCommand('ticketToCode.openSettings', async () => {
			await vscode.commands.executeCommand('workbench.action.openSettings', 'ticketToCode');
		}),

		// Integration commands
		vscode.commands.registerCommand('ticketToCode.openIntegrations', async () => {
			await vscode.commands.executeCommand('ticketToCode.integrations.focus');
		}),
		vscode.commands.registerCommand('ticketToCode.openAbout', async () => {
			await vscode.commands.executeCommand('ticketToCode.about.focus');
		}),

		// Jira sign-in command with realistic flow
		vscode.commands.registerCommand('ticketToCode.signInJira', async () => {
			// Show Jira URL input
			const jiraUrl = await vscode.window.showInputBox({
				prompt: 'Enter your Jira base URL',
				placeHolder: 'https://yourcompany.atlassian.net',
				validateInput: (value) => {
					if (!value) {
						return 'Jira URL is required';
					}
					if (!value.startsWith('https://')) {
						return 'URL must start with https://';
					}
					return null;
				}
			});

			if (!jiraUrl) {
				return;
			}

			// Show authentication method selection
			const authMethod = await vscode.window.showQuickPick([
				{ label: 'OAuth 2.0 (Recommended)', value: 'oauth' },
				{ label: 'Personal Access Token', value: 'pat' }
			], {
				placeHolder: 'Select authentication method'
			});

			if (!authMethod) {
				return;
			}

			if (authMethod.value === 'oauth') {
				// Simulate OAuth flow
				vscode.window.showInformationMessage('Opening Jira OAuth authentication...');
				await vscode.env.openExternal(vscode.Uri.parse(`${jiraUrl}/plugins/servlet/oauth/authorize?response_type=code&client_id=ticket-to-code&redirect_uri=vscode://ticket-to-code.auth/callback`));
				
				// Simulate successful authentication
				setTimeout(() => {
					vscode.window.showInformationMessage('✅ Successfully connected to Jira!');
					vscode.commands.executeCommand('setContext', 'ticketToCode.jiraAuthenticated', true);
					// Update status bar
					jiraStatusBarItem.text = '$(check) Jira';
					jiraStatusBarItem.tooltip = 'Connected to Jira';
				}, 2000);
			} else {
				// PAT flow
				const email = await vscode.window.showInputBox({
					prompt: 'Enter your Jira email',
					placeHolder: 'your.email@company.com',
					validateInput: (value) => {
						if (!value || !value.includes('@')) {
							return 'Valid email is required';
						}
						return null;
					}
				});

				if (!email) {
					return;
				}

				const token = await vscode.window.showInputBox({
					prompt: 'Enter your Personal Access Token',
					placeHolder: 'Your Jira PAT',
					password: true,
					validateInput: (value) => {
						if (!value || value.length < 10) {
							return 'Valid token is required';
						}
						return null;
					}
				});

				if (!token) {
					return;
				}

				// Simulate token validation
				vscode.window.showInformationMessage('Validating credentials...');
				setTimeout(() => {
					vscode.window.showInformationMessage('✅ Successfully connected to Jira with PAT!');
					vscode.commands.executeCommand('setContext', 'ticketToCode.jiraAuthenticated', true);
					// Update status bar
					jiraStatusBarItem.text = '$(check) Jira';
					jiraStatusBarItem.tooltip = 'Connected to Jira';
				}, 1500);
			}
		}),
		vscode.commands.registerCommand('ticketToCode.refreshTickets', async () => {
			vscode.window.showInformationMessage('Refresh tickets clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.openChat', async () => {
			await vscode.commands.executeCommand('ticketToCode.chat.focus');
		}),
		vscode.commands.registerCommand('ticketToCode.startIndexing', async () => {
			vscode.window.showInformationMessage('Start indexing clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.pauseIndexing', async () => {
			vscode.window.showInformationMessage('Pause indexing clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.clearIndexCache', async () => {
			vscode.window.showInformationMessage('Clear cache clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.createBranch', async () => {
			vscode.window.showInformationMessage('Create branch clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.applyPatch', async () => {
			vscode.window.showInformationMessage('Apply patch clicked (UI only)');
		}),
		vscode.commands.registerCommand('ticketToCode.showDiff', async () => {
			vscode.window.showInformationMessage('Show diff clicked (UI only)');
		})
	);

	// Register status bar items
	const jiraStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	const indexingStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
	const ticketStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);

	// Status bar setup
	jiraStatusBarItem.text = '$(x) Jira';
	jiraStatusBarItem.tooltip = 'Not connected to Jira';
	jiraStatusBarItem.command = 'ticketToCode.signInJira';
	jiraStatusBarItem.show();

	indexingStatusBarItem.text = '$(database) Index';
	indexingStatusBarItem.tooltip = 'Start indexing';
	indexingStatusBarItem.command = 'ticketToCode.startIndexing';
	indexingStatusBarItem.show();

	ticketStatusBarItem.text = '$(ticket) No Ticket';
	ticketStatusBarItem.tooltip = 'No ticket selected';
	ticketStatusBarItem.command = 'ticketToCode.openChat';
	ticketStatusBarItem.show();

	context.subscriptions.push(jiraStatusBarItem, indexingStatusBarItem, ticketStatusBarItem);

	// Set initial context
	vscode.commands.executeCommand('setContext', 'ticketToCode.workspaceOpen', true);
	vscode.commands.executeCommand('setContext', 'ticketToCode.jiraAuthenticated', false);
	vscode.commands.executeCommand('setContext', 'ticketToCode.ticketSelected', false);
	vscode.commands.executeCommand('setContext', 'ticketToCode.indexingActive', false);
	vscode.commands.executeCommand('setContext', 'ticketToCode.onboarded', false);

	// Show welcome message for first-time users
	const hasShownWelcome = context.globalState.get('ticketToCode.hasShownWelcome', false);
	if (!hasShownWelcome) {
		vscode.commands.executeCommand('ticketToCode.openWelcome');
		context.globalState.update('ticketToCode.hasShownWelcome', true);
	}
}

export function deactivate() {
	console.log('Ticket to Code extension is now deactivated!');
}