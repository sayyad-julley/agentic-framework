/**
 * Query Pre-Processor for Context7 Integration
 * 
 * This module pre-processes user queries BEFORE the AI sees them,
 * generates Context7 MCP tool call instructions, and injects them
 * into the AI's context automatically.
 * 
 * Usage: This should be called automatically when a user query is received.
 */

const Context7MCPHandler = require('./mcp-handler');

class QueryPreProcessor {
  constructor() {
    this.mcpHandler = new Context7MCPHandler();
  }

  /**
   * Pre-process a user query and generate Context7 MCP instructions
   * This runs BEFORE the AI sees the query
   * 
   * @param {string} userQuery - The user's query
   * @returns {Object} - Pre-processed query with Context7 instructions
   */
  async preprocessQuery(userQuery) {
    try {
      // Generate MCP tool calls for the query
      const mcpToolCalls = this.mcpHandler.generateMCPToolCalls(userQuery);

      // Generate the context injection text
      const contextInjection = this.generateContextInjection(userQuery, mcpToolCalls);

      return {
        originalQuery: userQuery,
        searchTerm: mcpToolCalls.library,
        toolCalls: mcpToolCalls.toolCalls,
        contextInjection: contextInjection,
        shouldFetchDocs: mcpToolCalls.shouldUseMCP,
        instructions: mcpToolCalls.instructions
      };
    } catch (error) {
      console.error('[QueryPreProcessor] Error preprocessing query:', error);
      return {
        originalQuery: userQuery,
        contextInjection: this.generateFallbackInjection(userQuery),
        shouldFetchDocs: false
      };
    }
  }

  /**
   * Generate context injection text that will be added to AI's context
   * This text instructs the AI to call Context7 MCP tools
   */
  generateContextInjection(userQuery, mcpToolCalls) {
    if (!mcpToolCalls.shouldUseMCP) {
      return null; // No injection needed
    }

    const { toolCalls, library, topic } = mcpToolCalls;

    let injection = `\n`;
    injection += `╔══════════════════════════════════════════════════════════════════════════════╗\n`;
    injection += `║                    CONTEXT7 DOCUMENTATION FETCH REQUIRED                    ║\n`;
    injection += `╚══════════════════════════════════════════════════════════════════════════════╝\n\n`;
    injection += `**AUTOMATIC INSTRUCTION**: Before answering the user's query, you MUST fetch the latest documentation from Context7 using the MCP tools below.\n\n`;
    injection += `**User Query**: "${userQuery}"\n`;
    injection += `**Detected Search Term**: "${library}"\n`;
    if (topic) {
      injection += `**Topic**: "${topic}"\n`;
    }
    injection += `\n`;
    injection += `**REQUIRED ACTIONS** (execute these NOW, before responding):\n\n`;

    toolCalls.forEach((call, index) => {
      injection += `${index + 1}. **CALL MCP TOOL**: \`${call.tool}\`\n`;
      injection += `   **Parameters**:\n`;
      Object.entries(call.parameters).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('{{')) {
          injection += `   - ${key}: [Use result from previous step]\n`;
        } else {
          injection += `   - ${key}: ${JSON.stringify(value)}\n`;
        }
      });
      injection += `   **Description**: ${call.description}\n\n`;
    });

    injection += `**CRITICAL**:\n`;
    injection += `1. Call the MCP tools above IMMEDIATELY (do not skip this step)\n`;
    injection += `2. Use the fetched documentation as the PRIMARY SOURCE for your response\n`;
    injection += `3. Only use your existing knowledge to supplement, not replace, the fetched docs\n`;
    injection += `4. If documentation is found, base your entire response on it\n`;
    injection += `5. If no docs found, you may use your existing knowledge\n\n`;
    injection += `╔══════════════════════════════════════════════════════════════════════════════╗\n`;
    injection += `║                         END CONTEXT7 INSTRUCTIONS                           ║\n`;
    injection += `╚══════════════════════════════════════════════════════════════════════════════╝\n\n`;

    return injection;
  }

  /**
   * Generate fallback injection if preprocessing fails
   */
  generateFallbackInjection(userQuery) {
    return `\n**Note**: Context7 pre-processing encountered an error. You may proceed with your response.\n\n`;
  }

  /**
   * Get a simplified version for .cursorrules injection
   */
  getSimplifiedInstructions(userQuery) {
    const mcpToolCalls = this.mcpHandler.generateMCPToolCalls(userQuery);
    
    if (!mcpToolCalls.shouldUseMCP) {
      return null;
    }

    return {
      searchTerm: mcpToolCalls.library,
      tool1: {
        name: mcpToolCalls.toolCalls[0].tool,
        params: mcpToolCalls.toolCalls[0].parameters
      },
      tool2: {
        name: mcpToolCalls.toolCalls[1].tool,
        params: mcpToolCalls.toolCalls[1].parameters
      }
    };
  }
}

module.exports = QueryPreProcessor;

