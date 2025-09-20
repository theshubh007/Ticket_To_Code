// Add this import at the top of treeDataProvider.ts
import { MCPServer, TicketAnalysisResult } from './mcpServer';

export class TreeDataProvider {
    private _webviewPanel: any; // Add this property

    // Replace the existing handleSendMessage method with this:
    private async handleSendMessage(text: string, attachments: string[]) {
    if (!this._webviewPanel) return;

    console.log('📨 Received message:', text);
    
    try {
        // Show processing message
        await this._webviewPanel.webview.postMessage({
            command: "receiveMessage",
            text: "🔄 Analyzing ticket and searching for relevant code...",
            attachments: [],
            isUser: false,
        });

        // Process with MCP Server
        const mcpServer = new MCPServer();
        const result: TicketAnalysisResult = await mcpServer.processTicket(text, attachments);
        
        // Format response for user
        const response = this.formatAnalysisResponse(result);
        
        await this._webviewPanel.webview.postMessage({
            command: "receiveMessage",
            text: response,
            attachments: attachments,
            isUser: false,
        });

        // Show code matches in separate messages for better UX
        for (const match of result.codeMatches.slice(0, 3)) { // Show top 3
            const matchMessage = this.formatCodeMatch(match);
            await this._webviewPanel.webview.postMessage({
                command: "receiveMessage",
                text: matchMessage,
                attachments: [],
                isUser: false,
            });
        }

    } catch (error) {
        console.error('❌ Error processing message:', error);
        await this._webviewPanel.webview.postMessage({
            command: "receiveMessage",
            text: `❌ Error analyzing ticket: ${error instanceof Error ? error.message : String(error)}`,
            attachments: [],
            isUser: false,
        });
    }
}

/**
 * Format the analysis result for display
 */
private formatAnalysisResponse(result: TicketAnalysisResult): string {
    let response = `✅ **Ticket Analysis Complete**\n\n`;
    
    response += `🎯 **Confidence Score:** ${Math.round(result.confidence * 100)}%\n\n`;
    
    if (result.suggestedFiles.length > 0) {
        response += `📁 **Suggested Files (${result.suggestedFiles.length}):**\n`;
        result.suggestedFiles.slice(0, 5).forEach(file => {
            const fileName = file.split('/').pop() || file;
            response += `• ${fileName}\n`;
        });
        response += '\n';
    }
    
    if (result.recommendations.length > 0) {
        response += `💡 **Recommendations:**\n`;
        result.recommendations.forEach(rec => {
            response += `${rec}\n`;
        });
        response += '\n';
    }
    
    response += `🔍 Found **${result.codeMatches.length}** potential code matches`;
    
    return response;
}

/**
 * Format individual code match for display
 */
private formatCodeMatch(match: any): string {
    const similarity = Math.round(match.similarity * 100);
    const fileName = match.segment.filePath.split('/').pop() || match.segment.filePath;
    
    return `🎯 **${similarity}% Match** - \`${match.segment.name}\`
📍 **File:** ${fileName} (Line ${match.segment.startLine})
🤖 **AI Reasoning:** ${match.reasoning}

\`\`\`typescript
${match.segment.content.split('\n').slice(0, 5).join('\n')}...
\`\`\``;
    }
}