---
id: large-bundle-size
name: Large Bundle Size
description: Fixes large bundle sizes through dynamic imports, code splitting, and removing unused dependencies
patterns:
  - large-bundle-size
semanticKeywords:
  - bundle size
  - large bundle
  - code splitting
  - dynamic import
  - lazy load
  - optimization
  - webpack
semanticDescription: Fixes large bundle sizes by implementing code splitting and dynamic imports
instructionExamples:
  - Fix large bundle size
  - Reduce bundle size
  - Implement code splitting
  - Use dynamic imports
detectionRule:
  type: ast
  pattern: ImportDeclaration
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
    - webpack
  topics:
    - code splitting
    - dynamic imports
    - bundle optimization
    - lazy loading
  fetchStrategy: on-demand
---

# Large Bundle Size Sub-Agent

## Overview

This sub-agent fixes large bundle sizes by implementing code splitting, dynamic imports, and removing unused dependencies. Large bundles can cause slow initial page loads and poor user experience.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** to find large imports:
   - `pattern`: "ImportDeclaration"
   - `ast`: [current file's AST]
   - `type`: "ast"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Analyze Imports**:
   - Check for large library imports (e.g., entire lodash, moment, etc.)
   - Check for components that could be lazy loaded
   - Check for unused imports
   - Check for imports that could be dynamic

4. **Return Detection Result**: If large imports found:
   ```javascript
   {
     patternId: "large-bundle-size",
     location: { start: { line, column }, end: { line, column } },
     description: "Large import that could be code-split",
     importSource: "library-name",
     importType: "large-library" | "component" | "unused"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch Next.js documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "next.js"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "code splitting" or "dynamic imports"
   - `tokens`: 5000

### Step 2: Apply Fix Based on Import Type

#### Case 1: Large Library Import (Use Specific Imports)

**Problem**:
```typescript
// ❌ Imports entire library
import _ from 'lodash';
import moment from 'moment';

function MyComponent() {
  return <div>{_.capitalize('hello')} - {moment().format('YYYY-MM-DD')}</div>;
}
```

**Fix**:
```typescript
// ✅ Import only what's needed
import capitalize from 'lodash/capitalize';
import moment from 'moment';

function MyComponent() {
  return <div>{capitalize('hello')} - {moment().format('YYYY-MM-DD')}</div>;
}
```

#### Case 2: Component That Could Be Lazy Loaded

**Problem**:
```typescript
// ❌ Heavy component imported at top level
import { HeavyChart } from '@/components/heavy-chart';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

**Fix**:
```typescript
// ✅ Lazy load heavy component
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('@/components/heavy-chart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

#### Case 3: Next.js Dynamic Import

**Problem**:
```typescript
// ❌ Regular import
import { Modal } from '@/components/modal';

function Page() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open</button>
      {showModal && <Modal />}
    </div>
  );
}
```

**Fix**:
```typescript
// ✅ Dynamic import in Next.js
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('@/components/modal'), {
  ssr: false, // If modal doesn't need SSR
});

function Page() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open</button>
      {showModal && <Modal />}
    </div>
  );
}
```

### Step 3: Validate Fix

- Verify dynamic imports are used for heavy components
- Check that specific imports are used instead of entire libraries
- Ensure unused imports are removed
- Verify code splitting is implemented correctly
- Check bundle size reduction

## Examples

### Before (Problematic Code)

```typescript
import _ from 'lodash';
import { Chart } from '@/components/chart';
import { Modal } from '@/components/modal';
import { HeavyLibrary } from 'heavy-library';

function Dashboard() {
  const data = _.map(items, item => item.value);
  
  return (
    <div>
      <Chart data={data} />
      <Modal />
    </div>
  );
}
```

### After (Fixed Code)

```typescript
import map from 'lodash/map';
import dynamic from 'next/dynamic';

// ✅ Dynamic imports for heavy components
const Chart = dynamic(() => import('@/components/chart'), {
  loading: () => <div>Loading chart...</div>,
});

const Modal = dynamic(() => import('@/components/modal'), {
  ssr: false,
});

function Dashboard() {
  // ✅ Specific import instead of entire library
  const data = map(items, item => item.value);
  
  return (
    <div>
      <Chart data={data} />
      <Modal />
    </div>
  );
}
```

## Implementation Notes

- Use dynamic imports for components that aren't immediately needed
- Import only what's needed from large libraries
- Remove unused imports
- Use Next.js dynamic() for route-based code splitting
- Use React.lazy() for component-based code splitting

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Next.js dynamic imports documentation
- React lazy loading documentation
- Webpack code splitting best practices
- Bundle optimization techniques
