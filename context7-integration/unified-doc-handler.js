/**
 * Unified Documentation Handler with Multiple Fallback Strategies
 * 
 * This handler tries multiple approaches to fetch documentation:
 * 1. Context7 MCP tools (if available)
 * 2. Document Retrieval System MCP (fallback)
 * 3. Web search (final fallback)
 */

class UnifiedDocHandler {
  constructor() {
    this.strategies = [
      { name: 'context7_mcp', priority: 1 },
      { name: 'document_retrieval', priority: 2 },
      { name: 'web_search', priority: 3 }
    ];
  }

  /**
   * Extract keywords from query
   * @param {string} query - User's query
   * @returns {Array<string>} - Extracted keywords
   */
  extractKeywords(query) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how']);
    
    const words = query.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Extract technical terms and library names
    const keywords = [];
    
    // Look for common library/framework patterns
    const libraryPatterns = [
      /react/i,
      /vue/i,
      /angular/i,
      /dom/i,
      /hooks/i,
      /state/i,
      /redux/i,
      /typescript/i,
      /javascript/i,
      /node/i,
      /express/i,
      /next/i,
      /tailwind/i,
      /css/i,
      /html/i
    ];
    
    // Add matched patterns
    libraryPatterns.forEach(pattern => {
      const match = query.match(pattern);
      if (match) {
        keywords.push(match[0].toLowerCase());
      }
    });
    
    // Add significant words
    words.forEach(word => {
      if (word.length > 3 && !keywords.includes(word)) {
        keywords.push(word);
      }
    });
    
    return keywords.slice(0, 5);
  }

  /**
   * Generate tool calls for document retrieval system
   * @param {string} query - User's query
   * @returns {Object} - Tool calls and instructions
   */
  generateDocumentRetrievalCalls(query) {
    const keywords = this.extractKeywords(query);
    
    return {
      strategy: 'document_retrieval',
      toolCalls: [
        {
          tool: 'mcp_document-retrieval-system_search_documents',
          parameters: {
            query: query,
            max_results: 5,
            topics: keywords.slice(0, 3),
            min_relevance: 0.3
          },
          description: `Search document retrieval system for "${query}"`
        },
        {
          tool: 'mcp_document-retrieval-system_get_document_context',
          parameters: {
            query: query,
            max_tokens: 4000,
            max_results: 5
          },
          description: `Get formatted document context for "${query}"`
        }
      ],
      instructions: `Use the document retrieval system to find relevant documentation for: "${query}". The system will search through available document sources and return relevant content.`
    };
  }

  /**
   * Generate tool calls for web search fallback
   * @param {string} query - User's query
   * @returns {Object} - Tool calls and instructions
   */
  generateWebSearchCalls(query) {
    const keywords = this.extractKeywords(query);
    const searchQuery = keywords.length > 0 
      ? `${keywords[0]} ${keywords.slice(1, 3).join(' ')} documentation`
      : query;
    
    return {
      strategy: 'web_search',
      toolCalls: [
        {
          tool: 'web_search',
          parameters: {
            search_term: searchQuery
          },
          description: `Search the web for "${searchQuery}"`
        }
      ],
      instructions: `Use web search to find current documentation and information about: "${query}". This is a fallback when MCP tools are unavailable.`
    };
  }

  /**
   * Generate unified tool calls with fallback strategy
   * @param {string} query - User's query
   * @returns {Object} - Unified tool calls with fallbacks
   */
  generateUnifiedToolCalls(query) {
    const keywords = this.extractKeywords(query);
    
    // Primary: Try Context7 MCP (if available)
    const context7Calls = {
      tool: 'mcp_context7_resolve-library-id',
      parameters: {
        libraryName: keywords[0] || query.split(/\s+/)[0]
      },
      description: `Try Context7 MCP to resolve library ID for "${keywords[0] || query}"`,
      fallback: true // Mark as fallback-able
    };
    
    // Fallback 1: Document Retrieval System
    const docRetrievalCalls = this.generateDocumentRetrievalCalls(query);
    
    // Fallback 2: Web Search
    const webSearchCalls = this.generateWebSearchCalls(query);
    
    return {
      primary: {
        strategy: 'context7_mcp',
        toolCalls: [context7Calls],
        instructions: `First, try Context7 MCP tools. If they fail, use the fallback strategies below.`
      },
      fallbacks: [
        docRetrievalCalls,
        webSearchCalls
      ],
      keywords: keywords,
      recommendation: `Try Context7 MCP first. If it fails, use document retrieval system, then web search as final fallback.`
    };
  }

  /**
   * Generate instructions for handling query with fallbacks
   * @param {string} query - User's query
   * @returns {string} - Instructions for AI assistant
   */
  generateInstructions(query) {
    const keywords = this.extractKeywords(query);
    
    return `
**Documentation Fetching Strategy (with Fallbacks)**

For query: "${query}"

**Step 1: Try Context7 MCP** (if available)
- Call: mcp_context7_resolve-library-id with libraryName: "${keywords[0] || 'react'}"
- If successful, call: mcp_context7_get-library-docs
- If this fails, proceed to Step 2

**Step 2: Use Document Retrieval System** (fallback)
- Call: mcp_document-retrieval-system_search_documents
- Call: mcp_document-retrieval-system_get_document_context
- This searches available document sources

**Step 3: Use Web Search** (final fallback)
- Call: web_search with search_term: "${keywords.join(' ')} documentation"
- Use the search results to provide information

**Important**: Always try the primary method first, but gracefully fall back if it fails.
Use the retrieved documentation as the PRIMARY SOURCE for your response.
`;
  }
}

module.exports = UnifiedDocHandler;

