import * as vscode from 'vscode';

// Types for our system
export interface JiraTicket {
    id: string;
    summary: string;
    description: string;
    type: string;
    priority: string;
}

export interface CodeSegment {
    filePath: string;
    startLine: number;
    endLine: number;
    content: string;
    type: 'function' | 'class' | 'method' | 'variable';
    name: string;
}

export interface CodeMatch {
    segment: CodeSegment;
    similarity: number;
    reasoning: string;
}

export interface TicketAnalysisResult {
    suggestedFiles: string[];
    codeMatches: CodeMatch[];
    recommendations: string[];
    confidence: number;
}

export class MCPServer {
    private workspaceRoot: string | undefined;

    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }

    /**
     * Main entry point - processes a ticket and returns analysis
     */
    async processTicket(ticketText: string, attachments: string[] = []): Promise<TicketAnalysisResult> {
        console.log('🎫 Processing ticket:', ticketText);
        
        try {
            // Step 1: Parse ticket information
            const ticket = this.parseTicketFromText(ticketText);
            
            // Step 2: Analyze workspace for relevant code
            const codeSegments = await this.analyzeWorkspace(ticket);
            
            // Step 3: Generate AI-powered matches (mock for now)
            const matches = await this.generateCodeMatches(ticket, codeSegments);
            
            // Step 4: Generate recommendations
            const recommendations = this.generateRecommendations(ticket, matches);
            
            return {
                suggestedFiles: matches.map(m => m.segment.filePath),
                codeMatches: matches,
                recommendations,
                confidence: 0.85 // Mock confidence score
            };
            
        } catch (error) {
            console.error('❌ Error processing ticket:', error);
            throw error;
        }
    }

    /**
     * Parse ticket information from text input
     */
    private parseTicketFromText(text: string): JiraTicket {
        // Simple parsing - in real implementation, integrate with Jira API
        const lines = text.split('\n');
        const firstLine = lines[0] || text;
        
        // Extract ticket ID if present (PROJ-123 format)
        const ticketIdMatch = firstLine.match(/([A-Z]+-\d+)/);
        const ticketId = ticketIdMatch ? ticketIdMatch[1] : `MOCK-${Date.now()}`;
        
        return {
            id: ticketId,
            summary: firstLine.replace(/[A-Z]+-\d+\s*:?\s*/, '').substring(0, 100),
            description: text,
            type: this.detectTicketType(text),
            priority: this.detectPriority(text)
        };
    }

    /**
     * Analyze workspace to find relevant code segments
     */
    private async analyzeWorkspace(ticket: JiraTicket): Promise<CodeSegment[]> {
        if (!this.workspaceRoot) {
            console.warn('⚠️ No workspace found');
            return [];
        }

        const codeSegments: CodeSegment[] = [];
        
        // Find TypeScript/JavaScript files
        const files = await vscode.workspace.findFiles(
            '{**/*.ts,**/*.js,**/*.tsx,**/*.jsx}',
            '{**/node_modules/**,**/dist/**,**/build/**}',
            50 // Limit for initial implementation
        );

        for (const file of files) {
            try {
                const content = await vscode.workspace.fs.readFile(file);
                const text = Buffer.from(content).toString('utf8');
                const segments = this.extractCodeSegments(file.fsPath, text);
                codeSegments.push(...segments);
            } catch (error) {
                console.warn(`⚠️ Could not read file ${file.fsPath}:`, error);
            }
        }

        console.log(`🔍 Found ${codeSegments.length} code segments in ${files.length} files`);
        return codeSegments;
    }

    /**
     * Extract code segments from file content
     */
    private extractCodeSegments(filePath: string, content: string): CodeSegment[] {
        const segments: CodeSegment[] = [];
        const lines = content.split('\n');
        
        // Simple regex-based extraction (in production, use proper AST parsing)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Functions
            const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)/);
            if (functionMatch) {
                segments.push({
                    filePath,
                    startLine: i + 1,
                    endLine: i + 10, // Mock end line
                    content: lines.slice(i, i + 10).join('\n'),
                    type: 'function',
                    name: functionMatch[1]
                });
            }
            
            // Classes
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                segments.push({
                    filePath,
                    startLine: i + 1,
                    endLine: i + 20, // Mock end line
                    content: lines.slice(i, i + 20).join('\n'),
                    type: 'class',
                    name: classMatch[1]
                });
            }
        }
        
        return segments;
    }

    /**
     * Generate code matches using AI analysis (mock implementation)
     */
    private async generateCodeMatches(ticket: JiraTicket, codeSegments: CodeSegment[]): Promise<CodeMatch[]> {
        console.log('🤖 Generating AI-powered code matches...');
        
        // Mock AI analysis - in production, use Amazon Q + Bedrock
        const keywords = this.extractKeywords(ticket.description);
        const matches: CodeMatch[] = [];
        
        for (const segment of codeSegments) {
            const similarity = this.calculateMockSimilarity(keywords, segment);
            
            if (similarity > 0.3) { // Threshold for relevance
                matches.push({
                    segment,
                    similarity,
                    reasoning: `Found ${similarity > 0.7 ? 'strong' : 'potential'} match based on keywords: ${keywords.slice(0, 3).join(', ')}`
                });
            }
        }
        
        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);
        
        console.log(`✨ Generated ${matches.length} code matches`);
        return matches.slice(0, 10); // Top 10 matches
    }

    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations(ticket: JiraTicket, matches: CodeMatch[]): string[] {
        const recommendations: string[] = [];
        
        if (matches.length === 0) {
            recommendations.push("🔍 No direct code matches found. Consider creating new implementation.");
            recommendations.push("📝 Review similar tickets for implementation patterns.");
        } else {
            recommendations.push(`🎯 Found ${matches.length} relevant code segments`);
            
            if (matches[0].similarity > 0.8) {
                recommendations.push(`⭐ High confidence match: ${matches[0].segment.name} in ${matches[0].segment.filePath}`);
            }
            
            if (ticket.type === 'Bug') {
                recommendations.push("🐛 Bug detected - focus on error handling and edge cases");
            } else if (ticket.type === 'Feature') {
                recommendations.push("✨ Feature request - consider extending existing functionality");
            }
            
            recommendations.push("🔗 Link this ticket to the suggested code segments for traceability");
        }
        
        return recommendations;
    }

    // Helper methods
    private detectTicketType(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bug') || lowerText.includes('error') || lowerText.includes('fix')) {
            return 'Bug';
        } else if (lowerText.includes('feature') || lowerText.includes('add') || lowerText.includes('implement')) {
            return 'Feature';
        } else if (lowerText.includes('improve') || lowerText.includes('enhance') || lowerText.includes('optimize')) {
            return 'Improvement';
        }
        return 'Task';
    }

    private detectPriority(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('high')) {
            return 'High';
        } else if (lowerText.includes('low') || lowerText.includes('minor')) {
            return 'Low';
        }
        return 'Medium';
    }

    private extractKeywords(text: string): string[] {
        // Simple keyword extraction
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were'].includes(word));
        
        return [...new Set(words)]; // Remove duplicates
    }

    private calculateMockSimilarity(keywords: string[], segment: CodeSegment): number {
        const segmentText = (segment.name + ' ' + segment.content).toLowerCase();
        let matches = 0;
        
        for (const keyword of keywords) {
            if (segmentText.includes(keyword)) {
                matches++;
            }
        }
        
        return Math.min(matches / Math.max(keywords.length, 1), 1.0);
    }
}