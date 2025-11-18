/**
 * Auto-Injection Module for Context7
 * 
 * This module automatically injects Context7 MCP instructions into the AI's context
 * by pre-processing queries and generating injectable context text.
 * 
 * This should be integrated into Cursor's query processing pipeline.
 */

const QueryPreProcessor = require('./query-preprocessor');

class Context7AutoInject {
  constructor() {
    this.preprocessor = new QueryPreProcessor();
    this.enabled = true;
  }

  /**
   * Process a user query and return context injection text
   * This should be called BEFORE the query reaches the AI
   * 
   * @param {string} userQuery - The user's query
   * @returns {Promise<string>} - Context injection text (empty string if none needed)
   */
  async injectContext(userQuery) {
    if (!this.enabled || !userQuery || userQuery.trim().length === 0) {
      return '';
    }

    try {
      const preprocessed = await this.preprocessor.preprocessQuery(userQuery);
      
      if (preprocessed.shouldFetchDocs && preprocessed.contextInjection) {
        console.log(`[Context7AutoInject] Injecting context for query: "${userQuery}"`);
        console.log(`[Context7AutoInject] Search term: "${preprocessed.searchTerm}"`);
        return preprocessed.contextInjection;
      }
      
      return '';
    } catch (error) {
      console.error('[Context7AutoInject] Error injecting context:', error);
      return '';
    }
  }

  /**
   * Get the tool calls that should be made for a query
   * Useful for programmatic access
   */
  async getToolCalls(userQuery) {
    try {
      const preprocessed = await this.preprocessor.preprocessQuery(userQuery);
      return preprocessed.toolCalls || [];
    } catch (error) {
      console.error('[Context7AutoInject] Error getting tool calls:', error);
      return [];
    }
  }

  /**
   * Enable or disable auto-injection
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`[Context7AutoInject] Auto-injection ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Singleton instance
const autoInject = new Context7AutoInject();

module.exports = autoInject;
module.exports.Context7AutoInject = Context7AutoInject;

