/**
 * Cursor Handler for Context7 Integration
 *
 * This module provides the main interface for Cursor to use Context7
 * documentation fetching functionality.
 * 
 * Supports both MCP (Model Context Protocol) mode and direct API mode.
 * MCP mode is recommended when Context7 MCP is configured in Cursor.
 */

const Context7Query = require('./context7-query');
const Context7Integration = require('./mcp-integration');
const QueryPreProcessor = require('./query-preprocessor');

class CursorHandler {
  constructor(config = {}) {
    this.config = {
      mode: config.mode || 'mcp', // 'mcp' or 'api'
      cacheEnabled: config.cacheEnabled !== false,
      fallbackEnabled: config.fallbackEnabled !== false,
      ...config
    };

    // Initialize appropriate handler based on mode
    if (this.config.mode === 'mcp') {
      this.integration = new Context7Integration({ mode: 'mcp', ...config });
      this.context7 = null; // Not used in MCP mode
      this.preprocessor = new QueryPreProcessor(); // For pre-processing queries
    } else {
      this.context7 = new Context7Query(config);
      this.integration = null; // Not used in API mode
      this.preprocessor = null;
    }
  }

  /**
   * Pre-process query and get context injection text
   * This should be called BEFORE the query reaches the AI
   * 
   * @param {string} userQuery - The user's query
   * @returns {Promise<string>} - Context injection text to add to AI's context
   */
  async preprocessQuery(userQuery) {
    if (this.preprocessor) {
      const preprocessed = await this.preprocessor.preprocessQuery(userQuery);
      return preprocessed.contextInjection || '';
    }
    return '';
  }

  /**
   * Main method to handle user queries from Cursor
   * NOW AUTOMATICALLY CALLS CONTEXT7 MCP FOR ANY QUERY
   * @param {string} userQuery - The user's query
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Formatted response string with MCP instructions
   */
  async handleQuery(userQuery, options = {}) {
    try {
      console.log(`[CursorHandler] Processing query: "${userQuery}" (mode: ${this.config.mode})`);
      console.log(`[CursorHandler] Automatic Context7 MCP fetching enabled for all queries`);

      // Use MCP mode if configured (now always enabled for automatic fetching)
      if (this.config.mode === 'mcp' && this.integration) {
        const result = await this.integration.handleQuery(userQuery, options);
        
        if (result.mode === 'mcp' && result.requiresMCPCall) {
          // Format comprehensive MCP instructions for automatic fetching
          const formattedResponse = this.formatMCPInstructions(result, userQuery);
          console.log(`[CursorHandler] Generated MCP tool calls for automatic Context7 fetch`);
          return formattedResponse;
        } else if (result.mode === 'api' && this.context7) {
          // Fallback to API mode
          return this.context7.formatResponse(result);
        }
      }

      // Use API mode (legacy fallback)
      if (this.context7) {
        // Check cache first if enabled
        if (this.config.cacheEnabled && options.skipCache !== true) {
          const cachedResult = this.context7.getCachedResult(userQuery);
          if (cachedResult) {
            console.log('[CursorHandler] Returning cached result');
            return this.context7.formatResponse(cachedResult);
          }
        }

        // Query Context7 for relevant documentation
        const result = await this.context7.queryDocumentation(userQuery);

        // Cache the result if enabled
        if (this.config.cacheEnabled) {
          this.context7.cacheResult(userQuery, result);
        }

        // Format and return the response
        const response = this.context7.formatResponse(result);

        console.log(`[CursorHandler] Response: ${result.success ? 'Success' : 'No docs found'}`);
        return response;
      }

      throw new Error('No handler available. Please configure MCP or API mode.');

    } catch (error) {
      console.error('[CursorHandler] Error handling query:', error);

      if (this.config.fallbackEnabled) {
        return 'Error occurred while fetching documentation. Please try again later.';
      } else {
        throw error;
      }
    }
  }

  /**
   * Format MCP instructions in a clear, actionable way
   * Makes it very clear that the AI should call the MCP tools
   */
  formatMCPInstructions(result, userQuery) {
    const { toolCalls, instructions, searchTerm, recommendation } = result;
    
    let formatted = `\n${'='.repeat(80)}\n`;
    formatted += `🔍 AUTOMATIC CONTEXT7 DOCUMENTATION FETCH\n`;
    formatted += `${'='.repeat(80)}\n\n`;
    formatted += `**User Query**: "${userQuery}"\n`;
    formatted += `**Search Term**: "${searchTerm}"\n\n`;
    formatted += `${recommendation}\n\n`;
    formatted += `${instructions}\n\n`;
    
    if (toolCalls && toolCalls.length > 0) {
      formatted += `**MCP TOOL CALLS TO EXECUTE**:\n\n`;
      toolCalls.forEach((call, index) => {
        formatted += `${index + 1}. **${call.tool}**\n`;
        formatted += `   Parameters:\n`;
        Object.entries(call.parameters).forEach(([key, value]) => {
          formatted += `   - ${key}: ${JSON.stringify(value)}\n`;
        });
        formatted += `   Description: ${call.description}\n\n`;
      });
    }
    
    formatted += `\n${'='.repeat(80)}\n`;
    formatted += `⚠️ IMPORTANT: You MUST call these MCP tools NOW to fetch the documentation.\n`;
    formatted += `After fetching, use the retrieved documentation as the PRIMARY SOURCE for your response.\n`;
    formatted += `${'='.repeat(80)}\n`;
    
    return formatted;
  }

  /**
   * Batch query for multiple related queries
   * @param {Array<string>} queries - Array of queries
   * @param {Object} options - Additional options
   * @returns {Promise<Array<string>>} - Array of responses
   */
  async handleBatchQuery(queries, options = {}) {
    const results = [];

    for (const query of queries) {
      try {
        const response = await this.handleQuery(query, options);
        results.push({
          query,
          response,
          success: true
        });
      } catch (error) {
        results.push({
          query,
          response: `Error processing query: ${error.message}`,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Health check method to verify Context7 integration is working
   * @returns {Promise<Object>} - Health status object
   */
  async healthCheck() {
    try {
      if (this.config.mode === 'mcp' && this.integration) {
        const mcpStatus = this.integration.getMCPStatus();
        return {
          status: 'healthy',
          mode: 'mcp',
          mcpConfigured: mcpStatus.mcpConfigured,
          message: 'Context7 MCP integration is configured',
          ...mcpStatus
        };
      } else if (this.context7) {
        const testQuery = 'test query';
        const result = await this.context7.queryDocumentation(testQuery);

        return {
          status: 'healthy',
          mode: 'api',
          context7Api: 'connected',
          message: 'Context7 API integration is working properly',
          testResult: result.success
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'No handler configured',
          error: 'Please configure MCP or API mode'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        mode: this.config.mode,
        message: 'Context7 integration is not working',
        error: error.message
      };
    }
  }

  /**
   * Get statistics about the cache and usage
   * @returns {Object} - Statistics object
   */
  getStats() {
    const fs = require('fs');
    const path = require('path');

    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        return {
          cacheSize: 0,
          cacheFiles: 0,
          oldestEntry: null,
          newestEntry: null
        };
      }

      const cacheFiles = fs.readdirSync(cacheDir).filter(file => file.endsWith('.json'));
      let oldestTime = Date.now();
      let newestTime = 0;
      let totalSize = 0;

      cacheFiles.forEach(file => {
        const filePath = path.join(cacheDir, file);
        const stats = fs.statSync(filePath);
        oldestTime = Math.min(oldestTime, stats.mtime.getTime());
        newestTime = Math.max(newestTime, stats.mtime.getTime());
        totalSize += stats.size;
      });

      return {
        cacheSize: totalSize,
        cacheFiles: cacheFiles.length,
        oldestEntry: cacheFiles.length > 0 ? new Date(oldestTime).toISOString() : null,
        newestEntry: cacheFiles.length > 0 ? new Date(newestTime).toISOString() : null
      };
    } catch (error) {
      return {
        error: `Failed to get stats: ${error.message}`
      };
    }
  }

  /**
   * Clear the cache
   * @returns {Promise<boolean>} - Success status
   */
  async clearCache() {
    const fs = require('fs');
    const path = require('path');

    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (fs.existsSync(cacheDir)) {
        const cacheFiles = fs.readdirSync(cacheDir);
        for (const file of cacheFiles) {
          fs.unlinkSync(path.join(cacheDir, file));
        }
      }
      return true;
    } catch (error) {
      console.error('[CursorHandler] Error clearing cache:', error);
      return false;
    }
  }
}

module.exports = CursorHandler;