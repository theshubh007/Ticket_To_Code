# Ticket to Code

Turn Jira tickets into working code with an AI agent and live code indexing.

## Features

### 🎫 Jira Integration
- **OAuth 2.0 & PAT Support**: Secure authentication with Jira Cloud
- **Ticket Management**: View assigned tickets with filtering and search
- **Real-time Sync**: Automatic ticket updates and status tracking
- **Rich Ticket Details**: Full ticket information with attachments and comments

### 🤖 AI-Powered Code Generation
- **Multiple AI Providers**: OpenAI, Azure OpenAI, OpenRouter, and custom endpoints
- **Streaming Responses**: Real-time AI responses with stop/start controls
- **Context-Aware**: AI understands your codebase through live indexing
- **Interactive Tools**: Built-in commands for code search, file operations, and git integration

### 📁 Live Code Indexing
- **Smart Indexing**: Automatically indexes your workspace respecting `.gitignore`
- **Multi-language Support**: TypeScript, JavaScript, Python, Java, C#, and more
- **Symbol Extraction**: Functions, classes, interfaces, and variables
- **Progress Tracking**: Real-time indexing progress with pause/resume

### 💬 Interactive Chat Interface
- **Ticket-Focused**: Chat context includes selected ticket details
- **Tool Commands**: `/search`, `/open`, `/plan`, `/scaffold`, `/commit`, `/test`
- **Code Actions**: Apply patches, create branches, show diffs
- **Message History**: Persistent chat history per ticket

### ⚙️ Comprehensive Settings
- **Secure Storage**: API keys stored in VS Code's secret storage
- **Flexible Configuration**: Customizable indexing patterns and AI settings
- **Settings Import/Export**: Easy configuration sharing and backup
- **Validation**: Built-in settings validation with helpful error messages

## Quick Start

### 1. Install the Extension
```bash
# Install from VS Code Marketplace
# Or install from source
npm install
npm run build
```

### 2. Connect to Jira
1. Open the **Ticket to Code** sidebar
2. Click **"Sign in with Jira"**
3. Enter your Jira base URL (e.g., `https://company.atlassian.net`)
4. Complete OAuth authentication or use Personal Access Token

### 3. Configure AI Provider
1. Go to **Integrations** tab
2. Select your AI provider (OpenAI, Azure, OpenRouter, or Custom)
3. Enter your API key
4. Test the connection

### 4. Start Indexing
1. Go to **Indexing** tab
2. Click **"Start Indexing"** to index your workspace
3. Wait for indexing to complete

### 5. Select a Ticket
1. Go to **Tickets** tab
2. Click on any ticket to view details
3. Click **"Start Work"** to begin AI chat

## Usage

### Basic Workflow

1. **Select a Ticket**: Choose from your assigned tickets
2. **Start AI Chat**: Click "Start Work" to open the AI chat
3. **Describe Your Needs**: Tell the AI what you want to implement
4. **Use Tools**: Leverage built-in commands for code operations
5. **Apply Changes**: Use AI suggestions to modify your code

### AI Chat Commands

- `/search <query>` - Search the codebase
- `/open <file:line>` - Open a file at specific line
- `/plan` - Create an implementation plan
- `/scaffold` - Generate file structure
- `/commit` - Propose git changes
- `/test` - Run tests
- `/explain <code>` - Explain code functionality

### Keyboard Shortcuts

- `Ctrl+Shift+R` - Refresh tickets
- `Ctrl+Shift+C` - Open AI chat
- `Ctrl+Shift+I` - Start indexing

## Configuration

### Jira Settings
```json
{
  "ticketToCode.jira.baseUrl": "https://company.atlassian.net",
  "ticketToCode.jira.authMethod": "oauth",
  "ticketToCode.jira.email": "your.email@company.com"
}
```

### AI Settings
```json
{
  "ticketToCode.ai.provider": "openai",
  "ticketToCode.ai.routerUrl": "https://custom-router.com/api"
}
```

### Indexing Settings
```json
{
  "ticketToCode.index.paths": ["**/*"],
  "ticketToCode.index.exclude": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**"
  ],
  "ticketToCode.index.maxFileSizeKB": 512
}
```

## Architecture

### Core Components

- **Authentication**: Jira OAuth 2.0 and PAT support
- **Jira Client**: REST API integration with error handling
- **AI Provider Router**: Multi-provider AI integration
- **Code Indexer**: Workspace indexing with symbol extraction
- **Webview Providers**: React-based UI components
- **Tree Data Providers**: VS Code tree view integration

### File Structure

```
src/
├── auth/                 # Authentication providers
├── jira/                 # Jira API client
├── ai/                   # AI provider router
├── views/                # Tree data providers
│   └── webviews/         # Webview providers
├── services/             # Core services
└── extension.ts          # Main extension entry point
```

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5+
- VS Code Extension API

### Building
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run watch
```

### Testing
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [ticket-to-code.dev/docs](https://ticket-to-code.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/ticket-to-code/ticket-to-code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ticket-to-code/ticket-to-code/discussions)

## Changelog

### v1.0.0
- Initial release with Jira integration
- AI-powered code generation
- Live code indexing and search
- Interactive chat interface
- Multiple AI provider support
- Comprehensive settings management

---

Made with ❤️ for developers