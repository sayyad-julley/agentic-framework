# Context7 Integration for Cursor

This module provides seamless integration between Cursor and Context7, allowing users to automatically fetch relevant documentation based on their queries.

## Features

- **🔄 AUTOMATIC Context7 MCP Integration**: **Automatically calls Context7 MCP tools for ANY user query** to fetch latest documentation
- **📚 Universal Query Support**: Works with any query - library-specific, general technical questions, or programming topics
- **🎯 Smart Search Term Extraction**: Automatically extracts relevant search terms from any query, even if no library is explicitly mentioned
- **⚡ Always-On Documentation Fetching**: Every query triggers Context7 MCP tool calls to ensure responses use the latest documentation
- **MCP (Model Context Protocol) Integration**: Uses Context7 MCP server configured in Cursor (recommended)
- **Direct API Mode**: Fallback to direct API calls when MCP is not available
- **Intelligent Caching**: Caches results to improve response times for repeated queries (API mode only)
- **Fallback Handling**: Gracefully handles API failures with appropriate error messages
- **Batch Query Support**: Process multiple related queries efficiently
- **Health Monitoring**: Built-in health checks to ensure the integration is working properly

## Installation

### MCP Mode (Recommended)

1. Ensure Node.js 14+ is installed
2. Configure Context7 MCP in Cursor's `mcp.json`:
   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp", "--api-key", "your_api_key_here"]
       }
     }
   }
   ```
3. The integration will automatically use MCP mode when available

### API Mode (Legacy)

1. Ensure Node.js 14+ is installed
2. Set up your Context7 API key as an environment variable:
   ```bash
   export CONTEXT7_API_KEY=your_api_key_here
   ```
3. Initialize the handler with `mode: 'api'`

## Usage

### MCP Mode (Recommended) - AUTOMATIC FETCHING

When Context7 MCP is configured in Cursor, the integration **automatically calls Context7 MCP tools for EVERY query**:

```javascript
const CursorHandler = require('./cursor-handler');

// Initialize with MCP mode (default) - automatic fetching enabled
const handler = new CursorHandler({ mode: 'mcp' });

// Handle ANY user query - Context7 MCP tools are automatically called
async function processQuery() {
  // This will automatically trigger Context7 MCP tool calls
  const response = await handler.handleQuery('How do I use React hooks?');
  
  // Works with any query, not just library-specific ones
  const response2 = await handler.handleQuery('explain redis');
  const response3 = await handler.handleQuery('what is state management');
  
  // The response contains formatted instructions for the AI to call MCP tools
  // The AI assistant will automatically fetch docs and use them for the response
  console.log(response);
}

processQuery();
```

### Using MCP Integration Directly

```javascript
const Context7Integration = require('./mcp-integration');

const integration = new Context7Integration({ mode: 'mcp' });

// Parse a query to see if it should use MCP
const parsed = integration.parseQuery('How do I use Next.js routing?');
console.log('Library:', parsed.library); // 'next.js'
console.log('Topic:', parsed.topic);     // 'routing'

// Get MCP instructions for the AI assistant
const instructions = integration.getMCPInstructions('React hooks tutorial');
console.log(instructions);

// Get library documentation (returns MCP call instructions)
const result = await integration.getLibraryDocumentation('react', {
  topic: 'hooks',
  tokens: 5000
});
```

### API Mode (Legacy)

```javascript
const CursorHandler = require('./cursor-handler');

// Initialize with API mode
const handler = new CursorHandler({ mode: 'api' });

// Handle a user query
async function processQuery() {
  const response = await handler.handleQuery('How do I implement user authentication?');
  console.log(response);
}

processQuery();
```

### Advanced Usage with Custom Configuration

```javascript
const CursorHandler = require('./cursor-handler');

const handler = new CursorHandler({
  mode: 'mcp', // or 'api'
  apiUrl: 'https://your-context7-instance.com', // API mode only
  timeout: 15000, // API mode only
  maxResults: 10, // API mode only
  cacheEnabled: true, // API mode only
  fallbackEnabled: true
});

const response = await handler.handleQuery('React hooks tutorial');
```

### Batch Query Processing

```javascript
const queries = [
  'How to use useState hook',
  'React component lifecycle',
  'Props vs state'
];

const results = await handler.handleBatchQuery(queries);
results.forEach(result => {
  console.log(`Query: ${result.query}`);
  console.log(`Response: ${result.response}`);
  console.log('---');
});
```

## API Reference

### CursorHandler

#### Constructor Options

- `mode` (string): Integration mode - 'mcp' (default) or 'api'
- `apiUrl` (string): Context7 API URL (default: 'https://api.context7.ai', API mode only)
- `apiKey` (string): Context7 API key (default: process.env.CONTEXT7_API_KEY, API mode only)
- `timeout` (number): Request timeout in milliseconds (default: 10000, API mode only)
- `maxResults` (number): Maximum number of results to return (default: 5, API mode only)
- `cacheEnabled` (boolean): Enable result caching (default: true, API mode only)
- `fallbackEnabled` (boolean): Enable fallback error handling (default: true)
- `cacheMaxAge` (number): Maximum age of cache entries in milliseconds (default: 3600000, API mode only)

#### Methods

##### `handleQuery(userQuery, options)`

Process a single user query and return relevant documentation.

**Parameters:**
- `userQuery` (string): The user's query
- `options` (object): Additional options
  - `skipCache` (boolean): Skip cache lookup (default: false)

**Returns:** Promise<string> - Formatted response string

##### `handleBatchQuery(queries, options)`

Process multiple queries in batch.

**Parameters:**
- `queries` (Array<string>): Array of queries
- `options` (object): Additional options

**Returns:** Promise<Array<Object>> - Array of results

##### `healthCheck()`

Check if the Context7 integration is working properly.

**Returns:** Promise<Object> - Health status object

##### `getStats()`

Get cache and usage statistics.

**Returns:** Object - Statistics object

##### `clearCache()`

Clear all cached results.

**Returns:** Promise<boolean> - Success status

## Response Format

When documentation is found, the response includes:
- Document title
- Relevance score
- Content preview
- Source URL

When no documentation is found, the response will be:
```
No docs found in context7
```

## Error Handling

The integration includes comprehensive error handling:
- Network timeouts
- API authentication failures
- Invalid query formatting
- Cache corruption handling

## MCP Tools

When using MCP mode, the AI assistant in Cursor has access to these Context7 MCP tools:

- **mcp_context7_resolve-library-id**: Resolves a library name to a Context7-compatible library ID
- **mcp_context7_get-library-docs**: Fetches up-to-date documentation for a library

The integration automatically detects library queries and provides instructions for using these tools.

## Scripts

- `npm test` - Run tests
- `npm run health-check` - Check integration health
- `npm run clear-cache` - Clear the cache (API mode only)
- `npm run stats` - Display usage statistics (API mode only)
- `node mcp-usage-example.js` - Run MCP usage examples

## Configuration

Configuration can be provided through:
1. Environment variables (CONTEXT7_API_KEY)
2. Constructor options
3. config.json file

## Troubleshooting

### Common Issues

1. **"No docs found in context7"**: Check that your API key is valid and Context7 has relevant documentation
2. **Timeout errors**: Increase the timeout value in configuration
3. **Cache issues**: Use `npm run clear-cache` to clear corrupted cache

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=context7:*
```

## License

MIT License