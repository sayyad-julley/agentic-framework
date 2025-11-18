---
id: use-client-boundary
name: Use Client Boundary
description: Removes "use client" directive from page.tsx or layout.tsx files, suggesting to move it to leaf components
patterns:
  - use-client-in-page-layout
semanticKeywords:
  - use client
  - page.tsx
  - layout.tsx
  - server component
  - client component
  - component boundary
semanticDescription: Removes "use client" directive from page or layout files, which prevents them from being Server Components and reduces performance benefits
instructionExamples:
  - Remove use client from page
  - Fix use client in layout
  - Move use client to component
  - Server component issue
detectionRule:
  type: regex
  pattern: ^["']use client["']
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
    - server components
    - client components
    - app router
  fetchStrategy: on-demand
---

# Use Client Boundary Sub-Agent

## Overview

This sub-agent removes the "use client" directive from `page.tsx` or `layout.tsx` files. These files should be Server Components by default for optimal performance. If client-side features are needed, they should be moved to leaf components.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** with:
   - `pattern`: "^[\"']use client[\"']"
   - `code`: [current file's code]
   - `type`: "regex"
   - `filePath`: [current file path]

3. **Check Context**: Verify the file is:
   - `page.tsx` or `page.js`
   - `layout.tsx` or `layout.js`
   - Located in `app/` directory (Next.js App Router)

4. **Return Detection Result**: If pattern matches and file is page/layout:
   ```javascript
   {
     patternId: "use-client-in-page-layout",
     location: { start: { line: 1, column: 1 }, end: { line: 1, column: 15 } },
     description: '"use client" directive found in page or layout file',
     fileType: "page" or "layout"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch Next.js documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "next.js"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "server components" or "client components"
   - `tokens`: 5000

### Step 2: Analyze Code

1. **Identify Client Features**: Check what requires client-side code:
   - Event handlers (onClick, onChange, etc.)
   - Hooks (useState, useEffect, etc.)
   - Browser APIs (window, document, localStorage, etc.)
   - Third-party client-only libraries

2. **Identify Extractable Components**: Find components that can be extracted:
   - Interactive components (buttons, forms, etc.)
   - Components using hooks
   - Components accessing browser APIs

### Step 3: Apply Fix

#### Option 1: Remove "use client" and Extract Components

**Before**:
```typescript
// app/page.tsx
"use client"; // ❌ Should be Server Component

import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Page</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
```

**After**:
```typescript
// app/page.tsx
// ✅ No "use client" - Server Component

import { CounterButton } from '@/components/counter-button';

export default function Page() {
  return (
    <div>
      <h1>Page</h1>
      <CounterButton />
    </div>
  );
}
```

```typescript
// components/counter-button.tsx
"use client"; // ✅ "use client" in leaf component

import { useState } from 'react';

export function CounterButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

#### Option 2: Remove "use client" if Not Needed

**Before**:
```typescript
// app/layout.tsx
"use client"; // ❌ Not needed

export default function Layout({ children }) {
  return <html><body>{children}</body></html>;
}
```

**After**:
```typescript
// app/layout.tsx
// ✅ No "use client" - Server Component

export default function Layout({ children }) {
  return <html><body>{children}</body></html>;
}
```

### Step 4: Validate Fix

- Verify "use client" is removed from page/layout file
- Ensure extracted components have "use client" if needed
- Check that functionality is preserved
- Verify no hydration errors

## Examples

### Before (Problematic Code)

```typescript
// app/page.tsx
"use client"; // ❌ Should be Server Component

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <h1>Home</h1>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
    </div>
  );
}
```

### After (Fixed Code)

```typescript
// app/page.tsx
// ✅ Server Component (no "use client")

import { HomePageClient } from '@/components/home-page-client';

export default function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <HomePageClient />
    </div>
  );
}
```

```typescript
// components/home-page-client.tsx
"use client"; // ✅ "use client" in leaf component

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function HomePageClient() {
  const [isOpen, setIsOpen] = useState(false);
  
  return <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>;
}
```

## Implementation Notes

- Remove "use client" from page/layout files
- Extract client-side code to separate components
- Add "use client" to extracted components if they need it
- Preserve all functionality
- Maintain component structure and imports

## Best Practices

- Keep page.tsx and layout.tsx as Server Components
- Move interactive features to leaf components
- Use "use client" only when necessary (hooks, event handlers, browser APIs)
- Leverage Server Components for better performance

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Next.js Server Components documentation
- Next.js Client Components documentation
- React Server Components best practices
- Component composition patterns
