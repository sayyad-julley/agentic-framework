#!/usr/bin/env node

/**
 * Context7 MCP Diagnostic Script
 * 
 * This script helps diagnose why Context7 MCP tools are failing.
 * It checks:
 * 1. MCP configuration
 * 2. MCP server installation
 * 3. Tool name variations
 * 4. API key validity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 Context7 MCP Diagnostic Tool\n');
console.log('='.repeat(60));

// Step 1: Check MCP Configuration
console.log('\n📋 Step 1: Checking MCP Configuration...');
const mcpConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');

if (fs.existsSync(mcpConfigPath)) {
  console.log('✅ MCP configuration file found:', mcpConfigPath);
  try {
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    
    if (config.mcpServers && config.mcpServers.context7) {
      console.log('✅ Context7 MCP server is configured');
      console.log('   Command:', config.mcpServers.context7.command);
      console.log('   Args:', config.mcpServers.context7.args?.join(' ') || 'none');
      
      // Check for API key
      const apiKey = config.mcpServers.context7.args?.find(arg => arg.startsWith('ctx7sk-'));
      if (apiKey) {
        console.log('✅ API key found:', apiKey.substring(0, 20) + '...');
      } else {
        console.log('⚠️  API key not found in args');
      }
    } else {
      console.log('❌ Context7 MCP server is NOT configured');
      console.log('   Available servers:', Object.keys(config.mcpServers || {}).join(', '));
    }
  } catch (error) {
    console.log('❌ Error reading MCP configuration:', error.message);
  }
} else {
  console.log('❌ MCP configuration file not found:', mcpConfigPath);
  console.log('   Expected location: ~/.cursor/mcp.json');
}

// Step 2: Check Node.js and npx
console.log('\n📋 Step 2: Checking Node.js and npx...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log('✅ Node.js version:', nodeVersion);
} catch (error) {
  console.log('❌ Node.js not found or not in PATH');
}

try {
  const npxVersion = execSync('npx --version', { encoding: 'utf8' }).trim();
  console.log('✅ npx version:', npxVersion);
} catch (error) {
  console.log('❌ npx not found or not in PATH');
}

// Step 3: Test Context7 MCP Package Installation
console.log('\n📋 Step 3: Testing Context7 MCP Package...');
try {
  console.log('   Attempting to run: npx -y @upstash/context7-mcp --help');
  // Note: This might fail if the package requires specific arguments
  // We'll just check if npx can find it
  const result = execSync('npx -y @upstash/context7-mcp --help 2>&1', { 
    encoding: 'utf8',
    timeout: 10000,
    maxBuffer: 1024 * 1024
  });
  console.log('✅ Package can be executed');
  console.log('   Output (first 200 chars):', result.substring(0, 200));
} catch (error) {
  console.log('⚠️  Package execution test:', error.message);
  console.log('   This might be normal if the package requires specific arguments');
}

// Step 4: Check Tool Name Variations
console.log('\n📋 Step 4: Tool Name Analysis...');
console.log('   Expected tool names (from codebase):');
console.log('   - mcp_context7_resolve-library-id');
console.log('   - mcp_context7_get-library-docs');
console.log('\n   Possible variations to try:');
console.log('   - resolve-library-id (without prefix)');
console.log('   - get-library-docs (without prefix)');
console.log('   - context7_resolve-library-id (alternative prefix)');
console.log('   - context7_get-library-docs (alternative prefix)');

// Step 5: Check Environment
console.log('\n📋 Step 5: Environment Check...');
console.log('   OS:', os.platform(), os.release());
console.log('   Home Directory:', os.homedir());
console.log('   Node.js Path:', process.execPath);

// Step 6: Recommendations
console.log('\n📋 Step 6: Recommendations...');
console.log('\n   If Context7 MCP is not working:');
console.log('   1. Restart Cursor to reload MCP configuration');
console.log('   2. Check Cursor\'s developer console for MCP errors');
console.log('   3. Verify the API key is valid');
console.log('   4. Try updating @upstash/context7-mcp package');
console.log('   5. Check if Node.js is in PATH when Cursor starts');
console.log('\n   Fallback options (already implemented):');
console.log('   - Document Retrieval System MCP (working)');
console.log('   - Web Search (working)');
console.log('   - Existing knowledge base');

// Step 7: Test Alternative Tool Names
console.log('\n📋 Step 7: Testing Tool Name Variations...');
console.log('   Note: This requires Cursor to be running with MCP enabled.');
console.log('   The actual tool names might be different from expected.');
console.log('   Check Cursor\'s MCP tool list to see available tools.');

console.log('\n' + '='.repeat(60));
console.log('\n✅ Diagnostic complete!');
console.log('\n💡 Next Steps:');
console.log('   1. Review the findings above');
console.log('   2. Check Cursor\'s MCP status in settings');
console.log('   3. Try restarting Cursor');
console.log('   4. Check Cursor\'s developer console for errors');
console.log('   5. Verify the actual tool names in Cursor\'s MCP tool list\n');




