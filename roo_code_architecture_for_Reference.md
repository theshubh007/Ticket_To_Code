# Roo-Code Extension Architecture

## Overview
Roo-Code is an AI-powered autonomous coding agent VS Code extension that can communicate in natural language, read/write files, run terminal commands, and integrate with various AI providers.

## Project Structure

### Root Level
- **Monorepo Structure**: Uses pnpm workspace with multiple packages
- **Main Extension**: Located in `src/` directory
- **Webview UI**: Located in `webview-ui/` directory  
- **Packages**: Shared packages in `packages/` directory
- **Apps**: Additional applications in `apps/` directory

### Key Directories

#### `/src` - Main Extension Code
- **`extension.ts`**: Main entry point, handles activation/deactivation
- **`core/`**: Core functionality including webview, context, tools, prompts
- **`api/`**: AI provider integrations (OpenAI, Anthropic, etc.)
- **`services/`**: Various services (code indexing, search, browser, etc.)
- **`integrations/`**: VS Code integrations (editor, terminal, diagnostics)
- **`activate/`**: Command registration and activation logic
- **`shared/`**: Shared utilities and types

#### `/webview-ui` - Frontend UI
- React-based webview interface
- Handles user interactions and displays chat interface
- Communicates with extension via message passing

#### `/packages` - Shared Packages
- **`types`**: TypeScript type definitions
- **`cloud`**: Cloud service integration
- **`telemetry`**: Analytics and telemetry
- **`ipc`**: Inter-process communication

## Extension Activation Flow

1. **Entry Point** (`src/extension.ts`):
   - Loads environment variables
   - Initializes telemetry service
   - Sets up cloud service
   - Initializes code index managers
   - Creates ClineProvider (main webview provider)
   - Registers commands and providers

2. **ClineProvider** (`src/core/webview/ClineProvider.ts`):
   - Main webview provider that handles the chat interface
   - Manages conversation state and message handling
   - Coordinates between UI and backend services

3. **Command Registration** (`src/activate/`):
   - Registers VS Code commands
   - Sets up code actions and terminal actions
   - Handles URI routing

## Key Components

### 1. Webview Provider (ClineProvider)
- **Purpose**: Manages the main chat interface
- **Location**: `src/core/webview/ClineProvider.ts`
- **Responsibilities**:
  - Webview lifecycle management
  - Message handling between UI and extension
  - State management for conversations
  - Integration with AI providers

### 2. AI Provider System
- **Purpose**: Abstracts different AI providers (OpenAI, Anthropic, etc.)
- **Location**: `src/api/providers/`
- **Key Files**:
  - `base-provider.ts`: Base class for all providers
  - `openai.ts`: OpenAI integration
  - `anthropic.ts`: Anthropic Claude integration
  - Multiple other provider implementations

### 3. Context Management
- **Purpose**: Manages file context and relevance
- **Location**: `src/core/context/`
- **Key Features**:
  - File relevance detection
  - Context window management
  - Code indexing and search

### 4. Tools System
- **Purpose**: Provides capabilities for file operations, terminal commands, etc.
- **Location**: `src/core/tools/`
- **Key Tools**:
  - File reading/writing
  - Terminal command execution
  - Browser automation
  - Git operations

### 5. Code Indexing Service
- **Purpose**: Indexes and searches code for relevance
- **Location**: `src/services/code-index/`
- **Features**:
  - Semantic code indexing
  - File relevance scoring
  - Search capabilities

## User Input Processing Flow

### Step 1: User Input Reception
1. User types message in webview UI
2. Message sent to ClineProvider via webview messaging
3. ClineProvider processes the message

### Step 2: Context Analysis
1. **Code Index Manager** analyzes the input
2. **Relevance Detection** finds related files
3. **Context Building** gathers relevant code context

### Step 3: AI Processing
1. Message sent to configured AI provider
2. AI processes with context and tools available
3. Response generated with potential tool calls

### Step 4: Tool Execution
1. Tool calls are executed (file operations, commands, etc.)
2. Results fed back to AI for final response
3. Response displayed to user

## File Relevance Detection

The extension uses several mechanisms to find relevant files:

1. **Code Indexing**: Semantic indexing of codebase
2. **Context Mentions**: User can explicitly mention files
3. **Semantic Search**: AI-powered relevance detection
4. **File Patterns**: Based on file types and naming patterns
5. **Git Context**: Recent changes and related files

## Step 2: VS Code Extension Configuration and Activation

### Extension Manifest (`src/package.json`)
- **Activation Events**: `onLanguage` and `onStartupFinished`
- **Main Entry**: `./dist/extension.js` (compiled from `src/extension.ts`)
- **Webview Integration**: 
  - Activity bar container: `roo-cline-ActivityBar`
  - Sidebar provider: `roo-cline.SidebarProvider`
  - Tab panel provider: `roo-cline.TabPanelProvider`

### Command Registration
- **Location**: `src/activate/registerCommands.ts`
- **Key Commands**:
  - `roo-cline.plusButtonClicked` - New task
  - `roo-cline.explainCode` - Explain selected code
  - `roo-cline.fixCode` - Fix selected code
  - `roo-cline.improveCode` - Improve selected code
  - `roo-cline.addToContext` - Add to context

### Code Actions Provider
- **Location**: `src/activate/CodeActionProvider.ts`
- **Purpose**: Provides context menu actions for code selection
- **Actions**: Explain, Fix, Improve, Add to Context, New Task

### Context Proxy
- **Location**: `src/core/config/ContextProxy.ts`
- **Purpose**: Manages extension state, settings, and configuration
- **Features**:
  - Global state management
  - Secret state handling (API keys, etc.)
  - Settings validation and migration

## User Input Processing Flow (Detailed)

### 1. User Input Reception
1. **Webview UI** → User types message in React interface
2. **Message Handler** → `src/core/webview/webviewMessageHandler.ts` processes message
3. **Message Types**:
   - `askResponse` - User response to AI question
   - `newTask` - New conversation/task
   - `messageResponse` - Regular user message

### 2. Task Creation and Management
1. **ClineProvider** → `src/core/webview/ClineProvider.ts` manages tasks
2. **Task Creation** → `createTask()` method creates new Task instance
3. **Task Stack** → Multiple tasks can be stacked (subtasks)

### 3. Message Processing in Task
1. **Task Class** → `src/core/task/Task.ts` handles message processing
2. **Input Handling** → `handleWebviewAskResponse()` processes user input
3. **Task Loop** → `initiateTaskLoop()` starts the main processing loop

### 4. Environment Details and File Context
1. **Environment Details** → `src/core/environment/getEnvironmentDetails.ts`
2. **File Context Inclusion**:
   - **Visible Files**: Currently open files in VS Code
   - **Open Tabs**: All open tabs in VS Code
   - **Workspace Files**: Directory listing (when `includeFileDetails=true`)
   - **Recently Modified**: Files changed since last access
   - **Terminal Output**: Active and completed terminal processes

### 5. API Request Processing
1. **Request Building** → `recursivelyMakeClineRequests()` builds API request
2. **File Details** → Only included on first request (`includeFileDetails=true`)
3. **Context Assembly** → User message + environment details + conversation history
4. **AI Processing** → Sent to configured AI provider (OpenAI, Anthropic, etc.)

## Step 3: User Input Processing and File Relevance Detection

### Message Processing Pipeline

1. **User Input Reception**:
   - Webview UI → `webviewMessageHandler.ts` → Message routing
   - Message types: `askResponse`, `newTask`, `messageResponse`

2. **Message Enhancement**:
   - **MessageEnhancer** (`src/core/webview/messageEnhancer.ts`):
     - Uses AI to enhance user prompts
     - Can include task history for context
     - Optional feature for improving user input quality

3. **Mention Processing**:
   - **parseMentions** (`src/core/mentions/index.ts`):
     - Processes special mentions in user messages
     - Supports: `@filename`, `@folder/`, `@problems`, `@git-changes`, `@terminal`, `@url`, `@command`
     - Automatically includes file/folder content, diagnostics, git state, etc.

4. **Content Processing**:
   - **processUserContentMentions** (`src/core/mentions/processUserContentMentions.ts`):
     - Processes mentions within `<task>`, `<feedback>`, `<answer>`, `<user_message>` tags
     - Only processes mentions in specific contexts to avoid noise

### File Relevance Detection Mechanisms

#### 1. **VS Code Native Context** (Always Included)
- **Visible Files**: Currently open files in VS Code editors
- **Open Tabs**: All open tabs across all tab groups
- **Recently Modified**: Files changed since last access (tracked by FileContextTracker)

#### 2. **Workspace Context** (First Request Only)
- **Directory Listing**: Workspace files (limited by `maxWorkspaceFiles` setting)
- **Filtered**: Through RooIgnoreController (respects .gitignore, .rooignore)
- **Condition**: Only included when `includeFileDetails=true` (first request)

#### 3. **Terminal Context** (Dynamic)
- **Active Terminals**: Currently running processes and their output
- **Completed Terminals**: Finished processes with output
- **Working Directories**: Current working directories of terminals

#### 4. **Explicit User Mentions** (On-Demand)
- **File Mentions**: `@filename` - includes full file content
- **Folder Mentions**: `@folder/` - includes folder contents
- **Special Mentions**:
  - `@problems` - workspace diagnostics
  - `@git-changes` - git working state
  - `@terminal` - latest terminal output
  - `@url` - web content
  - `@command` - command help/man pages

#### 5. **Code Indexing System** (Advanced Search)
- **Semantic Search**: Vector-based code search using embeddings
- **Location**: `src/services/code-index/`
- **Components**:
  - **CodeIndexManager**: Singleton per workspace
  - **SearchService**: Handles vector search queries
  - **Embedder**: Creates embeddings for code
  - **VectorStore**: Stores and searches embeddings
- **Usage**: Available as `codebase_search` tool for AI to use
- **Features**:
  - Semantic similarity search
  - Directory filtering
  - Score-based relevance ranking
  - Code chunk extraction with line numbers

#### 6. **File Context Tracking** (Stale Detection)
- **FileContextTracker** (`src/core/context-tracking/FileContextTracker.ts`):
  - Tracks files that have been accessed by Roo
  - Monitors external file changes
  - Prevents stale context by notifying when files are modified outside Roo
  - Sets up file watchers for tracked files

### Context Assembly Process

1. **User Message Processing**:
   ```
   User Input → parseMentions → Enhanced Content
   ```

2. **Environment Details Assembly**:
   ```
   Visible Files + Open Tabs + Workspace Files + Terminal Output + Recently Modified
   ```

3. **API Request Building**:
   ```
   Enhanced User Content + Environment Details + Conversation History → AI Request
   ```

4. **Dynamic Context Addition**:
   - AI can use `codebase_search` tool for semantic search
   - AI can request specific files via mentions
   - Context is added incrementally based on AI needs

## Step 4: Tool System Architecture

### Tool Execution Pipeline

1. **Assistant Message Parsing**:
   - **AssistantMessageParser** (`src/core/assistant-message/AssistantMessageParser.ts`):
     - Parses streaming AI responses in real-time
     - Extracts text blocks and tool use blocks
     - Handles partial content during streaming
     - Maintains state between chunks

2. **Message Presentation**:
   - **presentAssistantMessage** (`src/core/assistant-message/presentAssistantMessage.ts`):
     - Core message handling system
     - Sequentially processes content blocks
     - Displays text content to user
     - Executes tool use requests with user approval
     - Manages conversation flow

3. **Tool Execution Flow**:
   ```
   AI Response → AssistantMessageParser → presentAssistantMessage → Tool Execution → User Approval → Tool Result
   ```

### Available Tools

#### **File Operations**:
- **read_file**: Read file contents with line numbers and syntax highlighting
- **write_to_file**: Write content to files
- **apply_diff**: Apply unified diff patches to files
- **insert_content**: Insert content at specific line positions
- **search_and_replace**: Search and replace text in files
- **list_files**: List files in directory with filtering
- **search_files**: Search files by regex pattern

#### **Code Analysis**:
- **codebase_search**: Semantic search using vector embeddings
- **list_code_definition_names**: List function/class definitions in files

#### **Terminal Operations**:
- **execute_command**: Run shell commands with approval system

#### **Browser Operations**:
- **browser_action**: Control web browser (click, type, navigate)

#### **Task Management**:
- **new_task**: Create new subtasks
- **attempt_completion**: Mark task as complete
- **ask_followup_question**: Ask user for clarification
- **switch_mode**: Change AI mode/personality

#### **MCP Integration**:
- **use_mcp_tool**: Use Model Context Protocol tools
- **access_mcp_resource**: Access MCP resources

#### **Utility Tools**:
- **fetch_instructions**: Get task instructions
- **update_todo_list**: Manage todo lists
- **generate_image**: Generate images using AI

### Tool Execution Architecture

#### **Tool Registration**:
- Tools are imported and registered in `presentAssistantMessage.ts`
- Each tool has a specific function signature:
  ```typescript
  async function toolName(
    cline: Task,
    block: ToolUse,
    askApproval: AskApproval,
    handleError: HandleError,
    pushToolResult: PushToolResult,
    removeClosingTag: RemoveClosingTag
  )
  ```

#### **Approval System**:
- **askApproval**: Requests user permission before executing tools
- **Auto-approval**: Can be configured for specific tools
- **Partial execution**: Shows progress during long-running operations

#### **Error Handling**:
- **handleError**: Standardized error handling for all tools
- **Tool validation**: Validates tool parameters before execution
- **Retry mechanism**: Automatic retry for certain types of errors

#### **Result Processing**:
- **pushToolResult**: Sends tool results back to AI
- **Tool descriptions**: Provides human-readable descriptions of tool actions
- **Progress tracking**: Shows execution progress to user

### Code Indexing System (Advanced Search)

#### **Architecture**:
- **CodeIndexManager**: Singleton per workspace, coordinates all indexing
- **CodeIndexOrchestrator**: Manages indexing workflow and file watching
- **SearchService**: Handles vector search queries
- **Embedder**: Creates embeddings for code (OpenAI, Ollama, etc.)
- **VectorStore**: Stores and searches embeddings (Qdrant, etc.)

#### **Indexing Process**:
1. **Initial Scan**: Scans workspace files and creates embeddings
2. **File Watching**: Monitors file changes and updates index
3. **Batch Processing**: Processes multiple files efficiently
4. **Error Recovery**: Handles indexing errors gracefully

#### **Search Features**:
- **Semantic Search**: Vector-based similarity search
- **Directory Filtering**: Limit search to specific directories
- **Score-based Ranking**: Relevance scoring for results
- **Code Chunk Extraction**: Returns relevant code snippets with line numbers

#### **Configuration**:
- **Embedding Models**: Configurable embedding providers
- **Vector Stores**: Configurable vector database backends
- **Search Parameters**: Configurable min score, max results, etc.

### Context Management Summary

Roo-Code uses a **multi-layered context system**:

1. **VS Code Native Context** (Always Available):
   - Visible files, open tabs, recently modified files

2. **Workspace Context** (First Request Only):
   - Directory listing with filtering

3. **Dynamic Context** (On-Demand):
   - User mentions (`@filename`, `@problems`, etc.)
   - AI-driven tool usage (codebase_search, read_file, etc.)

4. **Semantic Context** (Advanced):
   - Vector-based code search
   - Relevance scoring and ranking

5. **Stale Detection**:
   - File change monitoring
   - Context freshness validation

## Implementation Insights for Your Extension

### Key Architectural Patterns:

1. **Streaming Processing**: Real-time parsing of AI responses
2. **Tool-Based Architecture**: Modular tool system with approval workflow
3. **Context Layering**: Multiple context sources with different update frequencies
4. **Semantic Search**: Vector embeddings for intelligent file discovery
5. **State Management**: Comprehensive state tracking and persistence

### Critical Components to Implement:

1. **Message Parser**: Real-time streaming parser for AI responses
2. **Tool Registry**: Modular tool system with approval workflow
3. **Context Manager**: Multi-layered context assembly
4. **File Watcher**: Change detection and stale context prevention
5. **Vector Search**: Semantic code search capabilities

## Step 5: AI API Integration and Response Handling

### API Request Flow

1. **Request Preparation**:
   - **System Prompt Generation**: `getSystemPrompt()` creates comprehensive system prompt including:
     - Role definitions and mode-specific instructions
     - Tool descriptions and capabilities
     - System information (OS, workspace, etc.)
     - Custom instructions and rules
     - MCP server information (if enabled)
   
   - **Context Assembly**: `getEnvironmentDetails()` includes:
     - **VS Code Context**: Visible files, open tabs, recently modified files
     - **Workspace Context**: Directory listing (up to 200 files by default)
     - **Terminal Context**: Active/inactive terminal processes and output
     - **File Context**: Recently modified files tracked by FileContextTracker
     - **Todo List**: Current task reminders and progress

2. **Message Processing**:
   - **User Input Processing**: `processUserContentMentions()` handles:
     - File mentions (`@filename`) - automatically includes file content
     - Folder mentions (`@folder/`) - includes folder contents
     - Special mentions (`@workspace`, `@terminal`, etc.)
     - URL content fetching
     - Diagnostic messages from VS Code
   
   - **Context Truncation**: `truncateConversationIfNeeded()` manages:
     - Token counting and context window limits
     - Automatic conversation condensing
     - Context window exceeded error handling
     - Profile-specific thresholds

3. **API Request Construction**:
   ```typescript
   const stream = this.api.createMessage(systemPrompt, cleanConversationHistory, metadata)
   ```
   - **System Prompt**: Comprehensive instructions and context
   - **Conversation History**: Cleaned and truncated message history
   - **Metadata**: Task ID, mode, previous response ID (for GPT-5 continuity)

### API Provider System

1. **Provider Architecture**:
   - **BaseProvider**: Abstract base class with common functionality
   - **Provider-Specific Handlers**: AnthropicHandler, OpenAiHandler, etc.
   - **Unified Interface**: All providers implement `ApiHandler` interface
   - **Streaming Support**: All providers return `ApiStream` for real-time responses

2. **Supported Providers**:
   - **Anthropic**: Claude models with prompt caching and ephemeral cache
   - **OpenAI**: GPT models with various formats (R1, legacy, etc.)
   - **OpenRouter**: Unified interface for multiple models
   - **Azure OpenAI**: Enterprise OpenAI integration
   - **Local Models**: Ollama, LM Studio, etc.
   - **Other Providers**: Groq, Mistral, DeepSeek, and many more

3. **Provider-Specific Features**:
   - **Prompt Caching**: Anthropic and OpenAI support prompt caching for efficiency
   - **Ephemeral Cache**: Anthropic's cache system for conversation continuity
   - **Rate Limiting**: Built-in rate limiting and retry logic
   - **Token Counting**: Provider-specific or tiktoken-based token counting

### Response Processing

1. **Streaming Response Handling**:
   ```typescript
   for await (const chunk of stream) {
     switch (chunk.type) {
       case "reasoning": // Claude's thinking process
       case "usage": // Token usage and cost information
       case "text": // Actual response content
       case "error": // Error handling
     }
   }
   ```

2. **Content Block Processing**:
   - **AssistantMessageParser**: Parses streaming content into blocks
   - **Text Blocks**: Displayed directly to user
   - **Tool Use Blocks**: Parsed and executed with user approval
   - **Partial Content**: Handled during streaming for real-time updates

3. **Tool Execution Flow**:
   - **Tool Validation**: `validateToolUse()` checks tool permissions and parameters
   - **User Approval**: `askApproval()` requests user confirmation for tool execution
   - **Tool Execution**: Switch statement routes to specific tool implementations
   - **Result Processing**: Tool results are formatted and added to conversation
   - **Error Handling**: Comprehensive error handling with user feedback

### Key Integration Features

1. **Context Management**:
   - **Automatic File Context**: Workspace files, visible files, open tabs
   - **Smart Truncation**: Context window management with automatic condensing
   - **File Tracking**: Recently modified files and terminal output
   - **Mention System**: Explicit file/folder mentions in user input

2. **Tool System**:
   - **Comprehensive Tool Set**: File operations, code search, terminal execution, etc.
   - **User Approval**: All tool executions require user confirmation
   - **Tool Repetition Detection**: Prevents infinite loops and mistakes
   - **Checkpoint System**: File system checkpoints for safe operations

3. **Error Handling**:
   - **Context Window Errors**: Automatic truncation and retry
   - **Rate Limiting**: Built-in delays and retry logic
   - **Tool Errors**: Graceful error handling with user feedback
   - **Streaming Errors**: Robust error recovery during streaming

4. **Performance Optimizations**:
   - **Prompt Caching**: Reduces token usage for repeated system prompts
   - **Ephemeral Cache**: Anthropic's conversation continuity system
   - **Background Processing**: Non-blocking operations for better UX
   - **Token Optimization**: Smart context truncation and condensing

---

*This completes the comprehensive analysis of Roo-Code's architecture. The extension demonstrates sophisticated patterns for AI-powered code assistance with intelligent context management, tool execution, and API integration.*
