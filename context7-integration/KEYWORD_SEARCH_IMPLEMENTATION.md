# Keyword-Based Context7 Search Implementation

## Overview

This implementation provides a keyword-based search system for Context7 that:
1. Extracts meaningful keywords from ANY user query
2. Searches Context7 docs list using those keywords
3. Fetches related documentation
4. Uses fetched docs as the PRIMARY SOURCE for responses

## How It Works

### 1. Keyword Extraction (`keyword-search-handler.js`)

The `KeywordSearchHandler` class extracts keywords from queries by:
- Removing stop words (the, a, an, how, what, etc.)
- Identifying technical terms, library names, and programming concepts
- Extracting multi-word phrases (e.g., "react hooks", "state management")
- Prioritizing longer, more specific terms
- Returning up to 5 most relevant keywords

**Example:**
```
Query: "how to use react hooks"
Extracted Keywords: ["react-hooks", "react", "hooks"]
```

### 2. Context7 Docs Search

For each extracted keyword (up to 3 keywords):
1. Call `resolve-library-id` (or `mcp_context7_resolve-library-id`) with the keyword
2. This searches Context7 docs list for matching documentation
3. Resolve library IDs for any matches

### 3. Documentation Fetching

For each resolved library ID:
1. Call `get-library-docs` (or `mcp_context7_get-library-docs`) with:
   - `context7CompatibleLibraryID`: The resolved ID
   - `topic`: Extracted topic if present (e.g., "hooks", "routing")
   - `tokens`: 5000 (comprehensive documentation)

### 4. Response Generation

- Use ALL fetched documentation as the PRIMARY SOURCE
- Combine information from multiple docs if multiple keywords matched
- Only use existing knowledge to supplement, not replace, the fetched docs
- If no docs found for a keyword, proceed to the next keyword

## Files Modified

### 1. `keyword-search-handler.js` (NEW)
- `extractKeywords(query)`: Extracts meaningful keywords from any query
- `extractPhrases(query, keywords)`: Identifies multi-word technical phrases
- `extractTopic(query)`: Extracts specific topics (hooks, routing, etc.)
- `generateSearchToolCalls(userQuery)`: Generates MCP tool calls for keyword search
- `processQuery(query)`: Main entry point for processing queries

### 2. `mcp-handler.js` (UPDATED)
- Updated `generateMCPToolCalls()` to use keyword-based search
- Now extracts keywords and generates multiple search calls
- Supports both `mcp_context7_*` and non-prefixed tool names

### 3. `.cursorrules` (UPDATED)
- Updated to reflect keyword-based search approach
- Added examples for multiple keyword scenarios
- Clarified tool names with fallback options

## Usage Examples

### Example 1: Single Library Query
```
Query: "explain redis"
Keywords: ["redis"]
Actions:
  1. resolve-library-id("redis")
  2. get-library-docs(resolved_id)
Response: Based on fetched Redis documentation
```

### Example 2: Multi-Keyword Query
```
Query: "how to use react hooks"
Keywords: ["react-hooks", "react", "hooks"]
Actions:
  1. resolve-library-id("react-hooks")
  2. resolve-library-id("react")
  3. resolve-library-id("hooks")
  4. get-library-docs for each resolved ID with topic: "hooks"
Response: Combined React hooks documentation
```

### Example 3: General Technical Query
```
Query: "what is state management"
Keywords: ["state-management", "management", "state"]
Actions:
  1. resolve-library-id("state-management")
  2. resolve-library-id("management")
  3. resolve-library-id("state")
  4. get-library-docs for each resolved ID
Response: Combined state management documentation
```

## Testing

Run the test script to verify keyword extraction:
```bash
cd context7-integration
node test-keyword-search.js
```

This will test keyword extraction and tool call generation for various query types.

## Benefits

1. **Universal Query Support**: Works with ANY query, not just library-specific ones
2. **Multiple Keyword Search**: Tries multiple keywords to find the most relevant docs
3. **Comprehensive Coverage**: Fetches docs for all matching keywords
4. **Fallback Support**: Supports both prefixed and non-prefixed tool names
5. **Topic Awareness**: Extracts and uses topics when present in queries

## Configuration

The system is configured in `.cursorrules` and automatically:
- Extracts keywords from every query
- Generates MCP tool calls
- Provides clear instructions for the AI assistant

No additional configuration needed - it works automatically for all queries!

## Next Steps

1. Test with actual MCP server to verify tool names
2. Adjust keyword extraction if needed based on real-world queries
3. Optimize number of keywords searched (currently 3)
4. Add caching for frequently searched keywords

