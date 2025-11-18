---
id: missing-dependencies
name: Missing Dependencies
description: Detects and fixes missing dependencies by analyzing imports and adding them to package.json
patterns:
  - missing-dependency
semanticKeywords:
  - missing dependency
  - package not found
  - module not found
  - cannot find module
  - import error
semanticDescription: Detects missing dependencies that are imported but not in package.json
instructionExamples:
  - Fix missing dependency
  - Package not found
  - Add missing dependency
  - Module not found error
detectionRule:
  type: ast
  pattern: ImportDeclaration | CallExpression[callee.name="require"]
fixCapabilities:
  - detect
  - getFix
  - applyFix
severity: error
skills:
  - pattern-matcher
context7:
  libraries:
    - npm
  topics:
    - package installation
    - dependencies
  fetchStrategy: on-demand
---

# Missing Dependencies Sub-Agent

## Overview

This sub-agent detects missing dependencies by analyzing import statements in code files and comparing them with package.json. It identifies packages that are imported but not listed in dependencies or devDependencies.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** to find imports:
   - `pattern`: "ImportDeclaration | CallExpression[callee.name='require']"
   - `ast`: [current file's AST]
   - `type`: "ast"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Analyze Imports**:
   - Extract package names from import statements
   - Check if package exists in package.json dependencies
   - Check if package exists in package.json devDependencies
   - Identify missing packages

4. **Return Detection Result**: If missing dependencies found:
   ```javascript
   {
     patternId: "missing-dependency",
     location: { start: { line, column }, end: { line, column } },
     description: "Package imported but not in package.json",
     packageName: "package-name",
     importType: "import" | "require",
     suggestedType: "dependencies" | "devDependencies"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch package documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "[package-name]"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "installation" or "usage"
   - `tokens`: 5000

### Step 2: Determine Dependency Type

1. **Check Package Type**:
   - If used in production code → `dependencies`
   - If used only in tests/build tools → `devDependencies`
   - If TypeScript types → `devDependencies` with `@types/` prefix

2. **Get Latest Version**: Use Context7 docs or npm registry to get latest compatible version

### Step 3: Apply Fix

#### Case 1: Missing Production Dependency

**Problem**:
```typescript
// app/page.tsx
import { Button } from 'antd';  // ❌ antd not in package.json
```

**Fix**:
```json
{
  "dependencies": {
    "antd": "^5.0.0"  // ✅ Add to dependencies
  }
}
```

#### Case 2: Missing Dev Dependency

**Problem**:
```typescript
// test/component.test.tsx
import { render } from '@testing-library/react';  // ❌ Not in package.json
```

**Fix**:
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0"  // ✅ Add to devDependencies
  }
}
```

#### Case 3: Missing Type Definitions

**Problem**:
```typescript
// app/utils.ts
import lodash from 'lodash';  // ❌ @types/lodash not in package.json
```

**Fix**:
```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.202"  // ✅ Add type definitions
  }
}
```

### Step 4: Validate Fix

- Verify all imports have corresponding dependencies
- Check dependency types are correct (dependencies vs devDependencies)
- Ensure version numbers are specified
- Verify package.json syntax is valid
- Check for duplicate entries

## Examples

### Before (Problematic Code)

```typescript
// app/components/Button.tsx
import { Button as AntButton } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';  // ❌ dayjs not in package.json
```

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
    // ❌ Missing: antd, dayjs
  }
}
```

### After (Fixed Code)

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "antd": "^5.12.0",  // ✅ Added
    "dayjs": "^1.11.10"  // ✅ Added
  }
}
```

## Implementation Notes

- Scan all code files for imports
- Distinguish between dependencies and devDependencies
- Add @types packages for TypeScript projects
- Use compatible version ranges
- Handle scoped packages (@org/package)
- Handle relative imports (don't add to package.json)

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Package installation instructions
- Version compatibility information
- TypeScript type definitions
- Package usage examples
