/**
 * Example: How to integrate Context7 with Cursor
 *
 * This file demonstrates how to use the Context7 integration in a Cursor environment.
 * When a user hits a query in Cursor, it will first try to fetch relevant docs from Context7.
 */

const CursorHandler = require('./cursor-handler');

// Initialize the Context7 handler
const context7Handler = new CursorHandler({
  timeout: 10000,
  maxResults: 5,
  cacheEnabled: true
});

/**
 * Main function to handle user queries from Cursor
 * This is the function that would be called when a user submits a query in Cursor
 */
async function handleCursorQuery(userQuery) {
  console.log(`\n🔍 User Query: "${userQuery}"`);
  console.log('📚 Checking Context7 for relevant documentation...\n');

  try {
    // Step 1: Query Context7 for relevant documentation
    const context7Response = await context7Handler.handleQuery(userQuery);

    // Step 2: Check if relevant docs were found
    if (context7Response.includes('No docs found in context7') || context7Response.includes('Error querying documentation service')) {
      // No docs found - this would be the response to the user
      console.log('❌ Response: No docs found in context7');
      return 'No docs found in context7';
    } else {
      // Docs found - display them to the user
      console.log('✅ Response: Found relevant documentation');
      console.log('📄 Documentation Preview:');
      console.log(context7Response);
      return context7Response;
    }
  } catch (error) {
    console.error('❌ Error handling query:', error.message);
    return 'Error occurred while processing your query.';
  }
}

/**
 * Example usage - simulating different user queries
 */
async function demonstrateUsage() {
  console.log('🚀 Context7 Cursor Integration Demonstration');
  console.log('='.repeat(50));

  // Example 1: Query with expected documentation
  console.log('\n--- Example 1: React Hooks Query ---');
  await handleCursorQuery('How do I use useState hook in React?');

  // Example 2: Query with no expected documentation
  console.log('\n--- Example 2: Random Query ---');
  await handleCursorQuery('xyz123 random text with no docs');

  // Example 3: JavaScript query
  console.log('\n--- Example 3: JavaScript Array Methods ---');
  await handleCursorQuery('JavaScript map vs forEach');

  // Example 4: CSS query
  console.log('\n--- Example 4: CSS Flexbox ---');
  await handleCursorQuery('CSS flexbox center items');

  console.log('\n🎉 Demonstration completed!');
  console.log('\n💡 In a real Cursor integration, this function would be called');
  console.log('   automatically whenever a user submits a query.');
}

// Export for use in Cursor integration
module.exports = {
  handleCursorQuery,
  context7Handler
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}