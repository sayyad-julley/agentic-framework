# Query Pre-Processing Guide

## Overview

This implementation uses **Option 3: Pre-process queries** to automatically inject Context7 MCP instructions into the AI's context before it processes user queries.

## How It Works

### Architecture

```
User Query
    ↓
Query Pre-Processor (runs automatically)
    ↓
Generates Context7 MCP Instructions
    ↓
Injects into AI's Context
    ↓
AI sees instructions + user query
    ↓
AI automatically calls Context7 MCP tools
    ↓
AI responds based on fetched documentation
```

### Components

1. **`query-preprocessor.js`**: Pre-processes queries and generates context injection text
2. **`auto-inject.js`**: Auto-injection module that handles the injection process
3. **`.cursorrules`**: Cursor rules file that instructs the AI to use Context7
4. **`cursor-integration-wrapper.js`**: Simple wrapper for easy integration

## Integration Methods

### Method 1: Using .cursorrules (Automatic)

The `.cursorrules` file is automatically loaded by Cursor and instructs the AI to:
- Automatically detect queries that need Context7
- Call Context7 MCP tools before responding
- Use fetched documentation as the primary source

**No code changes needed** - just ensure `.cursorrules` is in your project root.

### Method 2: Programmatic Pre-Processing

If you need more control, use the pre-processor programmatically:

```javascript
const { preprocessQuery } = require('./context7-integration/cursor-integration-wrapper');

// Before processing a user query
const userQuery = "explain redis";
const contextInjection = await preprocessQuery(userQuery);

// Inject the context into AI's context
// Then process the query normally
```

### Method 3: Direct Tool Call Access

Get the tool calls programmatically:

```javascript
const { getToolCalls } = require('./context7-integration/cursor-integration-wrapper');

const toolCalls = await getToolCalls("explain redis");
// Returns: [
//   { tool: 'mcp_context7_resolve-library-id', parameters: {...} },
//   { tool: 'mcp_context7_get-library-docs', parameters: {...} }
// ]
```

## How the Pre-Processing Works

### Step 1: Query Analysis

The pre-processor analyzes the user query:
- Detects library names (e.g., "redis", "react")
- Extracts technical terms (e.g., "state management")
- Identifies topics (e.g., "hooks", "routing")

### Step 2: Generate MCP Tool Calls

For the query "explain redis":
```javascript
{
  tool: 'mcp_context7_resolve-library-id',
  parameters: { libraryName: 'redis' }
}
```

Then:
```javascript
{
  tool: 'mcp_context7_get-library-docs',
  parameters: {
    context7CompatibleLibraryID: '[resolved from step 1]',
    tokens: 8000
  }
}
```

### Step 3: Generate Context Injection

The pre-processor generates formatted text that:
- Clearly instructs the AI to call MCP tools
- Provides exact tool names and parameters
- Emphasizes using fetched docs as primary source

### Step 4: Inject into AI Context

The injection text is added to the AI's context before it sees the user query, ensuring the AI:
- Sees the instructions first
- Knows to call the tools
- Uses fetched docs for the response

## Example Context Injection

For query "explain redis", the injection looks like:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CONTEXT7 DOCUMENTATION FETCH REQUIRED                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

**AUTOMATIC INSTRUCTION**: Before answering the user's query, you MUST fetch 
the latest documentation from Context7 using the MCP tools below.

**User Query**: "explain redis"
**Detected Search Term**: "redis"

**REQUIRED ACTIONS** (execute these NOW, before responding):

1. **CALL MCP TOOL**: `mcp_context7_resolve-library-id`
   **Parameters**:
   - libraryName: "redis"
   **Description**: Resolve "redis" to Context7 library ID

2. **CALL MCP TOOL**: `mcp_context7_get-library-docs`
   **Parameters**:
   - context7CompatibleLibraryID: [Use result from previous step]
   - tokens: 8000
   **Description**: Fetch comprehensive documentation for "redis"

**CRITICAL**:
1. Call the MCP tools above IMMEDIATELY (do not skip this step)
2. Use the fetched documentation as the PRIMARY SOURCE for your response
3. Only use your existing knowledge to supplement, not replace, the fetched docs
4. If documentation is found, base your entire response on it
5. If no docs found, you may use your existing knowledge
```

## Benefits

1. **Automatic**: No manual intervention needed
2. **Universal**: Works with any query type
3. **Clear Instructions**: AI knows exactly what to do
4. **Up-to-Date**: Always uses latest documentation
5. **Fallback Safe**: Works even if Context7 is unavailable

## Testing

Test the pre-processor:

```javascript
const { preprocessQuery } = require('./context7-integration/cursor-integration-wrapper');

async function test() {
  const injection = await preprocessQuery("explain redis");
  console.log(injection);
}

test();
```

## Troubleshooting

### Pre-processor not running
- Ensure `.cursorrules` is in project root
- Check that Cursor is loading rules files
- Verify the integration wrapper is accessible

### MCP tools not being called
- Check `.cursorrules` is being read by Cursor
- Verify MCP server is configured in `~/.cursor/mcp.json`
- Check tool names match exactly

### No context injection
- Verify `preprocessQuery()` is being called
- Check for errors in console
- Ensure query is not empty

## Next Steps

1. The `.cursorrules` file should automatically work
2. If needed, integrate `preprocessQuery()` into your query pipeline
3. Monitor that MCP tools are being called
4. Verify responses use fetched documentation

