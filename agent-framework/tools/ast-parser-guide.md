**CRITICAL: Pattern-matcher is a conceptual workflow, NOT a tool. DO NOT use grep/codebase_search. Use mental AST analysis.**

# AST Parser Automatic Detection Guide

## Overview

This guide enables automatic AST pattern detection for the agent framework. The LLM automatically performs mental AST analysis of code structure to identify AST nodes matching patterns specified by sub-agents, without requiring manual command construction. **No tools are required. LLM performs mental code structure analysis.**

## Automatic Detection Workflow

When a sub-agent requires AST pattern detection, the LLM automatically:

1. **Reads the file** using `read_file` tool
2. **Performs mental analysis of code structure** to identify AST nodes (no tools required)
3. **Matches nodes** against the pattern from sub-agent's `detectionRule`
4. **Returns matches** in pattern-matcher skill format

**LLM performs mental AST analysis. No tools required.**

## How Automatic Detection Works

### Understanding AST Patterns

AST (Abstract Syntax Tree) patterns describe code structure. The LLM automatically recognizes:

- **CallExpression**: Function calls like `router.push()`, `setState()`, `useEffect()`
- **MemberExpression**: Property access like `window.location`, `document.body`, `router.push`
- **ImportDeclaration**: Import statements like `import { useState } from 'react'`
- **VariableDeclaration**: Variable declarations like `const x = ...`
- **FunctionDeclaration**: Function definitions

### Automatic Pattern Matching

The LLM automatically matches code against AST patterns:

**Pattern**: `CallExpression[callee.property.name='push']`
- **Automatically finds**: `router.push()`, `history.push()`, `navigation.push()`
- **Checks**: The method being called is named 'push'
- **Extracts**: Location, code snippet, context

**Pattern**: `MemberExpression[object.name='window']`
- **Automatically finds**: `window.location`, `window.innerWidth`, `window.localStorage`
- **Checks**: The object being accessed is 'window'
- **Extracts**: Location, code snippet, context

**Pattern**: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`
- **Automatically finds**: Both `window.*` and `document.*` access
- **Checks**: Object is either 'window' or 'document'
- **Extracts**: Location, code snippet, context for each match

## Automatic Detection Steps

### Step 1: Read File (Automatic)

The LLM automatically reads the file using `read_file` tool:

```
File: app/page.tsx
Code: [file content]
```

### Step 2: Analyze Code Structure (Automatic)

The LLM automatically identifies AST nodes in the code:

**Example Code**:
```typescript
const width = window.innerWidth;
router.push('/page');
```

**Automatic Analysis**:
- `window.innerWidth` → MemberExpression, object.name='window'
- `router.push('/page')` → CallExpression, callee.property.name='push'

### Step 3: Match Against Pattern (Automatic)

The LLM automatically compares identified nodes against the pattern:

**Pattern**: `MemberExpression[object.name='window']`
**Matches Found**:
- `window.innerWidth` (line 10, column 15)

**Pattern**: `CallExpression[callee.property.name='push']`
**Matches Found**:
- `router.push('/page')` (line 11, column 3)

### Step 4: Extract Match Information (Automatic)

For each match, the LLM automatically extracts:

- **Location**: Line and column numbers
- **Code Snippet**: The actual code that matched
- **Node Type**: The AST node type (CallExpression, MemberExpression, etc.)
- **Context**: Surrounding code for verification

### Step 5: Return Matches (Automatic)

The LLM automatically formats matches in pattern-matcher skill format:

```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 10, "column": 15 },
        "end": { "line": 10, "column": 32 }
      },
      "codeSnippet": "window.innerWidth",
      "nodeType": "MemberExpression",
      "filePath": "app/page.tsx"
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 1,
    "filePath": "app/page.tsx"
  }
}
```

## Pattern Recognition Guide

### CallExpression Patterns

**Pattern**: `CallExpression[callee.property.name='push']`

**Automatic Recognition**:
- Look for function calls with `.push()` method
- Examples: `router.push()`, `history.push()`, `array.push()`
- Check: `callee.property.name === 'push'`

**Pattern**: `CallExpression[callee.name='useState']`

**Automatic Recognition**:
- Look for direct function calls named `useState`
- Examples: `useState(0)`, `useState(false)`
- Check: `callee.name === 'useState'`

### MemberExpression Patterns

**Pattern**: `MemberExpression[object.name='window']`

**Automatic Recognition**:
- Look for property access on `window` object
- Examples: `window.location`, `window.innerWidth`, `window.localStorage`
- Check: `object.name === 'window'`

**Pattern**: `MemberExpression[object.name='document']`

**Automatic Recognition**:
- Look for property access on `document` object
- Examples: `document.body`, `document.getElementById()`
- Check: `object.name === 'document'`

### Multiple Patterns

**Pattern**: `Pattern1 | Pattern2`

**Automatic Recognition**:
- Match both patterns independently
- Combine matches from both patterns
- Examples:
  - `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`
  - Finds both `window.*` and `document.*` access

### ImportDeclaration Patterns

**Pattern**: `ImportDeclaration`

**Automatic Recognition**:
- Look for all `import` statements
- Examples: `import { useState } from 'react'`, `import Router from 'next/router'`
- Extract: Imported modules, source, location

## Context Verification (Automatic)

After finding matches, the LLM automatically verifies context:

### Window/Document Access Context

**Check**: Is the access inside `useEffect`?
- ✅ **Valid**: `useEffect(() => { window.location.hash })`
- ❌ **Invalid**: `const hash = window.location.hash` (during render)

**Check**: Is the access in an event handler?
- ✅ **Valid**: `onClick={() => window.open()}`

**Check**: Is the access in useState initial value?
- ❌ **Invalid**: `useState(window.innerWidth)` (causes hydration error)

### Router.push Context

**Check**: Is router.push in a dialog component?
- Look for Dialog component imports
- Look for dialog state (isOpen, open, etc.)
- Verify if dialog should be closed before navigation

## Examples

### Example 1: Window Access Detection

**File**: `app/components/MyComponent.tsx`
**Pattern**: `MemberExpression[object.name='window']`

**Code**:
```typescript
export function MyComponent() {
  const width = window.innerWidth; // ❌ During render
  return <div>Width: {width}</div>;
}
```

**Automatic Detection**:
- Finds: `window.innerWidth` (line 2, column 15)
- Context: Direct access during render (not in useEffect)
- Result: Match found, hydration issue detected

### Example 2: Router.push Detection

**File**: `app/components/Dialog.tsx`
**Pattern**: `CallExpression[callee.property.name='push']`

**Code**:
```typescript
const handleNavigate = () => {
  router.push('/page'); // ❌ Dialog not closed
};
```

**Automatic Detection**:
- Finds: `router.push('/page')` (line 2, column 3)
- Context: In dialog component, dialog state exists
- Result: Match found, dialog navigation bug detected

### Example 3: Multiple Pattern Detection

**File**: `app/components/ClientComponent.tsx`
**Pattern**: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`

**Code**:
```typescript
const hash = window.location.hash;
const body = document.body;
```

**Automatic Detection**:
- Finds: `window.location.hash` (line 1, column 12)
- Finds: `document.body` (line 2, column 12)
- Result: 2 matches found

## Error Handling

### Invalid Pattern

If pattern syntax is invalid:
- LLM automatically identifies the issue
- Reports error in metadata
- Returns empty matches array

### File Not Found

If file doesn't exist:
- LLM automatically handles gracefully
- Reports error in metadata
- Returns empty matches array

### Syntax Error in Code

If code has syntax errors:
- LLM automatically identifies syntax issues
- May still find some matches if code is partially valid
- Reports syntax errors in metadata

## Best Practices

1. **Always verify context**: After finding matches, check if they're in problematic locations
2. **Check multiple patterns**: For `Pattern1 | Pattern2`, search for both
3. **Extract full context**: Include surrounding code in match results
4. **Validate matches**: Ensure matches actually represent the anti-pattern
5. **Handle edge cases**: Consider nested calls, chained access, etc.

## Related Documentation

- See `tools/automatic-pattern-detection.md` for detailed pattern recognition
- See `examples/automatic-ast-detection.md` for complete examples
- See `skills/pattern-matcher.md` for pattern-matcher skill interface

