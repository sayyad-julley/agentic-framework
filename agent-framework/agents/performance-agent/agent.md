---
id: performance-agent
name: Performance Agent
description: Detects and fixes React/Next.js performance anti-patterns including unnecessary re-renders and large bundle sizes
version: 1.0.0
capabilities:
  - scan
  - detect
  - fix
  - autoDetectAndExecute
triggers:
  - performance
  - re-render
  - bundle size
  - optimization
  - slow
  - lag
  - memory leak
semanticKeywords:
  - performance
  - re-render
  - unnecessary render
  - bundle size
  - optimization
  - memoization
  - useMemo
  - useCallback
  - React.memo
semanticDescription: Handles React and Next.js performance issues including unnecessary re-renders, large bundle sizes, memory leaks, and optimization opportunities
filePatterns:
  - "*.tsx"
  - "*.ts"
  - "*.jsx"
  - "*.js"
context7:
  libraries:
    - react
    - next.js
  topics:
    - performance
    - optimization
    - memoization
    - bundle size
    - code splitting
  fetchStrategy: on-demand
---

# Performance Agent

## Overview

This agent detects and fixes React/Next.js performance anti-patterns. Performance issues can include unnecessary re-renders, large bundle sizes, missing memoization, and inefficient component structures.

## Context7 Integration

Before applying fixes, you MUST fetch relevant documentation:

1. **Extract Keywords**: From the query, extract: "react", "next.js", "performance", "optimization", "memoization"

2. **Fetch Documentation**:
   - Call `mcp_context7_resolve-library-id` with `libraryName: "react"`
   - Call `mcp_context7_resolve-library-id` with `libraryName: "next.js"`
   - For each resolved ID, call `mcp_context7_get-library-docs` with:
     - `context7CompatibleLibraryID`: [resolved ID]
     - `topic`: "performance" or "optimization" or "memoization"
     - `tokens`: 5000

3. **Use Fetched Docs**: Use fetched documentation as PRIMARY SOURCE for fix strategies

## Capabilities

- **Scan**: Scans directories for performance issues
- **Detect**: Detects issues in specific code
- **Fix**: Automatically fixes detected issues
- **Auto-Detect and Execute**: Full automated workflow

## Sub-Agents

This agent includes the following sub-agents:

1. **Unnecessary Re-Renders** (`unnecessary-re-renders.md`)
   - Fixes components that re-render unnecessarily
   - Uses pattern-matcher skill for detection

2. **Large Bundle Size** (`large-bundle-size.md`)
   - Fixes large bundle sizes through code splitting and optimization
   - Uses pattern-matcher skill for import analysis

## Usage

The agent is automatically activated when queries contain performance-related keywords such as:
- "performance issue"
- "unnecessary re-render"
- "bundle size too large"
- "slow rendering"
- "optimization needed"

## Detection Strategy

The agent uses AST parsing and pattern matching to detect performance anti-patterns. See individual sub-agents for specific detection rules. All sub-agents use the `pattern-matcher` skill for pattern detection.

## Skills Used

- **pattern-matcher**: Used by all sub-agents for AST and regex pattern matching

## Examples

### Example Query: "Fix unnecessary re-renders"

1. Agent matches based on "re-render" keyword
2. Sub-agent "unnecessary-re-renders" matches (high relevance)
3. Patterns detected using pattern-matcher skill
4. Fixes applied: Add React.memo, useMemo, useCallback
5. Documentation fetched via Context7 for React optimization

### Example Query: "Bundle size is too large"

1. Agent matches based on "bundle size" keyword
2. Sub-agent "large-bundle-size" matches (high relevance)
3. Large imports detected using pattern-matcher skill
4. Fixes applied: Dynamic imports, code splitting
5. Documentation fetched via Context7 for Next.js optimization

## Related Documentation

- See `PROMPT_ENGINEERING_GUIDE.md` for prompt engineering techniques
- See `skills/pattern-matcher.md` for pattern matching usage
- See `anti-patterns/definitions.md` for all pattern definitions
