import * as vscode from 'vscode';

export interface FileMetadata {
  uri: string;
  path: string;
  mtime: number;
  tokens: string[];
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
  fileType: string;
  size: number;
}

export interface ContextResult {
  uri: string;
  path: string;
  relevance: number;
  type: string;
  content: string;
  functions: string[];
  classes: string[];
  matches: string[];
}

export class CodeIndexer {
  private index = new Map<string, FileMetadata>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  async indexWorkspace(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    for (const folder of folders) {
      const uris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/*.{ts,tsx,js,jsx,py,java,go}'),
        '**/{node_modules,.git,dist,build}/**'
      );
      await Promise.all(uris.map(u => this.indexFile(u)));
    }
  }

  async indexFile(uri: vscode.Uri): Promise<void> {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const key = uri.toString();
      const prev = this.index.get(key);
      if (prev && prev.mtime === stat.mtime) return;

      const content = (await vscode.workspace.fs.readFile(uri)).toString();
      const metadata = this.extractMetadata(uri, content, stat.mtime);
      this.index.set(key, metadata);
    } catch { /* ignore */ }
  }

  // Enhanced search with multiple strategies
  search(query: string, maxResults: number = 10): ContextResult[] {
    const keywords = this.extractKeywords(query);
    const results: ContextResult[] = [];

    for (const [uri, metadata] of this.index) {
      const relevance = this.calculateRelevance(metadata, keywords, query);
      if (relevance > 0) {
        results.push({
          uri,
          path: metadata.path,
          relevance,
          type: metadata.fileType,
          content: this.getContentPreview(uri),
          functions: metadata.functions,
          classes: metadata.classes,
          matches: this.findMatches(metadata, keywords)
        });
      }
    }

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  // Multi-layered context finding as described in the document
  async findRelevantContext(query: string, ticketData?: any): Promise<ContextResult[]> {
    const keywords = this.extractKeywords(query);
    const ticketKeywords = ticketData ? this.extractKeywords(ticketData.summary + ' ' + ticketData.description) : [];
    const allKeywords = [...keywords, ...ticketKeywords];

    const results: ContextResult[] = [];

    // 1. Semantic Analysis (keyword matching)
    const semanticResults = this.search(query, 20);
    results.push(...semanticResults);

    // 2. Structural Analysis (function/class names)
    const structuralResults = this.findStructuralMatches(allKeywords);
    results.push(...structuralResults);

    // 3. Import/Export Analysis
    const importResults = this.findImportMatches(allKeywords);
    results.push(...importResults);

    // 4. File Type Analysis
    const typeResults = this.findTypeMatches(query);
    results.push(...typeResults);

    // Deduplicate and rank results
    const uniqueResults = this.deduplicateResults(results);
    return uniqueResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 15);
  }

  private extractMetadata(uri: vscode.Uri, content: string, mtime: number): FileMetadata {
    const path = vscode.workspace.asRelativePath(uri);
    const fileType = this.getFileType(uri);
    
    return {
      uri: uri.toString(),
      path,
      mtime,
      tokens: this.tokenize(content),
      functions: this.extractFunctions(content, fileType),
      classes: this.extractClasses(content, fileType),
      imports: this.extractImports(content, fileType),
      exports: this.extractExports(content, fileType),
      fileType,
      size: content.length
    };
  }

  private extractFunctions(content: string, fileType: string): string[] {
    const functions: string[] = [];
    
    if (fileType === 'TypeScript' || fileType === 'JavaScript') {
      // Extract function declarations - multiple patterns
      const patterns = [
        /function\s+(\w+)/g,
        /const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
        /(\w+)\s*:\s*(?:async\s+)?\(/g
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1]) functions.push(match[1]);
        }
      }
    } else if (fileType === 'Python') {
      const funcRegex = /def\s+(\w+)/g;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1]);
      }
    } else if (fileType === 'Java') {
      const funcRegex = /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?\w+\s+(\w+)\s*\(/g;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1]);
      }
    }
    
    return functions;
  }

  private extractClasses(content: string, fileType: string): string[] {
    const classes: string[] = [];
    
    if (fileType === 'TypeScript' || fileType === 'JavaScript') {
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
      }
    } else if (fileType === 'Python') {
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
      }
    } else if (fileType === 'Java') {
      const classRegex = /(?:public\s+)?class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
      }
    }
    
    return classes;
  }

  private extractImports(content: string, fileType: string): string[] {
    const imports: string[] = [];
    
    if (fileType === 'TypeScript' || fileType === 'JavaScript') {
      const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    } else if (fileType === 'Python') {
      const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1] || match[2]);
      }
    } else if (fileType === 'Java') {
      const importRegex = /import\s+([^;]+);/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }
    
    return imports;
  }

  private extractExports(content: string, fileType: string): string[] {
    const exports: string[] = [];
    
    if (fileType === 'TypeScript' || fileType === 'JavaScript') {
      const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }
    }
    
    return exports;
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9_]+/)
      .filter((word) => word.length > 2)
      .filter((word) => !this.isStopWord(word))
      .slice(0, 10);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
      'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'this', 'that', 'with',
      'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much',
      'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long',
      'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ];
    return stopWords.includes(word);
  }

  private calculateRelevance(metadata: FileMetadata, keywords: string[], query: string): number {
    let score = 0;
    
    // Token matching
    for (const keyword of keywords) {
      const tokenMatches = metadata.tokens.filter(token => 
        token.includes(keyword) || keyword.includes(token)
      ).length;
      score += tokenMatches * 2;
    }
    
    // Function name matching
    for (const keyword of keywords) {
      const funcMatches = metadata.functions.filter(func => 
        func.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += funcMatches * 5;
    }
    
    // Class name matching
    for (const keyword of keywords) {
      const classMatches = metadata.classes.filter(cls => 
        cls.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += classMatches * 5;
    }
    
    // Import matching
    for (const keyword of keywords) {
      const importMatches = metadata.imports.filter(imp => 
        imp.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += importMatches * 3;
    }
    
    // File type relevance
    if (query.toLowerCase().includes('component') && metadata.fileType === 'TypeScript') {
      score += 3;
    }
    if (query.toLowerCase().includes('api') && (metadata.path.includes('api') || metadata.path.includes('service'))) {
      score += 3;
    }
    
    return score;
  }

  private findStructuralMatches(keywords: string[]): ContextResult[] {
    const results: ContextResult[] = [];
    
    for (const [uri, metadata] of this.index) {
      let relevance = 0;
      const matches: string[] = [];
      
      for (const keyword of keywords) {
        // Check function names
        const funcMatches = metadata.functions.filter(func => 
          func.toLowerCase().includes(keyword.toLowerCase())
        );
        if (funcMatches.length > 0) {
          relevance += funcMatches.length * 5;
          matches.push(...funcMatches);
        }
        
        // Check class names
        const classMatches = metadata.classes.filter(cls => 
          cls.toLowerCase().includes(keyword.toLowerCase())
        );
        if (classMatches.length > 0) {
          relevance += classMatches.length * 5;
          matches.push(...classMatches);
        }
      }
      
      if (relevance > 0) {
        results.push({
          uri,
          path: metadata.path,
          relevance,
          type: metadata.fileType,
          content: this.getContentPreview(uri),
          functions: metadata.functions,
          classes: metadata.classes,
          matches
        });
      }
    }
    
    return results;
  }

  private findImportMatches(keywords: string[]): ContextResult[] {
    const results: ContextResult[] = [];
    
    for (const [uri, metadata] of this.index) {
      let relevance = 0;
      const matches: string[] = [];
      
      for (const keyword of keywords) {
        const importMatches = metadata.imports.filter(imp => 
          imp.toLowerCase().includes(keyword.toLowerCase())
        );
        if (importMatches.length > 0) {
          relevance += importMatches.length * 3;
          matches.push(...importMatches);
        }
      }
      
      if (relevance > 0) {
        results.push({
          uri,
          path: metadata.path,
          relevance,
          type: metadata.fileType,
          content: this.getContentPreview(uri),
          functions: metadata.functions,
          classes: metadata.classes,
          matches
        });
      }
    }
    
    return results;
  }

  private findTypeMatches(query: string): ContextResult[] {
    const results: ContextResult[] = [];
    const queryLower = query.toLowerCase();
    
    for (const [uri, metadata] of this.index) {
      let relevance = 0;
      const matches: string[] = [];
      
      // File type relevance
      if (queryLower.includes('component') && metadata.fileType === 'TypeScript' && 
          (metadata.path.includes('component') || metadata.classes.some(cls => cls.includes('Component')))) {
        relevance += 5;
        matches.push('component');
      }
      
      if (queryLower.includes('service') && metadata.fileType === 'TypeScript' && 
          (metadata.path.includes('service') || metadata.classes.some(cls => cls.includes('Service')))) {
        relevance += 5;
        matches.push('service');
      }
      
      if (queryLower.includes('api') && (metadata.path.includes('api') || metadata.path.includes('endpoint'))) {
        relevance += 5;
        matches.push('api');
      }
      
      if (relevance > 0) {
        results.push({
          uri,
          path: metadata.path,
          relevance,
          type: metadata.fileType,
          content: this.getContentPreview(uri),
          functions: metadata.functions,
          classes: metadata.classes,
          matches
        });
      }
    }
    
    return results;
  }

  private findMatches(metadata: FileMetadata, keywords: string[]): string[] {
    const matches: string[] = [];
    
    for (const keyword of keywords) {
      if (metadata.tokens.some(token => token.includes(keyword))) {
        matches.push(keyword);
      }
    }
    
    return matches;
  }

  private deduplicateResults(results: ContextResult[]): ContextResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.uri)) {
        return false;
      }
      seen.add(result.uri);
      return true;
    });
  }

  private getContentPreview(uri: string): string {
    // Return a preview of the file content for context
    const metadata = this.index.get(uri);
    if (!metadata) return '';
    
    // Return first 500 characters as preview
    return metadata.tokens.join(' ').substring(0, 500);
  }

  private getFileType(uri: vscode.Uri): string {
    const ext = uri.path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'py':
        return 'Python';
      case 'java':
        return 'Java';
      case 'go':
        return 'Go';
      default:
        return 'Code';
    }
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean).slice(0, 5000);
  }
}