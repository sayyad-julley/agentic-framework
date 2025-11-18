#!/usr/bin/env node

/**
 * CLI Interface for Context7 Cursor Integration
 */

const readline = require('readline');
const CursorHandler = require('./cursor-handler');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize handler
const handler = new CursorHandler();

function showHelp() {
  console.log(`
Context7 Cursor Integration CLI
================================

Commands:
  <query>                 - Search for documentation
  :help                   - Show this help message
  :health                 - Check system health
  :stats                  - Show cache statistics
  :clear-cache            - Clear the cache
  :quit, :exit            - Exit the CLI

Examples:
  How do I implement authentication?
  React hooks tutorial
  JavaScript array methods
`);
}

async function handleCommand(input) {
  const trimmedInput = input.trim();

  // Handle special commands
  if (trimmedInput.startsWith(':')) {
    const command = trimmedInput.toLowerCase();

    switch (command) {
      case ':help':
        showHelp();
        return;

      case ':health':
        console.log('Checking system health...');
        const health = await handler.healthCheck();
        console.log(JSON.stringify(health, null, 2));
        return;

      case ':stats':
        const stats = handler.getStats();
        console.log('Cache Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        return;

      case ':clear-cache':
        console.log('Clearing cache...');
        const cleared = await handler.clearCache();
        console.log('Cache cleared:', cleared);
        return;

      case ':quit':
      case ':exit':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        return;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Type :help for available commands');
        return;
    }
  }

  // Handle regular queries
  if (trimmedInput) {
    console.log('🔍 Searching Context7...');
    try {
      const response = await handler.handleQuery(trimmedInput);
      console.log('\n' + '='.repeat(50));
      console.log(response);
      console.log('='.repeat(50) + '\n');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Show prompt again
  showPrompt();
}

function showPrompt() {
  process.stdout.write('\nEnter your query (or :help for commands): ');
}

// Main program
async function main() {
  console.log('🚀 Context7 Cursor Integration CLI');
  console.log('==================================\n');

  // Check health on startup
  try {
    const health = await handler.healthCheck();
    if (health.status === 'healthy') {
      console.log('✅ Context7 integration is ready');
    } else {
      console.log('⚠️  Context7 integration may have issues');
      console.log('Health status:', health);
    }
  } catch (error) {
    console.log('⚠️  Could not verify Context7 integration:', error.message);
  }

  console.log('');
  showHelp();

  // Start interactive mode
  showPrompt();

  rl.on('line', handleCommand);

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });

  // Handle Ctrl+C
  rl.on('SIGINT', () => {
    console.log('\n\nUse :quit to exit or Ctrl+C again to force quit');
  });
}

// Handle command line arguments
if (process.argv.length > 2) {
  // Non-interactive mode
  const query = process.argv.slice(2).join(' ');
  handler.handleQuery(query)
    .then(response => {
      console.log(response);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
} else {
  // Interactive mode
  main().catch(error => {
    console.error('Startup error:', error);
    process.exit(1);
  });
}