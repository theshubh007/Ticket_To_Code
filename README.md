# 🎫 Ticket to Code — VS Code Extension

**Streamline your workflow from JIRA tickets to code implementation with AI assistance.**

Get from **ticket → code** without leaving VS Code:

✅ **JIRA Integration** - Browse and manage tickets in sidebar  
🤖 **AI Assistant** - Chat interface for code guidance and generation  
📎 **CodeLens Linking** - Connect code functions to specific tickets  
🔍 **Safe Diff Previews** - Review AI-generated changes before applying  
🌿 **Git Integration** - Auto-create branches per ticket  
🔐 **Secure Configuration** - `.env` → dotenv → SecretStorage migration  

## 🚀 Quick Start for Users

1. **Install the extension** in VS Code
2. **Open the Ticket to Code view** in the Activity Bar (🎫 icon)
3. **Click "Sign in to JIRA"** in the Welcome panel
4. **Start chatting** with the AI Assistant (Ctrl/Cmd+Enter to send)
5. **Visit the website** by clicking "🌐 Visit Website" or running "Ticket to Code: Open Website"
6. **Apply sample code** to see the safe diff workflow

## 🛠️ Development Setup for Teammates

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **VS Code** (latest version)

### Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd ticket-to-code

# Install dependencies
npm install

# Copy environment template and configure secrets
cp .env .env.local
# Edit .env.local with your actual API keys and JIRA credentials
```

### Build Commands
```bash
# Development build with file watching (recommended during development)
npm run watch

# Production build (single build)
npm run build

# Generate/update documentation
npm run gen:doc
```

### Running the Extension
```bash
# Method 1: VS Code Debug (Recommended)
# 1. Open the project in VS Code
# 2. Press F5 to launch Extension Development Host
# 3. The extension will be loaded in the new VS Code window

# Method 2: Manual build then test
npm run build
# Then press F5 in VS Code
```

### Development Workflow
1. **Make code changes** in `src/` directory
2. **Run `npm run watch`** for automatic rebuilding
3. **Press F5** to test in Extension Development Host
4. **Reload the Extension Host** (Ctrl+R) to see changes
5. **Check the Debug Console** for any errors

### Project Structure
```
├── src/                    # TypeScript source code
│   ├── extension.ts        # Main extension entry point
│   ├── providers/          # JIRA, Chat, Tree, CodeLens providers
│   ├── services/           # AI, CodeIndexer, Git services
│   ├── commands/           # VS Code command handlers
│   ├── utils/              # Environment and utility functions
│   └── virtualDocs/        # Generated content provider
├── resources/              # Icons and assets
├── docs/                   # Documentation
├── .env                    # Environment variables (gitignored)
├── package.json            # Extension manifest and dependencies
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Build configuration
```

### Configuration
- **Secrets**: Add real values to `.env` (AI_API_KEY, JIRA credentials)
- **Settings**: Extension settings are in `package.json` → `contributes.configuration`
- **Commands**: Available commands listed in `package.json` → `contributes.commands`

### Troubleshooting
- **Build errors**: Run `npm install` to ensure dependencies are installed
- **Extension not loading**: Check the Debug Console for TypeScript/webpack errors
- **JIRA connection issues**: Verify credentials in `.env` file
- **AI not responding**: Check AI_API_KEY is set correctly
- **"No workspace opened" error**: The extension works without a workspace, but some features (like workspace indexing) require an open folder. Open a folder in VS Code for full functionality.

### Testing Features
- **JIRA Integration**: Use the "Sign in to JIRA" button (uses stubbed data by default)
- **AI Chat**: Send messages with Ctrl/Cmd+Enter
- **CodeLens**: Add ticket IDs like `PROJ-1234` in file headers to see 📎 links
- **Diff Preview**: Click "Apply Sample Code" to see virtual document diffs
- **Git Integration**: Open tickets to auto-create branches (if Git is available)

See **docs/IDE-Design.md** for detailed architecture and feature documentation.