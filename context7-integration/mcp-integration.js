/**
 * Context7 MCP Integration for Cursor
 *
 * This module provides a unified interface for using Context7 in Cursor.
 * It supports both MCP (Model Context Protocol) mode and direct API mode.
 *
 * MCP Mode: Uses the Context7 MCP server configured in Cursor (recommended)
 * API Mode: Falls back to direct API calls if MCP is not available
 */

const Context7Query = require('./context7-query');
const Context7MCPHandler = require('./mcp-handler');

class Context7Integration {
  constructor(config = {}) {
    this.config = {
      mode: config.mode || 'mcp', // 'mcp' or 'api'
      ...config
    };

    // Initialize handlers
    this.mcpHandler = new Context7MCPHandler();
    
    // Only initialize API handler if needed
    if (this.config.mode === 'api' || this.config.fallbackToAPI !== false) {
      this.apiHandler = new Context7Query(config);
    }
  }

  /**
   * Get documentation for a library
   * 
   * In MCP mode, this returns instructions for the AI assistant.
   * In API mode, this makes direct API calls.
   * 
   * @param {string} libraryName - Name of the library
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Documentation or instructions
   */
  async getLibraryDocumentation(libraryName, options = {}) {
    if (this.config.mode === 'mcp') {
      // Return MCP instructions for the AI assistant
      const parsed = this.mcpHandler.parseQuery(libraryName);
      const instructions = this.mcpHandler.generateMCPInstructions(libraryName);
      
      return {
        mode: 'mcp',
        instructions: instructions,
        mcpCall: {
          resolveLibraryId: {
            method: 'mcp_context7_resolve-library-id', // Official Context7 MCP tool name (with prefix)
            params: { libraryName: parsed.library || libraryName }
          },
          getLibraryDocs: {
            method: 'mcp_context7_get-library-docs', // Official Context7 MCP tool name (with prefix)
            params: {
              context7CompatibleLibraryID: '{{resolved_library_id}}',
              topic: options.topic || parsed.topic || undefined,
              tokens: options.tokens || 5000
            }
          }
        },
        note: 'The AI assistant should call these MCP tools directly to fetch documentation'
      };
    } else {
      // Fallback to API mode
      if (!this.apiHandler) {
        throw new Error('API handler not initialized. Set mode to "api" or enable fallbackToAPI.');
      }
      
      // Note: Direct API calls would need to be implemented differently
      // as Context7 API structure may differ from MCP
      return await this.apiHandler.queryDocumentation(libraryName);
    }
  }

  /**
   * Check if MCP is available and working
   * 
   * @returns {Object} - Status information
   */
  getMCPStatus() {
    return {
      mcpConfigured: true, // MCP is configured in mcp.json
      mode: this.config.mode,
      handler: 'Context7MCPHandler',
      available: this.mcpHandler.mcpAvailable
    };
  }

  /**
   * Parse a user query to determine if it should use MCP
   * 
   * @param {string} query - User's query
   * @returns {Object} - Parsed query information
   */
  parseQuery(query) {
    return this.mcpHandler.parseQuery(query);
  }

  /**
   * Generate instructions for using MCP based on a query
   * 
   * @param {string} query - User's query
   * @returns {string} - Formatted instructions
   */
  getMCPInstructions(query) {
    return this.mcpHandler.generateMCPInstructions(query);
  }

  /**
   * Unified method to handle queries
   * NOW ALWAYS USES MCP MODE for automatic Context7 fetching
   * 
   * @param {string} query - User's query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object with MCP instructions
   */
  async handleQuery(query, options = {}) {
    const parsed = this.parseQuery(query);
    const toolCalls = this.mcpHandler.generateMCPToolCalls(query);
    
    // Always use MCP mode for automatic fetching
    if (this.config.mode === 'mcp') {
      return {
        mode: 'mcp',
        query: query,
        parsed: parsed,
        toolCalls: toolCalls.toolCalls,
        instructions: toolCalls.instructions,
        searchTerm: toolCalls.library,
        recommendation: '🔍 AUTOMATIC CONTEXT7 FETCH: Call the MCP tools below to fetch latest documentation, then use that documentation as the primary source for your response.',
        requiresMCPCall: true // Flag to indicate AI must call MCP tools
      };
    } else if (this.apiHandler) {
      // Fallback to API mode
      return await this.apiHandler.queryDocumentation(query);
    } else {
      return {
        mode: 'none',
        message: 'No handler available. Please configure MCP or API mode.',
        query: query
      };
    }
  }
}

module.exports = Context7Integration;

