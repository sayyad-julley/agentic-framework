---
id: unnecessary-re-renders
name: Unnecessary Re-Renders
description: Fixes components that re-render unnecessarily by adding memoization (React.memo, useMemo, useCallback)
patterns:
  - unnecessary-re-render
semanticKeywords:
  - re-render
  - unnecessary render
  - performance
  - memoization
  - React.memo
  - useMemo
  - useCallback
  - optimization
semanticDescription: Fixes components that re-render unnecessarily, causing performance issues
instructionExamples:
  - Fix unnecessary re-renders
  - Component re-renders too often
  - Add memoization
  - Optimize component renders
detectionRule:
  type: ast
  pattern: FunctionDeclaration | ArrowFunctionExpression | FunctionExpression
fixCapabilities:
  - detect
  - getFix
  - applyFix
severity: warning
skills:
  - pattern-matcher
context7:
  libraries:
    - react
  topics:
    - performance
    - memoization
    - React.memo
    - useMemo
    - useCallback
  fetchStrategy: on-demand
---

# Unnecessary Re-Renders Sub-Agent

## Overview

This sub-agent fixes components that re-render unnecessarily by adding appropriate memoization techniques (React.memo, useMemo, useCallback). Unnecessary re-renders can cause performance issues, especially in large applications.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** to find components:
   - `pattern`: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
   - `ast`: [current file's AST]
   - `type`: "ast"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Analyze Component**:
   - Check if component receives props that change frequently
   - Check if component has expensive computations in render
   - Check if component passes functions as props without useCallback
   - Check if component is not memoized but should be

4. **Return Detection Result**: If component could benefit from memoization:
   ```javascript
   {
     patternId: "unnecessary-re-render",
     location: { start: { line, column }, end: { line, column } },
     description: "Component re-renders unnecessarily",
     componentName: "ComponentName",
     issueType: "missing-memo" | "missing-usememo" | "missing-usecallback"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch React documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "react"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "memoization" or "performance"
   - `tokens`: 5000

### Step 2: Apply Fix Based on Issue Type

#### Case 1: Component Not Memoized (React.memo)

**Problem**:
```typescript
export function ExpensiveComponent({ data, onUpdate }) {
  // Expensive computation
  const processed = data.map(item => expensiveOperation(item));
  return <div>{/* render */}</div>;
}
```

**Fix**:
```typescript
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data, onUpdate }) {
  // Expensive computation
  const processed = data.map(item => expensiveOperation(item));
  return <div>{/* render */}</div>;
});
```

#### Case 2: Expensive Computation in Render (useMemo)

**Problem**:
```typescript
function MyComponent({ items }) {
  // ❌ Expensive computation runs on every render
  const sorted = items.sort((a, b) => a.value - b.value);
  const filtered = sorted.filter(item => item.active);
  
  return <div>{filtered.map(item => <Item key={item.id} item={item} />)}</div>;
}
```

**Fix**:
```typescript
import { useMemo } from 'react';

function MyComponent({ items }) {
  // ✅ Expensive computation memoized
  const processed = useMemo(() => {
    const sorted = items.sort((a, b) => a.value - b.value);
    return sorted.filter(item => item.active);
  }, [items]);
  
  return <div>{processed.map(item => <Item key={item.id} item={item} />)}</div>;
}
```

#### Case 3: Function Passed as Prop Without useCallback

**Problem**:
```typescript
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ New function created on every render
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <ChildComponent onClick={handleClick} />;
}
```

**Fix**:
```typescript
import { useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // ✅ Function memoized with useCallback
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Empty deps if no dependencies
  
  return <ChildComponent onClick={handleClick} />;
}
```

### Step 3: Validate Fix

- Verify React.memo is used for components that receive stable props
- Ensure useMemo is used for expensive computations
- Check useCallback is used for functions passed as props
- Verify dependency arrays are correct
- Ensure no unnecessary re-renders remain

## Examples

### Before (Problematic Code)

```typescript
import { useState } from 'react';

function TodoList({ todos }) {
  // ❌ Expensive computation on every render
  const sortedTodos = todos.sort((a, b) => b.priority - a.priority);
  
  // ❌ New function on every render
  const handleToggle = (id) => {
    // toggle logic
  };
  
  return (
    <ul>
      {sortedTodos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={handleToggle} 
        />
      ))}
    </ul>
  );
}
```

### After (Fixed Code)

```typescript
import { useState, useMemo, useCallback } from 'react';
import { memo } from 'react';

const TodoItem = memo(function TodoItem({ todo, onToggle }) {
  return <li onClick={() => onToggle(todo.id)}>{todo.text}</li>;
});

function TodoList({ todos }) {
  // ✅ Expensive computation memoized
  const sortedTodos = useMemo(() => {
    return todos.sort((a, b) => b.priority - a.priority);
  }, [todos]);
  
  // ✅ Function memoized with useCallback
  const handleToggle = useCallback((id) => {
    // toggle logic
  }, []);
  
  return (
    <ul>
      {sortedTodos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={handleToggle} 
        />
      ))}
    </ul>
  );
}
```

## Implementation Notes

- Use React.memo for components that receive stable props
- Use useMemo for expensive computations
- Use useCallback for functions passed as props
- Always include correct dependency arrays
- Don't over-memoize (only when there's a performance benefit)

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- React.memo documentation
- useMemo hook documentation
- useCallback hook documentation
- React performance optimization best practices
