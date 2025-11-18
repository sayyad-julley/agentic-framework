/**
 * Test script for keyword-based Context7 search
 */

const KeywordSearchHandler = require('./keyword-search-handler');
const Context7MCPHandler = require('./mcp-handler');

console.log('🧪 Testing Keyword-Based Context7 Search\n');

// Test queries
const testQueries = [
  'explain react hooks',
  'how to use redis caching',
  'what is state management in react',
  'async await javascript',
  'next.js api routes',
  'typescript interface vs type',
  'tailwind css responsive design'
];

const keywordHandler = new KeywordSearchHandler();
const mcpHandler = new Context7MCPHandler();

testQueries.forEach((query, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: "${query}"`);
  console.log('='.repeat(60));
  
  // Extract keywords
  const keywords = keywordHandler.extractKeywords(query);
  console.log(`\n📝 Extracted Keywords:`, keywords);
  
  // Generate tool calls
  const toolCalls = mcpHandler.generateMCPToolCalls(query);
  console.log(`\n🔍 Primary Keyword:`, toolCalls.library);
  console.log(`\n📋 Tool Calls Generated:`, toolCalls.toolCalls.length);
  
  // Show search tool calls
  const searchCalls = toolCalls.toolCalls.filter(call => call.tool === 'mcp_context7_resolve-library-id');
  console.log(`\n🔎 Search Calls (mcp_context7_resolve-library-id):`);
  searchCalls.forEach((call, i) => {
    console.log(`  ${i + 1}. libraryName: "${call.parameters.libraryName}"`);
  });
  
  // Show doc fetch calls
  const docCalls = toolCalls.toolCalls.filter(call => call.tool === 'mcp_context7_get-library-docs');
  console.log(`\n📚 Doc Fetch Calls (mcp_context7_get-library-docs):`);
  docCalls.forEach((call, i) => {
    console.log(`  ${i + 1}. context7CompatibleLibraryID: ${call.parameters.context7CompatibleLibraryID}`);
    console.log(`     topic: ${call.parameters.topic || 'null'}`);
    console.log(`     tokens: ${call.parameters.tokens}`);
  });
});

console.log(`\n\n✅ Keyword extraction and tool call generation test complete!`);
console.log(`\n💡 The system will now:`);
console.log(`   1. Extract keywords from any query`);
console.log(`   2. Search Context7 docs list for each keyword`);
console.log(`   3. Fetch related documentation`);
console.log(`   4. Use fetched docs as PRIMARY SOURCE for responses\n`);

