---
id: dialog-navigation-bug
name: Dialog Navigation Bug
description: Fixes dialog reopening on navigation (mobile bug) by closing dialog before navigation
patterns:
  - dialog-reopens-on-navigation
semanticKeywords:
  - dialog
  - navigation
  - reopen
  - mobile
  - back button
  - router.push
  - router.replace
  - modal navigation
semanticDescription: Fixes dialogs that incorrectly reopen when navigating back due to App Router cache restoring the open state
instructionExamples:
  - Fix dialog reopening when navigating
  - Dialog opens when I navigate back
  - Modal reopens on navigation
  - Fix mobile dialog navigation bug
  - Dialog state persists after navigation
detectionRule:
  type: ast
  pattern: CallExpression[callee.property.name="push"] | CallExpression[callee.property.name="replace"]
fixCapabilities:
  - detect
  - getFix
  - applyFix
severity: warning
skills:
  - pattern-matcher
context7:
  libraries:
    - next.js
    - react
  topics:
    - navigation
    - app router
    - dialog
    - modal
  fetchStrategy: on-demand
---

# Dialog Navigation Bug Sub-Agent

## Overview

This sub-agent fixes dialogs that incorrectly reopen when navigating back due to Next.js App Router cache restoring the "open" state. This is a common mobile bug where the browser back button restores the dialog's open state.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** with:
   - `pattern`: "CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']"
   - `ast`: [current file's AST]
   - `type`: "ast"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Check Context**: Verify the router call is in a component that uses Dialog:
   - Check if Dialog component is imported
   - Check if dialog state (isOpen, open, etc.) is used
   - Verify router.push/replace is called without closing dialog first

4. **Return Detection Result**: If pattern matches and context confirms dialog usage:
   ```javascript
   {
     patternId: "dialog-reopens-on-navigation",
     location: { start: { line, column }, end: { line, column } },
     description: "router.push() called without closing dialog first",
     routerMethod: "push" or "replace"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch Next.js navigation documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "next.js"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "navigation"
   - `tokens`: 5000

### Step 2: Apply Fix

1. **Find Dialog State Setter**: Locate the dialog state setter (e.g., `setIsOpen`, `setOpen`)

2. **Add State Update**: Add dialog close before navigation:
   ```typescript
   // Before navigation
   setIsOpen(false); // or setOpen(false)
   ```

3. **Add Delay**: Add setTimeout to ensure dialog closes before navigation:
   ```typescript
   setIsOpen(false);
   setTimeout(() => {
     router.push('/another-page');
   }, 300); // 300ms allows dialog animation to complete
   ```

4. **Update Handler**: Modify the navigation handler:
   ```typescript
   const handleNavigate = () => {
     setIsOpen(false);
     setTimeout(() => {
       router.push('/another-page');
     }, 300);
   };
   ```

### Step 3: Validate Fix

- Ensure dialog state is set to false before navigation
- Verify setTimeout delay is appropriate (300ms is standard)
- Check that router call is inside setTimeout callback
- Verify no syntax errors

## Examples

### Before (Problematic Code)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

export function MyComponent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => {
    router.push('/another-page'); // ❌ Dialog not closed before navigation
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <button onClick={handleNavigate}>Navigate</button>
      </DialogContent>
    </Dialog>
  );
}
```

### After (Fixed Code)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

export function MyComponent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => {
    setIsOpen(false); // ✅ Close dialog first
    setTimeout(() => {
      router.push('/another-page'); // ✅ Navigate after dialog closes
    }, 300); // Allow animation to complete
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <button onClick={handleNavigate}>Navigate</button>
      </DialogContent>
    </Dialog>
  );
}
```

## Implementation Notes

- Uses AST transformation to modify code
- Preserves existing code structure and formatting
- Handles edge cases (multiple navigation calls, etc.)
- The delay (300ms) allows dialog animation to complete
- Works with both `router.push()` and `router.replace()`

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Next.js App Router navigation documentation
- React Dialog component best practices
- Browser history API behavior
