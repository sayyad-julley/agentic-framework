/**
 * Context7 Keyword-Based Search Handler
 * 
 * This handler extracts keywords from any query, searches Context7 docs,
 * and fetches related documentation for responses.
 */

class KeywordSearchHandler {
  constructor() {
    this.mcpAvailable = true;
    
    // Common stop words to filter out
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'how', 'what', 'when', 'where', 'why', 'who', 'which', 'that', 'this', 'these', 'those',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'use', 'using', 'used', 'explain', 'tell', 'show', 'give', 'help', 'me', 'about'
    ]);
  }

  /**
   * Extract meaningful keywords from a query
   * @param {string} query - User's query
   * @returns {Array<string>} - Array of extracted keywords
   */
  extractKeywords(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    // Convert to lowercase and split into words
    const words = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .split(/\s+/)
      .filter(word => word.length > 1); // Remove single characters

    // Filter out stop words and get unique keywords
    const keywords = [...new Set(
      words
        .filter(word => !this.stopWords.has(word))
        .filter(word => word.length > 2) // Keep words longer than 2 chars
    )];

    // If we have multi-word phrases, also extract those
    const phrases = this.extractPhrases(query, keywords);
    
    // Combine keywords and phrases, prioritizing longer/more specific terms
    const allTerms = [...phrases, ...keywords].sort((a, b) => b.length - a.length);

    return allTerms.slice(0, 5); // Return top 5 most relevant terms
  }

  /**
   * Extract meaningful phrases from query
   * @param {string} query - User's query
   * @param {Array<string>} keywords - Already extracted keywords
   * @returns {Array<string>} - Array of phrases
   */
  extractPhrases(query, keywords) {
    const phrases = [];
    const lowerQuery = query.toLowerCase();

    // Common technical phrase patterns
    const phrasePatterns = [
      /(?:react|vue|angular|svelte)\s+hooks?/gi,
      /(?:state|global)\s+management/gi,
      /(?:api|rest)\s+route/gi,
      /(?:server|client)\s+side/gi,
      /(?:type|interface)\s+(?:vs|versus|difference)/gi,
      /(?:async|await)\s+(?:function|code)/gi,
      /(?:error|exception)\s+handling/gi,
      /(?:data|database)\s+(?:fetch|query|access)/gi,
      /(?:form|input)\s+validation/gi,
      /(?:authentication|auth)\s+(?:flow|process)/gi,
    ];

    // Extract matching phrases
    phrasePatterns.forEach(pattern => {
      const matches = lowerQuery.match(pattern);
      if (matches) {
        phrases.push(...matches.map(m => m.trim().replace(/\s+/g, '-')));
      }
    });

    // Extract 2-3 word combinations that might be library names
    const words = lowerQuery.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]}-${words[i + 1]}`;
      if (words[i].length > 2 && words[i + 1].length > 2 && 
          !this.stopWords.has(words[i]) && !this.stopWords.has(words[i + 1])) {
        phrases.push(twoWord);
      }
    }

    return [...new Set(phrases)];
  }

  /**
   * Generate MCP tool calls for keyword-based search
   * @param {string} userQuery - User's query
   * @returns {Object} - Tool calls and instructions
   */
  generateSearchToolCalls(userQuery) {
    const keywords = this.extractKeywords(userQuery);
    
    if (keywords.length === 0) {
      // Fallback: use the query itself as a search term
      keywords.push(userQuery.trim().toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/)[0]);
    }

    // Primary keyword (most specific/longest)
    const primaryKeyword = keywords[0];
    
    // Additional keywords for broader search
    const additionalKeywords = keywords.slice(1, 3);

    // Generate tool calls for each keyword using official Context7 MCP tool names (with prefix)
    const toolCalls = keywords.slice(0, 3).map((keyword, index) => ({
      tool: 'mcp_context7_resolve-library-id', // Official Context7 MCP tool name (with prefix)
      parameters: {
        libraryName: keyword
      },
      description: `Search Context7 for "${keyword}"`,
      priority: index === 0 ? 'primary' : 'secondary'
    }));

    // Generate get-library-docs calls (will use resolved IDs)
    const docToolCalls = keywords.slice(0, 3).map((keyword, index) => ({
      tool: 'mcp_context7_get-library-docs', // Official Context7 MCP tool name (with prefix)
      parameters: {
        context7CompatibleLibraryID: `{{resolved_id_${index}}}`,
        topic: this.extractTopic(userQuery),
        tokens: 5000
      },
      description: `Fetch documentation for "${keyword}"`,
      priority: index === 0 ? 'primary' : 'secondary'
    }));

    return {
      keywords: keywords,
      primaryKeyword: primaryKeyword,
      toolCalls: [
        ...toolCalls,
        ...docToolCalls
      ],
      instructions: this.generateInstructions(userQuery, keywords)
    };
  }

  /**
   * Extract topic from query if present
   * @param {string} query - User's query
   * @returns {string|null} - Extracted topic or null
   */
  extractTopic(query) {
    const lowerQuery = query.toLowerCase();
    const topics = [
      'hooks', 'routing', 'state', 'api', 'authentication', 'validation',
      'testing', 'deployment', 'performance', 'optimization', 'styling',
      'forms', 'components', 'middleware', 'database', 'caching'
    ];

    for (const topic of topics) {
      if (lowerQuery.includes(topic)) {
        return topic;
      }
    }

    return null;
  }

  /**
   * Generate instructions for MCP tool calls
   * @param {string} userQuery - Original query
   * @param {Array<string>} keywords - Extracted keywords
   * @returns {string} - Formatted instructions
   */
  generateInstructions(userQuery, keywords) {
    return `🔍 CONTEXT7 KEYWORD SEARCH REQUIRED

**User Query**: "${userQuery}"
**Extracted Keywords**: ${keywords.join(', ')}

**SEARCH STRATEGY**:
1. Search Context7 docs list using extracted keywords
2. Resolve library IDs for matching documentation
3. Fetch related docs for each match
4. Use fetched docs as PRIMARY SOURCE for response

**REQUIRED MCP TOOL CALLS**:

**Step 1: Search & Resolve** (for each keyword):
${keywords.slice(0, 3).map((keyword, i) => `
${i + 1}. Call \`mcp_context7_resolve-library-id\` with:
   - libraryName: "${keyword}"
   - This searches Context7 docs list for "${keyword}"
`).join('')}

**Step 2: Fetch Documentation** (for each resolved ID):
${keywords.slice(0, 3).map((keyword, i) => `
${i + 1}. Call \`mcp_context7_get-library-docs\` with:
   - context7CompatibleLibraryID: [resolved ID from step ${i + 1}]
   - topic: ${this.extractTopic(userQuery) || 'null (general docs)'}
   - tokens: 5000
   - This fetches documentation related to "${keyword}"
`).join('')}

**CRITICAL INSTRUCTIONS**:
- Use ALL fetched documentation as the PRIMARY SOURCE
- Combine information from multiple docs if multiple keywords matched
- Only use existing knowledge to supplement, not replace, the fetched docs
- If no docs found for a keyword, try the next keyword
- Base your entire response on the fetched Context7 documentation`;
  }

  /**
   * Process query and return search strategy
   * @param {string} query - User's query
   * @returns {Object} - Search strategy and tool calls
   */
  processQuery(query) {
    const keywords = this.extractKeywords(query);
    const toolCalls = this.generateSearchToolCalls(query);

    return {
      originalQuery: query,
      keywords: keywords,
      primaryKeyword: toolCalls.primaryKeyword,
      toolCalls: toolCalls.toolCalls,
      instructions: toolCalls.instructions,
      shouldSearch: keywords.length > 0
    };
  }
}

module.exports = KeywordSearchHandler;

