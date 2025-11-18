---
id: client-only-ui-hydration
name: Client-Only UI Hydration
description: Fixes window/document access during render without mounted check, causing hydration failures
patterns:
  - client-only-ui-without-mounted-check
semanticKeywords:
  - window access
  - document access
  - hydration error
  - client-only
  - mounted check
  - window.location
  - localStorage
  - sessionStorage
semanticDescription: Fixes components that access window or document during render without checking if component is mounted, causing hydration mismatches
instructionExamples:
  - Fix window access in render
  - Hydration error with window.location
  - Fix document access during render
  - Client-only UI hydration issue
  - Window access without mounted check
detectionRule:
  type: ast
  pattern: MemberExpression[object.name="window"] | MemberExpression[object.name="document"]
fixCapabilities:
  - detect
  - getFix
  - applyFix
severity: error
skills:
  - pattern-matcher
context7:
  libraries:
    - react
    - next.js
  topics:
    - hydration
    - useEffect
    - useState
    - client components
  fetchStrategy: on-demand
---

# Client-Only UI Hydration Sub-Agent

## Overview

This sub-agent fixes components that access `window` or `document` during render without checking if the component is mounted. This causes hydration errors because the server doesn't have access to these browser APIs, creating a mismatch between server and client HTML.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** with:
   - `pattern`: "MemberExpression[object.name='window'] | MemberExpression[object.name='document']"
   - `ast`: [current file's AST]
   - `type`: "ast"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Check Context**: Verify the window/document access is:
   - NOT inside a `useEffect` hook
   - NOT inside an event handler
   - Directly in render/component body
   - Used in `useState` initial value or during render

4. **Return Detection Result**: If pattern matches problematic context:
   ```javascript
   {
     patternId: "client-only-ui-without-mounted-check",
     location: { start: { line, column }, end: { line, column } },
     description: "window/document accessed during render without mounted check",
     accessType: "window" or "document",
     context: "useState initial" or "render"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch React/Next.js documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "react"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "useEffect" or "useState"
   - `tokens`: 5000

### Step 2: Apply Fix

#### Case 1: Window/Document in useState Initial Value

**Problem**:
```typescript
const hashCheck = typeof window !== 'undefined' && window.location.hash === "#login";
const [open, setOpen] = useState(hashCheck);
```

**Fix**:
```typescript
const [open, setOpen] = useState(false); // ✅ Use safe default

useEffect(() => {
  // ✅ Move window access to useEffect
  const hashCheck = window.location.hash === "#login";
  setOpen(hashCheck);
  
  // Handle hash changes
  const handleHashChange = () => {
    setOpen(window.location.hash === "#login");
  };
  window.addEventListener("hashchange", handleHashChange);
  return () => window.removeEventListener("hashchange", handleHashChange);
}, []);
```

#### Case 2: Window/Document Directly in Render

**Problem**:
```typescript
export function MyComponent() {
  const width = window.innerWidth; // ❌ Access during render
  return <div>Width: {width}</div>;
}
```

**Fix**:
```typescript
export function MyComponent() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // ✅ Access window in useEffect
    setWidth(window.innerWidth);
    
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return <div>Width: {width}</div>;
}
```

#### Case 3: Conditional Rendering Based on Window

**Problem**:
```typescript
export function MyComponent() {
  if (typeof window !== 'undefined' && window.location.hash === "#login") {
    return <LoginDialog />; // ❌ Conditional render based on window
  }
  return <div>Content</div>;
}
```

**Fix**:
```typescript
export function MyComponent() {
  const [showLogin, setShowLogin] = useState(false);
  
  useEffect(() => {
    // ✅ Check window in useEffect
    setShowLogin(window.location.hash === "#login");
    
    const handleHashChange = () => {
      setShowLogin(window.location.hash === "#login");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  if (showLogin) {
    return <LoginDialog />;
  }
  return <div>Content</div>;
}
```

### Step 3: Validate Fix

- Ensure all window/document access is in `useEffect`
- Verify `useState` uses safe defaults (false, null, empty string, etc.)
- Check that event listeners are properly cleaned up
- Verify no window/document access in render

## Examples

### Before (Problematic Code)

```typescript
'use client';

import { useState } from 'react';

export function LoginDialog() {
  // ❌ Window access in useState initial value
  const hashCheck = typeof window !== 'undefined' && window.location.hash === "#login";
  const [open, setOpen] = useState(hashCheck);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>Login</DialogContent>
    </Dialog>
  );
}
```

### After (Fixed Code)

```typescript
'use client';

import { useState, useEffect } from 'react';

export function LoginDialog() {
  // ✅ Safe default value
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // ✅ Window access moved to useEffect
    const hashCheck = window.location.hash === "#login";
    setOpen(hashCheck);

    // Handle hash changes
    const handleHashChange = () => {
      setOpen(window.location.hash === "#login");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>Login</DialogContent>
    </Dialog>
  );
}
```

## Implementation Notes

- Always use safe defaults in `useState` (false, null, 0, empty string)
- Move all window/document access to `useEffect`
- Clean up event listeners in `useEffect` return function
- Handle initial value checks in `useEffect`
- Preserve existing functionality while fixing hydration issues

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- React useEffect documentation
- React useState documentation
- Next.js client components best practices
- Browser API access patterns
