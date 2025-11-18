**CRITICAL: Pattern-matcher is a conceptual workflow, NOT a tool. DO NOT use grep/codebase_search. Use mental AST analysis.**

# Automatic Pattern Detection Reference

## Overview

This guide provides detailed instructions for automatically detecting AST patterns in code. The LLM uses this guide to automatically perform mental AST analysis to identify code structures that match patterns specified by sub-agents. **No tools are required. LLM performs mental code structure analysis.**

## AST Node Recognition

### CallExpression Recognition

**What to Look For**: Function calls in code

**Automatic Identification**:
- Function calls: `functionName()`
- Method calls: `object.method()`
- Chained calls: `object.method().another()`

**Examples**:
```typescript
router.push('/page')           // CallExpression
useState(0)                     // CallExpression
window.addEventListener(...)    // CallExpression
```

**Pattern Matching**:
- `CallExpression[callee.property.name='push']` → Matches `router.push()`, `history.push()`
- `CallExpression[callee.name='useState']` → Matches `useState(...)`
- `CallExpression[callee.name='useEffect']` → Matches `useEffect(...)`

### MemberExpression Recognition

**What to Look For**: Property access in code

**Automatic Identification**:
- Object property access: `object.property`
- Nested access: `object.property.subproperty`
- Method access: `object.method` (without calling)

**Examples**:
```typescript
window.location                 // MemberExpression
document.body                  // MemberExpression
router.push                    // MemberExpression (property access, not call)
window.localStorage.getItem     // MemberExpression
```

**Pattern Matching**:
- `MemberExpression[object.name='window']` → Matches `window.*`
- `MemberExpression[object.name='document']` → Matches `document.*`
- `MemberExpression[object.name='router']` → Matches `router.*`

### ImportDeclaration Recognition

**What to Look For**: Import statements

**Automatic Identification**:
- ES6 imports: `import ... from '...'`
- Default imports: `import X from '...'`
- Named imports: `import { X, Y } from '...'`
- Namespace imports: `import * as X from '...'`

**Examples**:
```typescript
import { useState } from 'react'           // ImportDeclaration
import Router from 'next/router'          // ImportDeclaration
import * as React from 'react'            // ImportDeclaration
```

**Pattern Matching**:
- `ImportDeclaration` → Matches all import statements

## Selector Matching

### Property Name Selectors

**Pattern**: `[callee.property.name='push']`

**Automatic Matching**:
1. Identify CallExpression
2. Check if `callee` is a MemberExpression
3. Check if `callee.property.name === 'push'`
4. Match found if all conditions true

**Example**:
```typescript
router.push('/page')  // ✅ Matches: callee.property.name === 'push'
history.push('/page') // ✅ Matches: callee.property.name === 'push'
array.push(item)      // ✅ Matches: callee.property.name === 'push'
router.replace('/')   // ❌ Doesn't match: property.name === 'replace'
```

### Object Name Selectors

**Pattern**: `[object.name='window']`

**Automatic Matching**:
1. Identify MemberExpression
2. Check if `object.name === 'window'`
3. Match found if condition true

**Example**:
```typescript
window.location       // ✅ Matches: object.name === 'window'
window.innerWidth     // ✅ Matches: object.name === 'window'
document.body         // ❌ Doesn't match: object.name === 'document'
```

### Direct Name Selectors

**Pattern**: `[callee.name='useState']`

**Automatic Matching**:
1. Identify CallExpression
2. Check if `callee.name === 'useState'`
3. Match found if condition true

**Example**:
```typescript
useState(0)           // ✅ Matches: callee.name === 'useState'
useEffect(() => {})  // ❌ Doesn't match: callee.name === 'useEffect'
```

## Multiple Pattern Matching

### OR Patterns: `Pattern1 | Pattern2`

**Automatic Matching**:
1. Match Pattern1 independently
2. Match Pattern2 independently
3. Combine all matches
4. Remove duplicates if any

**Example Pattern**: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`

**Code**:
```typescript
const hash = window.location.hash;
const body = document.body;
```

**Automatic Detection**:
- Match 1: `window.location.hash` (Pattern1)
- Match 2: `document.body` (Pattern2)
- Result: 2 matches total

## Location Extraction

### Line and Column Numbers

**Automatic Extraction**:
- Count lines from start of file
- Count characters from start of line
- Extract start and end positions

**Example**:
```typescript
1: export function MyComponent() {
2:   const width = window.innerWidth;
3:   return <div>Width: {width}</div>;
4: }
```

**Match**: `window.innerWidth`
- Start: line 2, column 15
- End: line 2, column 32

### Code Snippet Extraction

**Automatic Extraction**:
- Extract the exact code that matched
- Include full expression if needed
- Preserve formatting

**Example**:
- Match: `window.innerWidth`
- Code snippet: `window.innerWidth`

## Context Analysis

### Check if in useEffect

**Automatic Detection**:
- Look for `useEffect` wrapper
- Check if match is inside useEffect callback
- Verify: `useEffect(() => { /* match here */ })`

**Example**:
```typescript
useEffect(() => {
  const width = window.innerWidth; // ✅ Inside useEffect
}, []);
```

### Check if in Event Handler

**Automatic Detection**:
- Look for event handler props: `onClick`, `onChange`, etc.
- Check if match is inside handler function
- Verify: `onClick={() => { /* match here */ }}`

**Example**:
```typescript
<button onClick={() => window.open()}> // ✅ In event handler
```

### Check if in useState Initial Value

**Automatic Detection**:
- Look for `useState` calls
- Check if match is in useState argument
- Verify: `useState(/* match here */)`

**Example**:
```typescript
const [open, setOpen] = useState(window.location.hash === "#login"); // ❌ In useState initial value
```

### Check if in Render/Component Body

**Automatic Detection**:
- Check if match is directly in component body
- Not inside useEffect, event handler, or other safe context
- Verify: Direct access during render

**Example**:
```typescript
export function MyComponent() {
  const width = window.innerWidth; // ❌ Direct access during render
  return <div>{width}</div>;
}
```

## Pattern-Specific Detection

### Window/Document Access Pattern

**Pattern**: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`

**Automatic Detection Steps**:
1. Find all property access: `object.property`
2. Check if `object` is `window` or `document`
3. Verify context (not in useEffect, not in event handler, not in useState initial)
4. Return matches with context information

**Context Verification**:
- ❌ **Invalid**: Direct access during render
- ❌ **Invalid**: In useState initial value
- ✅ **Valid**: Inside useEffect
- ✅ **Valid**: In event handler

### Router.push Pattern

**Pattern**: `CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']`

**Automatic Detection Steps**:
1. Find all function calls: `function()`
2. Check if call is method call: `object.method()`
3. Check if method name is 'push' or 'replace'
4. Verify context (check if in dialog component)
5. Return matches with context information

**Context Verification**:
- Check for Dialog component imports
- Check for dialog state variables
- Verify if dialog should be closed before navigation

### Import Declaration Pattern

**Pattern**: `ImportDeclaration`

**Automatic Detection Steps**:
1. Find all import statements
2. Extract imported modules
3. Extract source module
4. Return matches with import information

**No Context Verification Needed**: Import statements are always at top level

## Return Format

### Match Object Structure

Each match automatically includes:

```json
{
  "location": {
    "start": { "line": 10, "column": 5 },
    "end": { "line": 10, "column": 20 }
  },
  "codeSnippet": "window.location",
  "nodeType": "MemberExpression",
  "filePath": "app/page.tsx",
  "context": {
    "inUseEffect": false,
    "inEventHandler": false,
    "inUseStateInitial": false,
    "inRender": true
  }
}
```

### Metadata Structure

```json
{
  "metadata": {
    "patternType": "ast",
    "totalMatches": 1,
    "filePath": "app/page.tsx",
    "pattern": "MemberExpression[object.name='window']"
  }
}
```

## Common Patterns Reference

### Hydration Agent Patterns

1. **Window/Document Access**:
   - Pattern: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']`
   - Finds: `window.*`, `document.*` access
   - Context: Must not be in render or useState initial

2. **Router Navigation**:
   - Pattern: `CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']`
   - Finds: `router.push()`, `router.replace()`
   - Context: Check if in dialog component

3. **Use Client Directive**:
   - Pattern: `^["']use client["']` (regex)
   - Finds: `"use client"` or `'use client'` at start of file
   - Context: Must be in page.tsx or layout.tsx

### Performance Agent Patterns

1. **Unnecessary Re-renders**:
   - Pattern: Various (component-specific)
   - Finds: Components that re-render unnecessarily
   - Context: Component structure analysis

2. **Large Bundle Size**:
   - Pattern: Import analysis
   - Finds: Large imports, unused imports
   - Context: Import statements

### Dependency Agent Patterns

1. **Missing Dependencies**:
   - Pattern: `ImportDeclaration | CallExpression[callee.name='require']`
   - Finds: Import statements and require calls
   - Context: Compare with package.json

2. **Version Mismatch**:
   - Pattern: Version comparison
   - Finds: Incompatible versions
   - Context: package.json analysis

## Best Practices

1. **Always verify context**: Don't just find matches, verify they're problematic
2. **Extract full expressions**: Include complete code snippets
3. **Check multiple locations**: Some patterns appear in multiple places
4. **Handle edge cases**: Nested calls, chained access, etc.
5. **Return structured data**: Use pattern-matcher skill format

## Related Documentation

- See `tools/ast-parser-guide.md` for usage workflow
- See `examples/automatic-ast-detection.md` for complete examples
- See `skills/pattern-matcher.md` for skill interface

