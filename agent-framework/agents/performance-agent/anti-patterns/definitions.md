---
patterns:
  - id: unnecessary-re-render
    name: Unnecessary Re-Render
    description: Component re-renders unnecessarily, causing performance issues. Should use React.memo, useMemo, or useCallback.
    detectionRule:
      type: ast
      pattern: FunctionDeclaration | ArrowFunctionExpression | FunctionExpression
    subAgent: unnecessary-re-renders
    severity: warning
    semanticKeywords:
      - re-render
      - unnecessary render
      - performance
      - memoization
    semanticDescription: Component re-renders unnecessarily
    examples:
      before: |
        function MyComponent({ items }) {
          const sorted = items.sort((a, b) => a.value - b.value);
          return <div>{sorted.map(item => <Item key={item.id} item={item} />)}</div>;
        }
      after: |
        import { useMemo } from 'react';
        function MyComponent({ items }) {
          const sorted = useMemo(() => items.sort((a, b) => a.value - b.value), [items]);
          return <div>{sorted.map(item => <Item key={item.id} item={item} />)}</div>;
        }

  - id: large-bundle-size
    name: Large Bundle Size
    description: Bundle size is too large, causing slow initial page loads. Should use code splitting and dynamic imports.
    detectionRule:
      type: ast
      pattern: ImportDeclaration
    subAgent: large-bundle-size
    severity: warning
    semanticKeywords:
      - bundle size
      - large bundle
      - code splitting
      - dynamic import
    semanticDescription: Large bundle size due to heavy imports
    examples:
      before: |
        import _ from 'lodash';
        import { HeavyChart } from '@/components/heavy-chart';
        function Dashboard() {
          return <HeavyChart />;
        }
      after: |
        import map from 'lodash/map';
        import dynamic from 'next/dynamic';
        const HeavyChart = dynamic(() => import('@/components/heavy-chart'));
        function Dashboard() {
          return <HeavyChart />;
        }
---

# Anti-Pattern Definitions

This file contains all performance anti-pattern definitions for the Performance Agent.

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

### 1. Unnecessary Re-Render

**ID**: `unnecessary-re-render`

**Description**: Component re-renders unnecessarily, causing performance issues.

**Detection**: AST pattern matching for function components

**Sub-Agent**: `unnecessary-re-renders`

**Severity**: warning

### 2. Large Bundle Size

**ID**: `large-bundle-size`

**Description**: Bundle size is too large, causing slow initial page loads.

**Detection**: AST pattern matching for import declarations

**Sub-Agent**: `large-bundle-size`

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
