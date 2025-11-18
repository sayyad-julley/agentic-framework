/**
 * Test Suite for Context7 Cursor Integration
 */

const CursorHandler = require('../cursor-handler');

async function runTests() {
  console.log('🚀 Starting Context7 Integration Tests...\n');

  const handler = new CursorHandler({
    timeout: 5000,
    maxResults: 3
  });

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  try {
    const health = await handler.healthCheck();
    console.log('Health Status:', JSON.stringify(health, null, 2));
    console.log('✅ Health check completed\n');
  } catch (error) {
    console.error('❌ Health check failed:', error.message, '\n');
  }

  // Test 2: Basic Query
  console.log('🔍 Test 2: Basic Query');
  try {
    const response = await handler.handleQuery('How to create React components?');
    console.log('Response:', response);
    console.log('✅ Basic query completed\n');
  } catch (error) {
    console.error('❌ Basic query failed:', error.message, '\n');
  }

  // Test 3: Query with no expected results
  console.log('🔍 Test 3: Query with no expected results');
  try {
    const response = await handler.handleQuery('xyz123abc456def789');
    console.log('Response:', response);
    console.log('✅ No-results query completed\n');
  } catch (error) {
    console.error('❌ No-results query failed:', error.message, '\n');
  }

  // Test 4: Batch Query
  console.log('📦 Test 4: Batch Query');
  try {
    const queries = [
      'React hooks usage',
      'JavaScript array methods',
      'CSS grid layout'
    ];
    const results = await handler.handleBatchQuery(queries);
    results.forEach((result, index) => {
      console.log(`Batch ${index + 1}: ${result.query}`);
      console.log(`Success: ${result.success}`);
      console.log(`Response: ${result.response.substring(0, 100)}...\n`);
    });
    console.log('✅ Batch query completed\n');
  } catch (error) {
    console.error('❌ Batch query failed:', error.message, '\n');
  }

  // Test 5: Cache Test
  console.log('💾 Test 5: Cache Functionality');
  try {
    const query = 'Test cache functionality';

    // First query (should hit API)
    console.log('First query (API):');
    const start1 = Date.now();
    const response1 = await handler.handleQuery(query);
    const time1 = Date.now() - start1;
    console.log(`Time: ${time1}ms, Response: ${response1.substring(0, 100)}...\n`);

    // Second query (should hit cache)
    console.log('Second query (Cache):');
    const start2 = Date.now();
    const response2 = await handler.handleQuery(query);
    const time2 = Date.now() - start2;
    console.log(`Time: ${time2}ms, Response: ${response2.substring(0, 100)}...\n`);
    console.log(`Cache speedup: ${time1 > time2 ? time1 - time2 : 0}ms`);
    console.log('✅ Cache test completed\n');
  } catch (error) {
    console.error('❌ Cache test failed:', error.message, '\n');
  }

  // Test 6: Statistics
  console.log('📊 Test 6: Statistics');
  try {
    const stats = handler.getStats();
    console.log('Statistics:', JSON.stringify(stats, null, 2));
    console.log('✅ Statistics retrieved\n');
  } catch (error) {
    console.error('❌ Statistics failed:', error.message, '\n');
  }

  // Test 7: Clear Cache
  console.log('🧹 Test 7: Clear Cache');
  try {
    const cleared = await handler.clearCache();
    console.log('Cache cleared:', cleared);
    console.log('✅ Cache clear completed\n');
  } catch (error) {
    console.error('❌ Cache clear failed:', error.message, '\n');
  }

  console.log('🏁 All tests completed!');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };