---
patterns:
  - id: dialog-reopens-on-navigation
    name: Dialog Reopens on Navigation
    description: Dialog incorrectly reopens when navigating back due to App Router cache restoring the "open" state. Need to programmatically close dialog before navigation.
    detectionRule:
      type: ast
      pattern: CallExpression[callee.property.name="push"] | CallExpression[callee.property.name="replace"]
    subAgent: dialog-navigation-bug
    severity: warning
    semanticKeywords:
      - dialog
      - navigation
      - reopen
      - mobile
      - back button
      - router.push
    semanticDescription: Dialog reopens when navigating back due to App Router cache
    examples:
      before: |
        const handleNavigate = () => {
          router.push('/another-page');
        };
      after: |
        const handleNavigate = () => {
          setIsOpen(false);
          setTimeout(() => {
            router.push('/another-page');
          }, 300);
        };

  - id: client-only-ui-without-mounted-check
    name: Client-Only UI Without Mounted State Check
    description: Rendering client-only UI (like Dialogs, Tooltips, Popovers) based on client-side information (URL hash, window properties) without checking if component is mounted. Causes hydration failures.
    detectionRule:
      type: ast
      pattern: MemberExpression[object.name="window"] | MemberExpression[object.name="document"]
    subAgent: client-only-ui-hydration
    severity: error
    semanticKeywords:
      - window access
      - document access
      - hydration error
      - client-only
      - mounted check
    semanticDescription: Window or document accessed during render without mounted check
    examples:
      before: |
        const hashCheck = typeof window !== 'undefined' && window.location.hash === "#login";
        const [open, setOpen] = useState(hashCheck);
      after: |
        const [open, setOpen] = useState(false);
        useEffect(() => {
          const hashCheck = window.location.hash === "#login";
          setOpen(hashCheck);
          const handleHashChange = () => {
            setOpen(window.location.hash === "#login");
          };
          window.addEventListener("hashchange", handleHashChange);
          return () => window.removeEventListener("hashchange", handleHashChange);
        }, []);

  - id: use-client-in-page-layout
    name: "use client" in Page or Layout Files
    description: Placing "use client" at the top of page.tsx or layout.tsx files instead of in leaf components. This prevents the page from being a Server Component, reducing performance benefits.
    detectionRule:
      type: regex
      pattern: ^["']use client["']
    subAgent: use-client-boundary
    severity: warning
    semanticKeywords:
      - use client
      - page.tsx
      - layout.tsx
      - server component
      - client component
    semanticDescription: "use client" directive found in page or layout file
    examples:
      before: |
        // app/page.tsx
        "use client";
        import { useState } from 'react';
        export default function Page() {
          const [count, setCount] = useState(0);
          return <div>Count: {count}</div>;
        }
      after: |
        // app/page.tsx
        import { Counter } from '@/components/counter';
        export default function Page() {
          return <Counter />;
        }
        
        // components/counter.tsx
        "use client";
        import { useState } from 'react';
        export function Counter() {
          const [count, setCount] = useState(0);
          return <div>Count: {count}</div>;
        }
---

# Anti-Pattern Definitions

This file contains all hydration anti-pattern definitions for the Hydration Agent.

## Pattern Structure

Each pattern includes:
- **id**: Unique identifier
- **name**: Human-readable name
- **description**: What the anti-pattern is
- **detectionRule**: How to detect it (AST or regex pattern)
- **subAgent**: Which sub-agent handles this pattern
- **severity**: error, warning, or info
- **semanticKeywords**: Keywords for semantic matching
- **semanticDescription**: Natural language description
- **examples**: Before/after code examples

## Available Patterns

### 1. Dialog Reopens on Navigation

**ID**: `dialog-reopens-on-navigation`

**Description**: Dialog incorrectly reopens when navigating back due to App Router cache restoring the "open" state.

**Detection**: AST pattern matching for `router.push()` or `router.replace()` calls

**Sub-Agent**: `dialog-navigation-bug`

**Severity**: warning

### 2. Client-Only UI Without Mounted Check

**ID**: `client-only-ui-without-mounted-check`

**Description**: Window or document accessed during render without checking if component is mounted.

**Detection**: AST pattern matching for `window` or `document` access

**Sub-Agent**: `client-only-ui-hydration`

**Severity**: error

### 3. "use client" in Page or Layout Files

**ID**: `use-client-in-page-layout`

**Description**: "use client" directive found in page.tsx or layout.tsx files.

**Detection**: Regex pattern matching for `"use client"` at start of file

**Sub-Agent**: `use-client-boundary`

**Severity**: warning

## Usage

Sub-agents use these pattern definitions to:
1. Understand what patterns they handle
2. Get detection rules
3. Reference examples for fixes
4. Match queries semantically

## Adding New Patterns

To add a new pattern:

1. Add pattern definition to YAML frontmatter
2. Include detection rule (AST or regex)
3. Specify sub-agent that handles it
4. Add semantic keywords for matching
5. Provide before/after examples
6. Update sub-agent markdown file if needed
