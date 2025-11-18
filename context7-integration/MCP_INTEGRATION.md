# Context7 MCP Integration Guide

This guide explains how the Context7 MCP integration works in your project and how to use it effectively.

## Overview

The Context7 MCP (Model Context Protocol) integration allows the AI assistant in Cursor to automatically fetch up-to-date library documentation from Context7 when you ask questions about libraries.

## How It Works

1. **MCP Configuration**: Context7 MCP is configured in your `~/.cursor/mcp.json` file
2. **Query Detection**: The integration automatically detects when your query is about a library
3. **MCP Tool Calls**: The AI assistant uses MCP tools to fetch documentation
4. **Response**: Documentation is used to provide accurate, up-to-date answers

## MCP Tools Available

### 1. `mcp_context7_resolve-library-id`

Resolves a library name to a Context7-compatible library ID.

**Usage Example:**
```
Query: "How do I use React hooks?"
→ Calls: mcp_context7_resolve-library-id with libraryName: "react"
→ Returns: Library IDs like "/reactjs/react.dev"
```

### 2. `mcp_context7_get-library-docs`

Fetches documentation for a specific library.

**Usage Example:**
```
Query: "React hooks tutorial"
→ Calls: mcp_context7_get-library-docs with:
  - context7CompatibleLibraryID: "/reactjs/react.dev"
  - topic: "hooks"
  - tokens: 5000
→ Returns: Up-to-date React hooks documentation
```

## Supported Libraries

The integration automatically detects queries about these common libraries:

- **Frontend**: React, Next.js, Vue, Angular, Svelte
- **Styling**: Tailwind CSS, Ant Design
- **State Management**: Redux, Zustand
- **Backend**: Node.js, Express, NestJS
- **Databases**: MongoDB, PostgreSQL, Prisma
- **TypeScript**: TypeScript language features
- And many more...

## Usage Examples

### Example 1: React Query

**User Query:**
```
"How do I use React hooks?"
```

**What Happens:**
1. Integration detects "React" and "hooks" in the query
2. AI assistant calls `mcp_context7_resolve-library-id` for "react"
3. AI assistant calls `mcp_context7_get-library-docs` with library ID and topic "hooks"
4. AI assistant uses the documentation to answer your question

### Example 2: Next.js Query

**User Query:**
```
"How do I implement API routes in Next.js?"
```

**What Happens:**
1. Integration detects "Next.js" and "API routes"
2. AI assistant resolves Next.js library ID
3. AI assistant fetches documentation about API routes
4. AI assistant provides accurate, up-to-date answer

### Example 3: General Query

**User Query:**
```
"What is the weather today?"
```

**What Happens:**
1. Integration detects this is not a library query
2. No MCP tools are called
3. AI assistant answers normally

## Integration Files

- **`mcp-handler.js`**: Core MCP handler with query parsing and instruction generation
- **`mcp-integration.js`**: Unified integration interface supporting both MCP and API modes
- **`cursor-handler.js`**: Main handler updated to support MCP mode (default)
- **`mcp-usage-example.js`**: Usage examples and demonstrations

## Configuration

The integration uses MCP mode by default. To change modes:

```javascript
// MCP mode (default, recommended)
const handler = new CursorHandler({ mode: 'mcp' });

// API mode (legacy)
const handler = new CursorHandler({ mode: 'api' });
```

## Benefits of MCP Mode

1. **Always Up-to-Date**: Documentation is fetched directly from Context7, ensuring you get the latest information
2. **No API Keys in Code**: MCP handles authentication through Cursor's configuration
3. **Better Performance**: MCP tools are optimized for AI assistant usage
4. **Automatic Detection**: Library queries are automatically detected and handled
5. **Topic Focus**: Can focus on specific topics (e.g., "hooks", "routing", "authentication")

## Troubleshooting

### MCP Not Working

1. Check that Context7 MCP is configured in `~/.cursor/mcp.json`
2. Verify the API key is correct
3. Restart Cursor to reload MCP configuration

### Library Not Found

1. Try using the full library name (e.g., "next.js" instead of "nextjs")
2. Check if the library is available in Context7
3. Use the resolve-library-id tool to see available options

### Documentation Not Relevant

1. Be more specific in your query (e.g., "React hooks" instead of "React")
2. Use topic parameter to focus on specific areas
3. Try different library IDs if multiple options are available

## Best Practices

1. **Be Specific**: Include the library name and topic in your query
   - Good: "How do I use React useState hook?"
   - Less Good: "How do I use useState?"

2. **Use Library Names**: Mention the library explicitly
   - Good: "Next.js API routes"
   - Less Good: "API routes"

3. **Ask Focused Questions**: Narrow down to specific topics
   - Good: "React hooks for state management"
   - Less Good: "React"

## Testing the Integration

Run the usage examples:

```bash
node mcp-usage-example.js
```

Check MCP status:

```bash
npm run health-check
```

## Next Steps

1. Start asking questions about libraries - the integration will work automatically
2. Review the examples in `mcp-usage-example.js`
3. Customize the integration for your specific needs

## Support

For issues or questions:
1. Check the main README.md
2. Review the MCP configuration in `~/.cursor/mcp.json`
3. Test with the usage examples

