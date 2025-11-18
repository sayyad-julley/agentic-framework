# Automatic AST Detection Examples

This document provides complete examples of automatic AST pattern detection for each sub-agent pattern type.

## Example 1: Window/Document Access Detection

### Pattern
```
MemberExpression[object.name='window'] | MemberExpression[object.name='document']
```

### Code File
**File**: `app/components/MyComponent.tsx`

```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  // ❌ Window access during render
  const width = window.innerWidth;
  
  // ❌ Document access during render
  const body = document.body;
  
  // ❌ Window access in useState initial value
  const hashCheck = typeof window !== 'undefined' && window.location.hash === "#login";
  const [open, setOpen] = useState(hashCheck);
  
  // ✅ Window access in useEffect (valid)
  useEffect(() => {
    const height = window.innerHeight;
    setHeight(height);
  }, []);
  
  return <div>Width: {width}</div>;
}
```

### Automatic Detection Process

1. **Read File**: LLM automatically reads `app/components/MyComponent.tsx`

2. **Analyze Code Structure**: LLM automatically identifies:
   - `window.innerWidth` → MemberExpression, object.name='window'
   - `document.body` → MemberExpression, object.name='document'
   - `window.location.hash` → MemberExpression, object.name='window'
   - `window.innerHeight` → MemberExpression, object.name='window' (inside useEffect)

3. **Match Against Pattern**: LLM automatically matches:
   - ✅ `window.innerWidth` (line 7, column 15)
   - ✅ `document.body` (line 10, column 15)
   - ✅ `window.location.hash` (line 13, column 45)
   - ✅ `window.innerHeight` (line 19, column 19) - but in useEffect (valid)

4. **Context Verification**: LLM automatically verifies:
   - `window.innerWidth`: ❌ Direct access during render
   - `document.body`: ❌ Direct access during render
   - `window.location.hash`: ❌ In useState initial value
   - `window.innerHeight`: ✅ Inside useEffect (valid, but still reported)

5. **Return Matches**:
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 7, "column": 15 },
        "end": { "line": 7, "column": 32 }
      },
      "codeSnippet": "window.innerWidth",
      "nodeType": "MemberExpression",
      "filePath": "app/components/MyComponent.tsx",
      "context": {
        "inUseEffect": false,
        "inEventHandler": false,
        "inUseStateInitial": false,
        "inRender": true
      }
    },
    {
      "location": {
        "start": { "line": 10, "column": 15 },
        "end": { "line": 10, "column": 28 }
      },
      "codeSnippet": "document.body",
      "nodeType": "MemberExpression",
      "filePath": "app/components/MyComponent.tsx",
      "context": {
        "inUseEffect": false,
        "inEventHandler": false,
        "inUseStateInitial": false,
        "inRender": true
      }
    },
    {
      "location": {
        "start": { "line": 13, "column": 45 },
        "end": { "line": 13, "column": 66 }
      },
      "codeSnippet": "window.location.hash",
      "nodeType": "MemberExpression",
      "filePath": "app/components/MyComponent.tsx",
      "context": {
        "inUseEffect": false,
        "inEventHandler": false,
        "inUseStateInitial": true,
        "inRender": false
      }
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 3,
    "filePath": "app/components/MyComponent.tsx",
    "pattern": "MemberExpression[object.name='window'] | MemberExpression[object.name='document']"
  }
}
```

## Example 2: Router.push Detection

### Pattern
```
CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']
```

### Code File
**File**: `app/components/DialogComponent.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

export function DialogComponent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigate = () => {
    // ❌ Router.push without closing dialog
    router.push('/another-page');
  };
  
  const handleReplace = () => {
    // ❌ Router.replace without closing dialog
    router.replace('/home');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <button onClick={handleNavigate}>Navigate</button>
        <button onClick={handleReplace}>Replace</button>
      </DialogContent>
    </Dialog>
  );
}
```

### Automatic Detection Process

1. **Read File**: LLM automatically reads `app/components/DialogComponent.tsx`

2. **Analyze Code Structure**: LLM automatically identifies:
   - `router.push('/another-page')` → CallExpression, callee.property.name='push'
   - `router.replace('/home')` → CallExpression, callee.property.name='replace'
   - Dialog component imported
   - Dialog state `isOpen` exists

3. **Match Against Pattern**: LLM automatically matches:
   - ✅ `router.push('/another-page')` (line 12, column 5)
   - ✅ `router.replace('/home')` (line 16, column 5)

4. **Context Verification**: LLM automatically verifies:
   - Both calls are in dialog component (Dialog imported, isOpen state exists)
   - Dialog is not closed before navigation
   - Both are problematic

5. **Return Matches**:
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 12, "column": 5 },
        "end": { "line": 12, "column": 30 }
      },
      "codeSnippet": "router.push('/another-page')",
      "nodeType": "CallExpression",
      "filePath": "app/components/DialogComponent.tsx",
      "context": {
        "inDialogComponent": true,
        "dialogClosedBeforeNavigation": false,
        "routerMethod": "push"
      }
    },
    {
      "location": {
        "start": { "line": 16, "column": 5 },
        "end": { "line": 16, "column": 25 }
      },
      "codeSnippet": "router.replace('/home')",
      "nodeType": "CallExpression",
      "filePath": "app/components/DialogComponent.tsx",
      "context": {
        "inDialogComponent": true,
        "dialogClosedBeforeNavigation": false,
        "routerMethod": "replace"
      }
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 2,
    "filePath": "app/components/DialogComponent.tsx",
    "pattern": "CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']"
  }
}
```

## Example 3: Import Declaration Detection

### Pattern
```
ImportDeclaration
```

### Code File
**File**: `app/components/FeatureComponent.tsx`

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import axios from 'axios';
import lodash from 'lodash';
```

### Automatic Detection Process

1. **Read File**: LLM automatically reads `app/components/FeatureComponent.tsx`

2. **Analyze Code Structure**: LLM automatically identifies:
   - All `import` statements are ImportDeclaration nodes

3. **Match Against Pattern**: LLM automatically matches:
   - ✅ `import { useState } from 'react'` (line 1)
   - ✅ `import { useRouter } from 'next/navigation'` (line 2)
   - ✅ `import { Dialog } from '@/components/ui/dialog'` (line 3)
   - ✅ `import axios from 'axios'` (line 4)
   - ✅ `import lodash from 'lodash'` (line 5)

4. **Return Matches**:
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 1, "column": 1 },
        "end": { "line": 1, "column": 32 }
      },
      "codeSnippet": "import { useState } from 'react'",
      "nodeType": "ImportDeclaration",
      "filePath": "app/components/FeatureComponent.tsx",
      "imports": ["useState"],
      "source": "react"
    },
    {
      "location": {
        "start": { "line": 2, "column": 1 },
        "end": { "line": 2, "column": 42 }
      },
      "codeSnippet": "import { useRouter } from 'next/navigation'",
      "nodeType": "ImportDeclaration",
      "filePath": "app/components/FeatureComponent.tsx",
      "imports": ["useRouter"],
      "source": "next/navigation"
    },
    {
      "location": {
        "start": { "line": 3, "column": 1 },
        "end": { "line": 3, "column": 48 }
      },
      "codeSnippet": "import { Dialog } from '@/components/ui/dialog'",
      "nodeType": "ImportDeclaration",
      "filePath": "app/components/FeatureComponent.tsx",
      "imports": ["Dialog"],
      "source": "@/components/ui/dialog"
    },
    {
      "location": {
        "start": { "line": 4, "column": 1 },
        "end": { "line": 4, "column": 25 }
      },
      "codeSnippet": "import axios from 'axios'",
      "nodeType": "ImportDeclaration",
      "filePath": "app/components/FeatureComponent.tsx",
      "imports": ["axios"],
      "source": "axios"
    },
    {
      "location": {
        "start": { "line": 5, "column": 1 },
        "end": { "line": 5, "column": 27 }
      },
      "codeSnippet": "import lodash from 'lodash'",
      "nodeType": "ImportDeclaration",
      "filePath": "app/components/FeatureComponent.tsx",
      "imports": ["lodash"],
      "source": "lodash"
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 5,
    "filePath": "app/components/FeatureComponent.tsx",
    "pattern": "ImportDeclaration"
  }
}
```

## Example 4: Regex Pattern (Use Client Directive)

### Pattern
```
^["']use client["']
```

### Code File
**File**: `app/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  return <div>Count: {count}</div>;
}
```

### Automatic Detection Process

1. **Read File**: LLM automatically reads `app/page.tsx`

2. **Analyze Code Structure**: LLM automatically identifies:
   - First line: `'use client';`
   - File is `page.tsx` (in app directory)

3. **Match Against Pattern**: LLM automatically matches:
   - ✅ `'use client'` (line 1, column 1)

4. **Context Verification**: LLM automatically verifies:
   - File is `page.tsx` (should be Server Component)
   - "use client" found at start of file
   - This is problematic

5. **Return Matches**:
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 1, "column": 1 },
        "end": { "line": 1, "column": 13 }
      },
      "codeSnippet": "'use client'",
      "nodeType": "Directive",
      "filePath": "app/page.tsx",
      "context": {
        "fileType": "page",
        "inAppDirectory": true,
        "shouldBeServerComponent": true
      }
    }
  ],
  "metadata": {
    "patternType": "regex",
    "totalMatches": 1,
    "filePath": "app/page.tsx",
    "pattern": "^[\"']use client[\"']"
  }
}
```

## Example 5: Complex Pattern (Multiple Conditions)

### Pattern
```
CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']
```

### Code File
**File**: `app/components/ComplexComponent.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';

export function ComplexComponent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Multiple navigation calls
  const handleAction1 = () => {
    router.push('/page1');
  };
  
  const handleAction2 = () => {
    router.replace('/page2');
  };
  
  // Navigation outside dialog (valid)
  const handleNormalNavigate = () => {
    router.push('/home');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <button onClick={handleAction1}>Action 1</button>
        <button onClick={handleAction2}>Action 2</button>
      </DialogContent>
    </Dialog>
  );
}
```

### Automatic Detection Process

1. **Read File**: LLM automatically reads `app/components/ComplexComponent.tsx`

2. **Analyze Code Structure**: LLM automatically identifies:
   - `router.push('/page1')` → CallExpression, callee.property.name='push'
   - `router.replace('/page2')` → CallExpression, callee.property.name='replace'
   - `router.push('/home')` → CallExpression, callee.property.name='push'
   - Dialog component context

3. **Match Against Pattern**: LLM automatically matches all three:
   - ✅ `router.push('/page1')` (line 11, column 5)
   - ✅ `router.replace('/page2')` (line 15, column 5)
   - ✅ `router.push('/home')` (line 20, column 5)

4. **Context Verification**: LLM automatically verifies:
   - `router.push('/page1')`: In dialog component, not closed before navigation
   - `router.replace('/page2')`: In dialog component, not closed before navigation
   - `router.push('/home')`: Not in dialog context (valid)

5. **Return Matches** (only problematic ones):
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 11, "column": 5 },
        "end": { "line": 11, "column": 25 }
      },
      "codeSnippet": "router.push('/page1')",
      "nodeType": "CallExpression",
      "filePath": "app/components/ComplexComponent.tsx",
      "context": {
        "inDialogComponent": true,
        "dialogClosedBeforeNavigation": false,
        "routerMethod": "push"
      }
    },
    {
      "location": {
        "start": { "line": 15, "column": 5 },
        "end": { "line": 15, "column": 26 }
      },
      "codeSnippet": "router.replace('/page2')",
      "nodeType": "CallExpression",
      "filePath": "app/components/ComplexComponent.tsx",
      "context": {
        "inDialogComponent": true,
        "dialogClosedBeforeNavigation": false,
        "routerMethod": "replace"
      }
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 2,
    "filePath": "app/components/ComplexComponent.tsx",
    "pattern": "CallExpression[callee.property.name='push'] | CallExpression[callee.property.name='replace']"
  }
}
```

## Key Takeaways

1. **Automatic Detection**: LLM automatically identifies AST nodes without manual commands
2. **Context Verification**: LLM automatically verifies matches are in problematic contexts
3. **Pattern Matching**: LLM automatically matches code against patterns from sub-agents
4. **Structured Output**: LLM automatically returns matches in pattern-matcher skill format
5. **Multiple Patterns**: LLM automatically handles `Pattern1 | Pattern2` syntax

## Related Documentation

- See `tools/ast-parser-guide.md` for usage workflow
- See `tools/automatic-pattern-detection.md` for pattern recognition details
- See `skills/pattern-matcher.md` for skill interface

