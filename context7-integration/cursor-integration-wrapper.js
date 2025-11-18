/**
 * Cursor Integration Wrapper
 * 
 * This wrapper provides a simple interface for integrating Context7
 * into Cursor's query processing pipeline.
 * 
 * Usage in Cursor:
 * 1. Import this module
 * 2. Call preprocessQuery() before processing user queries
 * 3. Inject the returned text into the AI's context
 */

const CursorHandler = require('./cursor-handler');
const autoInject = require('./auto-inject');

// Initialize the handler
const handler = new CursorHandler({ mode: 'mcp' });

/**
 * Pre-process a user query and get context injection
 * Call this BEFORE the AI processes the query
 * 
 * @param {string} userQuery - The user's query
 * @returns {Promise<string>} - Context injection text (add this to AI's context)
 */
async function preprocessQuery(userQuery) {
  try {
    // Use the auto-inject module for clean injection
    const injection = await autoInject.injectContext(userQuery);
    return injection;
  } catch (error) {
    console.error('[CursorIntegration] Error preprocessing query:', error);
    return '';
  }
}

/**
 * Get tool calls for a query (for programmatic access)
 * 
 * @param {string} userQuery - The user's query
 * @returns {Promise<Array>} - Array of tool calls to make
 */
async function getToolCalls(userQuery) {
  try {
    return await autoInject.getToolCalls(userQuery);
  } catch (error) {
    console.error('[CursorIntegration] Error getting tool calls:', error);
    return [];
  }
}

/**
 * Full query processing (legacy method, still supported)
 * 
 * @param {string} userQuery - The user's query
 * @returns {Promise<string>} - Formatted response
 */
async function handleQuery(userQuery) {
  return await handler.handleQuery(userQuery);
}

module.exports = {
  preprocessQuery,
  getToolCalls,
  handleQuery,
  handler,
  autoInject
};

