# Automatic Context7 MCP Fetching

## Overview

The Context7 integration has been updated to **automatically call Context7 MCP tools for ANY user query**. This ensures that all responses are based on the latest documentation from Context7, not just cached knowledge.

## How It Works

### Before (Old Behavior)
- Only triggered Context7 for library-specific queries
- Returned instructions that the AI assistant might or might not follow
- Responses could be based on existing knowledge instead of fresh docs

### After (New Behavior)
- **Automatically triggers Context7 MCP for EVERY query**
- Extracts search terms intelligently from any query
- Generates clear, actionable MCP tool call instructions
- AI assistant is explicitly instructed to call the tools and use fetched docs

## Key Changes

### 1. Universal Query Support
The system now works with:
- ✅ Library-specific queries: "explain redis", "how to use zustand"
- ✅ General technical queries: "what is state management", "explain caching"
- ✅ Any programming-related query

### 2. Smart Search Term Extraction
The `extractSearchTerm()` method:
- Detects library names when present
- Extracts technical terms from general queries
- Falls back to query keywords if no specific terms found
- Always provides a searchable term for Context7

### 3. Automatic MCP Tool Generation
Every query now generates:
1. `mcp_context7_resolve-library-id` - Resolves the search term to a library ID
2. `mcp_context7_get-library-docs` - Fetches comprehensive documentation (8000 tokens)

### 4. Clear Instructions
The formatted response includes:
- Explicit instructions to call MCP tools
- Detailed tool call parameters
- Emphasis that fetched docs should be the primary source

## Code Changes

### Modified Files

1. **`mcp-handler.js`**
   - Added `extractSearchTerm()` method
   - Updated `generateMCPToolCalls()` to always return tool calls
   - Modified `parseQuery()` to always return `shouldUseMCP: true`

2. **`mcp-integration.js`**
   - Updated `handleQuery()` to always use MCP mode
   - Added `requiresMCPCall` flag
   - Returns structured tool call information

3. **`cursor-handler.js`**
   - Added `formatMCPInstructions()` method
   - Updated `handleQuery()` to format clear MCP instructions
   - Emphasizes that AI must call MCP tools

## Usage Example

```javascript
const CursorHandler = require('./cursor-handler');
const handler = new CursorHandler({ mode: 'mcp' });

// ANY query will trigger automatic Context7 fetching
const response = await handler.handleQuery('explain redis');

// Response format:
// ================================================================================
// 🔍 AUTOMATIC CONTEXT7 DOCUMENTATION FETCH
// ================================================================================
// 
// **User Query**: "explain redis"
// **Search Term**: "redis"
// 
// 🔍 AUTOMATIC CONTEXT7 FETCH: Call the MCP tools below to fetch latest documentation...
// 
// **MCP TOOL CALLS TO EXECUTE**:
// 
// 1. **mcp_context7_resolve-library-id**
//    Parameters:
//    - libraryName: "redis"
//    ...
// 
// 2. **mcp_context7_get-library-docs**
//    ...
// 
// ⚠️ IMPORTANT: You MUST call these MCP tools NOW to fetch the documentation.
// After fetching, use the retrieved documentation as the PRIMARY SOURCE for your response.
```

## Benefits

1. **Always Up-to-Date**: Responses use the latest documentation from Context7
2. **Universal Coverage**: Works with any query, not just library-specific ones
3. **Consistent Behavior**: Every query follows the same pattern
4. **Clear Instructions**: AI assistant knows exactly what to do
5. **Better Responses**: Responses are based on authoritative, current documentation

## Configuration

No configuration changes needed! The automatic fetching is enabled by default when using MCP mode:

```javascript
// Automatic fetching enabled by default
const handler = new CursorHandler({ mode: 'mcp' });
```

## Testing

To test the automatic fetching:

```javascript
const handler = new CursorHandler({ mode: 'mcp' });

// Test various query types
const queries = [
  'explain redis',
  'how to use react hooks',
  'what is state management',
  'typescript best practices'
];

for (const query of queries) {
  const response = await handler.handleQuery(query);
  console.log(`Query: ${query}`);
  console.log(`Response includes MCP instructions: ${response.includes('AUTOMATIC CONTEXT7')}`);
  console.log('---');
}
```

## Notes

- The AI assistant (Cursor) will see the formatted instructions and should automatically call the MCP tools
- If Context7 doesn't have documentation for a term, it will return "No docs found in context7"
- The system gracefully handles errors and provides fallback behavior
- Caching is still available in API mode for performance optimization

