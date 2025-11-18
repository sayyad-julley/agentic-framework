/**
 * Context7 MCP Usage Examples
 *
 * This file demonstrates how to use Context7 MCP in your project.
 * The MCP tools are available to the AI assistant in Cursor.
 */

const Context7Integration = require('./mcp-integration');

/**
 * Example 1: Basic MCP Integration Setup
 */
function example1_BasicSetup() {
  console.log('=== Example 1: Basic MCP Setup ===\n');
  
  const integration = new Context7Integration({ mode: 'mcp' });
  
  // Check MCP status
  const status = integration.getMCPStatus();
  console.log('MCP Status:', JSON.stringify(status, null, 2));
  
  // Parse a query to see if it should use MCP
  const query = 'How do I use React hooks?';
  const parsed = integration.parseQuery(query);
  console.log('\nParsed Query:', JSON.stringify(parsed, null, 2));
  
  // Get MCP instructions
  const instructions = integration.getMCPInstructions(query);
  console.log('\nMCP Instructions:');
  console.log(instructions);
}

/**
 * Example 2: Getting Library Documentation
 */
async function example2_GetLibraryDocs() {
  console.log('\n=== Example 2: Get Library Documentation ===\n');
  
  const integration = new Context7Integration({ mode: 'mcp' });
  
  // Get documentation for a library
  const result = await integration.getLibraryDocumentation('react', {
    topic: 'hooks',
    tokens: 5000
  });
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  // Note: In actual usage, the AI assistant will call the MCP tools directly
  // based on these instructions
}

/**
 * Example 3: Handling User Queries
 */
async function example3_HandleQuery() {
  console.log('\n=== Example 3: Handle User Query ===\n');
  
  const integration = new Context7Integration({ mode: 'mcp' });
  
  const queries = [
    'How do I use Next.js routing?',
    'React useState hook examples',
    'TypeScript interface vs type',
    'What is the weather today?' // Not a library query
  ];
  
  for (const query of queries) {
    console.log(`\nQuery: "${query}"`);
    const result = await integration.handleQuery(query);
    console.log('Response:', JSON.stringify(result, null, 2));
  }
}

/**
 * Example 4: Using MCP Tools Directly (AI Assistant Usage)
 * 
 * This shows what the AI assistant should do when processing queries
 */
function example4_AIAssistantUsage() {
  console.log('\n=== Example 4: AI Assistant MCP Usage ===\n');
  
  console.log(`
When a user asks about a library, the AI assistant should:

1. Parse the query to identify the library name
   Example: "How do I use React hooks?" → library: "react", topic: "hooks"

2. Resolve the library ID using MCP:
   Call: mcp_context7_resolve-library-id
   Parameters: { libraryName: "react" }

3. Get library documentation using MCP:
   Call: mcp_context7_get-library-docs
   Parameters: {
     context7CompatibleLibraryID: "<resolved_id>",
     topic: "hooks",
     tokens: 5000
   }

4. Use the documentation to answer the user's question
  `);
}

/**
 * Example 5: Common Library Queries
 */
function example5_CommonQueries() {
  console.log('\n=== Example 5: Common Library Queries ===\n');
  
  const integration = new Context7Integration({ mode: 'mcp' });
  
  const commonQueries = [
    'React hooks tutorial',
    'Next.js API routes',
    'TypeScript generics',
    'Tailwind CSS responsive design',
    'Ant Design form components',
    'Redux state management',
    'Node.js Express middleware'
  ];
  
  commonQueries.forEach(query => {
    const parsed = integration.parseQuery(query);
    if (parsed.shouldUseMCP) {
      console.log(`Query: "${query}"`);
      console.log(`  → Library: ${parsed.library}`);
      console.log(`  → Topic: ${parsed.topic || 'general'}`);
      console.log(`  → Use MCP: Yes\n`);
    }
  });
}

// Run examples
async function runExamples() {
  try {
    example1_BasicSetup();
    await example2_GetLibraryDocs();
    await example3_HandleQuery();
    example4_AIAssistantUsage();
    example5_CommonQueries();
    
    console.log('\n=== Examples Complete ===\n');
    console.log('Note: MCP tools are called by the AI assistant in Cursor.');
    console.log('The integration provides instructions on which MCP tools to use.\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in other modules
module.exports = {
  example1_BasicSetup,
  example2_GetLibraryDocs,
  example3_HandleQuery,
  example4_AIAssistantUsage,
  example5_CommonQueries,
  runExamples
};

// Run if executed directly
if (require.main === module) {
  runExamples();
}

