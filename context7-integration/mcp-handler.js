/**
 * Context7 MCP Handler - Dynamic Library Detection & Tool Calling
 *
 * This module automatically detects ANY library name in user queries and
 * calls Context7 MCP tools to fetch documentation. It works with any library,
 * not just predefined ones (e.g., "zustand", "prisma", "react-query", etc.).
 *
 * The actual MCP tools are called by the AI assistant in Cursor.
 */

class Context7MCPHandler {
  constructor() {
    this.mcpAvailable = true; // MCP is configured in Cursor

    // Common programming-related keywords to identify library queries
    this.programmingKeywords = [
      'explain', 'how to', 'tutorial', 'guide', 'documentation', 'docs',
      'api', 'reference', 'example', 'usage', 'implementation', 'syntax',
      'getting started', 'quickstart', 'best practices', 'setup', 'install'
    ];

    // Common technical patterns that suggest a library/framework
    this.technicalPatterns = [
      /\b[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)*\b/gi, // matches library names like "zustand", "react-query", "prisma.client"
      /\b(?:npm|yarn|pip|pip3|cargo|go get)\s+install\s+([a-z0-9@\-./]+)/gi,
      /\bimport\s+(?:["']([^"']+)["']|\w+\s+from\s+["']([^"']+)["'])/gi,
      /\brequire\s*\(\s*["']([^"']+)["']\s*\)/gi,
      /\bfrom\s+["']([^"']+)["']/gi
    ];
  }

  /**
   * Dynamically detect library names from any query
   * This works with ANY library name, not just predefined ones
   *
   * @param {string} query - User's query
   * @returns {Object} - Detection results with library names and topics
   */
  detectLibraries(query) {
    const lowerQuery = query.toLowerCase();
    const words = query.split(/\s+/);
    const potentialLibraries = new Set();

    // Method 1: Look for context words followed by library names (most reliable)
    const contextWords = ['explain', 'how', 'use', 'implement', 'setup', 'configure', 'install', 'what is', 'tutorial', 'guide', 'example'];
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[^\w\-\.]/g, '');

      // Check if word follows a context word (most reliable detection)
      const prevWords = words.slice(Math.max(0, i - 2), i);
      const nextWords = words.slice(i + 1, Math.min(words.length, i + 2));

      // Look for patterns like "explain zustand" or "how to use zustand"
      const hasContextWord = prevWords.some(prev =>
        contextWords.some(ctx => prev.toLowerCase().includes(ctx))
      );

      if (hasContextWord && word.length > 1 && !this.isCommonWord(word) && !this.isProgrammingKeyword(word)) {
        potentialLibraries.add(word);
      }

      // Check for multi-word libraries like "react hook form" or "tanstack query"
      if (i < words.length - 1) {
        const twoWordPhrase = `${word}-${words[i + 1].toLowerCase().replace(/[^\w\-\.]/g, '')}`;
        if (word.length > 1 && words[i + 1].length > 1 &&
            !this.isCommonWord(words[i + 1]) && hasContextWord) {
          potentialLibraries.add(twoWordPhrase);
        }
      }

      if (i < words.length - 2) {
        const threeWordPhrase = `${word}-${words[i + 1].toLowerCase().replace(/[^\w\-\.]/g, '')}-${words[i + 2].toLowerCase().replace(/[^\w\-\.]/g, '')}`;
        if (word.length > 1 && words[i + 1].length > 1 && words[i + 2].length > 1 &&
            !this.isCommonWord(words[i + 1]) && !this.isCommonWord(words[i + 2]) && hasContextWord) {
          potentialLibraries.add(threeWordPhrase);
        }
      }
    }

    // Method 2: Look for explicit library mentions in common patterns
    for (const pattern of this.technicalPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up the match to extract library name
          const cleanMatch = match.replace(/^(npm|yarn|pip|pip3|cargo|go get)\s+install\s+/, '')
                                .replace(/^(import|require|from)\s+/, '')
                                .replace(/['"]/g, '')
                                .split('/')[0] // Take first part of scoped packages
                                .split('@')[0]; // Remove version tags

          if (cleanMatch && cleanMatch.length > 1 && !this.isCommonWord(cleanMatch)) {
            potentialLibraries.add(cleanMatch.toLowerCase());
          }
        });
      }
    }

    // Method 3: Look for camelCase or kebab-case patterns that suggest library names
    const camelCasePattern = /\b[a-z]+(?:[A-Z][a-z]*)+\b/g;
    const camelCaseMatches = query.match(camelCasePattern);
    if (camelCaseMatches) {
      camelCaseMatches.forEach(match => {
        if (!this.isCommonWord(match.toLowerCase())) {
          potentialLibraries.add(match.toLowerCase());
        }
      });
    }

    // Method 4: Look for kebab-case patterns
    const kebabCasePattern = /\b[a-z]+(?:-[a-z]+)+\b/g;
    const kebabCaseMatches = query.match(kebabCasePattern);
    if (kebabCaseMatches) {
      kebabCaseMatches.forEach(match => {
        if (!this.isCommonWord(match.toLowerCase())) {
          potentialLibraries.add(match.toLowerCase());
        }
      });
    }

    // Convert to array and prioritize longer names (more specific)
    const libraries = Array.from(potentialLibraries).sort((a, b) => b.length - a.length);

    // Extract topics/keywords
    const topic = this.extractTopic(query);

    // Determine if this is likely a library query
    const isLibraryQuery = libraries.length > 0 ||
                           this.programmingKeywords.some(keyword => lowerQuery.includes(keyword));

    return {
      libraries: libraries,
      primaryLibrary: libraries[0] || null,
      topic: topic,
      originalQuery: query,
      isLibraryQuery: isLibraryQuery,
      confidence: libraries.length > 0 ? 'high' : (isLibraryQuery ? 'medium' : 'low')
    };
  }

  /**
   * Check if a word is a programming keyword (not a library name)
   */
  isProgrammingKeyword(word) {
    const programmingKeywords = new Set([
      'explain', 'how', 'to', 'use', 'using', 'used', 'implement', 'setup', 'configure', 'install', 'installed',
      'tutorial', 'example', 'examples', 'guide', 'documentation', 'docs', 'reference', 'api',
      'getting', 'started', 'quickstart', 'best', 'practices', 'patterns', 'architecture',
      'what', 'when', 'where', 'why', 'which', 'that', 'this', 'these', 'those', 'with', 'from', 'for',
      'tutorial', 'guide', 'example', 'setup', 'installation', 'config', 'configuration', 'integration'
    ]);

    return programmingKeywords.has(word.toLowerCase());
  }

  /**
   * Check if a word is a common word (not a library name)
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'how', 'what', 'when', 'where', 'why', 'who', 'which', 'that', 'this', 'these',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'shall', 'use', 'using', 'used', 'make', 'made', 'take', 'took', 'taken',
      'get', 'got', 'gotten', 'see', 'saw', 'seen', 'come', 'came', 'run', 'ran',
      'know', 'knew', 'think', 'thought', 'say', 'said', 'tell', 'told', 'ask',
      'asked', 'work', 'worked', 'try', 'tried', 'need', 'needed', 'seem', 'seemed',
      'help', 'helped', 'play', 'played', 'start', 'started', 'hand', 'handed',
      'part', 'parts', 'way', 'ways', 'day', 'days', 'man', 'men', 'thing', 'things',
      'woman', 'women', 'life', 'lives', 'world', 'worlds', 'school', 'schools',
      'state', 'states', 'family', 'families', 'student', 'students', 'group',
      'groups', 'country', 'countries', 'problem', 'problems', 'hand', 'hands',
      'place', 'places', 'case', 'cases', 'week', 'weeks', 'company', 'companies',
      'system', 'systems', 'program', 'programs', 'question', 'questions', 'work',
      'government', 'governments', 'number', 'numbers', 'night', 'nights', 'point',
      'points', 'home', 'homes', 'water', 'waters', 'room', 'rooms', 'mother',
      'mothers', 'area', 'areas', 'money', 'moneys', 'story', 'stories', 'fact',
      'facts', 'month', 'months', 'lot', 'lots', 'right', 'rights', 'study', 'studies',
      'book', 'books', 'eye', 'eyes', 'job', 'jobs', 'word', 'words', 'business',
      'businesses', 'issue', 'issues', 'side', 'sides', 'kind', 'kinds', 'head',
      'heads', 'house', 'houses', 'service', 'services', 'friend', 'friends',
      'father', 'fathers', 'power', 'powers', 'hour', 'hours', 'game', 'games',
      'line', 'lines', 'end', 'ends', 'member', 'members', 'law', 'laws', 'car',
      'cars', 'city', 'cities', 'community', 'communities', 'name', 'names'
    ]);

    return commonWords.has(word.toLowerCase()) || word.length < 2;
  }

  /**
   * Extract topic/keywords from the query
   */
  extractTopic(query) {
    const topicWords = ['tutorial', 'example', 'guide', 'setup', 'install', 'configure',
                       'api', 'documentation', 'reference', 'getting started', 'usage',
                       'implementation', 'syntax', 'best practices', 'performance',
                       'testing', 'deployment', 'configuration', 'integration'];

    const lowerQuery = query.toLowerCase();
    for (const topic of topicWords) {
      if (lowerQuery.includes(topic)) {
        return topic;
      }
    }

    return null;
  }

  /**
   * Extract potential library name or search term from ANY query
   * This ensures we always have something to search for
   */
  extractSearchTerm(query) {
    const detected = this.detectLibraries(query);
    
    // If library detected, use it
    if (detected.primaryLibrary) {
      return {
        searchTerm: detected.primaryLibrary,
        type: 'library',
        topic: detected.topic,
        confidence: detected.confidence
      };
    }
    
    // Otherwise, extract key technical terms from the query
    // Prioritize words that come AFTER context words (like "explain", "how to")
    const words = query.toLowerCase().split(/\s+/);
    const contextWords = ['explain', 'how', 'to', 'use', 'what', 'is', 'tell', 'me', 'about', 'show', 'me'];
    
    // Find the first word after a context word
    let searchTerm = null;
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i].toLowerCase().replace(/[^\w\-\.]/g, '');
      if (contextWords.includes(word) && i + 1 < words.length) {
        const nextWord = words[i + 1].toLowerCase().replace(/[^\w\-\.]/g, '');
        if (nextWord.length > 2 && 
            !this.isCommonWord(nextWord) && 
            !this.isProgrammingKeyword(nextWord)) {
          searchTerm = nextWord;
          break;
        }
      }
    }
    
    // If no word after context word, find first significant technical term
    if (!searchTerm) {
      const technicalTerms = words.filter(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w\-\.]/g, '');
        return cleanWord.length > 2 && 
               !this.isCommonWord(cleanWord) && 
               !this.isProgrammingKeyword(cleanWord) &&
               /^[a-z0-9\-_]+$/.test(cleanWord);
      });
      
      searchTerm = technicalTerms.length > 0 
        ? technicalTerms[0] 
        : (query.length < 50 ? query.trim() : query.split(/\s+/).slice(0, 3).join(' '));
    }
    
    return {
      searchTerm: searchTerm,
      type: 'general',
      topic: detected.topic,
      confidence: 'medium'
    };
  }

  /**
   * Generate the exact MCP tool calls that the AI assistant should make
   * NOW WORKS FOR ANY QUERY - extracts keywords and searches Context7 docs
   *
   * @param {string} userQuery - The user's query
   * @returns {Object} - MCP tool call instructions
   */
  generateMCPToolCalls(userQuery) {
    const KeywordSearchHandler = require('./keyword-search-handler');
    const keywordHandler = new KeywordSearchHandler();
    
    // Extract keywords from query
    const keywords = keywordHandler.extractKeywords(userQuery);
    const primaryKeyword = keywords[0] || this.extractSearchTerm(userQuery).searchTerm;
    const detected = this.detectLibraries(userQuery);
    const extracted = this.extractSearchTerm(userQuery);

    // Generate tool calls for keyword-based search
    // Use official Context7 MCP tool names with mcp_context7_ prefix
    const searchToolCalls = keywords.slice(0, 3).map((keyword, index) => ({
      tool: 'mcp_context7_resolve-library-id', // Official Context7 MCP tool name (with prefix)
      parameters: {
        libraryName: keyword
      },
      description: `Search Context7 docs list for "${keyword}"`,
      priority: index === 0 ? 'primary' : 'secondary'
    }));

    // Generate doc fetching calls (will use resolved IDs from above)
    const docToolCalls = keywords.slice(0, 3).map((keyword, index) => ({
      tool: 'mcp_context7_get-library-docs', // Official Context7 MCP tool name (with prefix)
      parameters: {
        context7CompatibleLibraryID: `{{resolved_id_from_keyword_${index}}}`,
        topic: extracted.topic || detected.topic || keywordHandler.extractTopic(userQuery),
        tokens: 5000
      },
      description: `Fetch documentation related to "${keyword}"`,
      priority: index === 0 ? 'primary' : 'secondary'
    }));

    // Always generate MCP tool calls for any query
    return {
      shouldUseMCP: true,
      library: primaryKeyword,
      keywords: keywords,
      originalQuery: userQuery,
      topic: extracted.topic || detected.topic || keywordHandler.extractTopic(userQuery),
      confidence: extracted.confidence,
      searchType: 'keyword-based',
      toolCalls: [
        ...searchToolCalls,
        ...docToolCalls
      ],
      instructions: `🔍 AUTOMATIC CONTEXT7 KEYWORD SEARCH REQUIRED

I need to search Context7 documentation using extracted keywords and fetch relevant docs.

**Query**: "${userQuery}"
**Extracted Keywords**: ${keywords.length > 0 ? keywords.join(', ') : primaryKeyword}
**Primary Keyword**: "${primaryKeyword}"

**SEARCH STRATEGY**:
1. Extract keywords from query: ${keywords.join(', ')}
2. Search Context7 docs list for each keyword
3. Resolve library IDs for matching documentation
4. Fetch related docs for each match
5. Use ALL fetched docs as PRIMARY SOURCE

**REQUIRED MCP TOOL CALLS** (execute in order):

**STEP 1: Search Context7 Docs List** (for each keyword):
${searchToolCalls.map((call, i) => `
${i + 1}. Call \`mcp_context7_resolve-library-id\` with:
   - libraryName: "${call.parameters.libraryName}"
   - This searches Context7 docs list for "${call.parameters.libraryName}"
`).join('')}

**STEP 2: Fetch Documentation** (for each resolved ID):
${docToolCalls.map((call, i) => `
${i + 1}. Call \`mcp_context7_get-library-docs\` with:
   - context7CompatibleLibraryID: [use resolved ID from step ${i + 1}]
   ${call.parameters.topic ? `   - topic: "${call.parameters.topic}"` : ''}
   - tokens: 5000
   - This fetches documentation related to "${keywords[i] || primaryKeyword}"
`).join('')}

**CRITICAL INSTRUCTIONS**:
- Use ALL fetched documentation as the PRIMARY SOURCE for your response
- Combine information from multiple docs if multiple keywords matched
- Only use existing knowledge to supplement, not replace, the fetched docs
- If no docs found for a keyword, proceed to the next keyword
- Base your entire response on the fetched Context7 documentation`
    };
  }

  /**
   * Parse query and determine if MCP should be used
   * NOW ALWAYS RETURNS shouldUseMCP: true for automatic fetching
   */
  parseQuery(query) {
    const detected = this.detectLibraries(query);
    const extracted = this.extractSearchTerm(query);

    return {
      library: extracted.searchTerm || detected.primaryLibrary,
      libraries: detected.libraries,
      topic: extracted.topic || detected.topic,
      originalQuery: query,
      shouldUseMCP: true, // Always use MCP for automatic fetching
      confidence: extracted.confidence || detected.confidence,
      searchType: extracted.type
    };
  }

  /**
   * Generate MCP instructions for the AI assistant
   * NOW ALWAYS GENERATES INSTRUCTIONS for automatic fetching
   */
  generateMCPInstructions(userQuery) {
    const toolCalls = this.generateMCPToolCalls(userQuery);
    return toolCalls.instructions;
  }
}

module.exports = Context7MCPHandler;

