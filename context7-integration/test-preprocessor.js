/**
 * Test script for query pre-processor
 * 
 * Run: node test-preprocessor.js
 */

const { preprocessQuery, getToolCalls } = require('./cursor-integration-wrapper');

async function testPreprocessor() {
  console.log('🧪 Testing Query Pre-Processor\n');
  console.log('='.repeat(80));

  const testQueries = [
    'explain redis',
    'how to use react hooks',
    'what is state management',
    'typescript best practices'
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('-'.repeat(80));

    // Test preprocessQuery
    const injection = await preprocessQuery(query);
    
    if (injection) {
      console.log('✅ Context injection generated');
      console.log(`📏 Length: ${injection.length} characters`);
      console.log('📄 Preview (first 300 chars):');
      console.log(injection.substring(0, 300) + '...\n');
    } else {
      console.log('⚠️  No context injection generated\n');
    }

    // Test getToolCalls
    const toolCalls = await getToolCalls(query);
    if (toolCalls && toolCalls.length > 0) {
      console.log('🔧 Tool calls:');
      toolCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.tool}`);
        console.log(`      Params: ${JSON.stringify(call.parameters)}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('\n✅ Pre-processor test complete!');
}

// Run tests
testPreprocessor().catch(console.error);

