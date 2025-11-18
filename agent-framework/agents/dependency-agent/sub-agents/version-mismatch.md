---
id: version-mismatch
name: Version Mismatch
description: Fixes incompatible dependency versions by updating package.json with compatible versions
patterns:
  - version-mismatch
semanticKeywords:
  - version mismatch
  - incompatible version
  - version conflict
  - peer dependency
  - dependency conflict
semanticDescription: Fixes incompatible dependency versions that cause conflicts
instructionExamples:
  - Fix version mismatch
  - Incompatible dependency versions
  - Version conflict
  - Update dependency versions
detectionRule:
  type: ast
  pattern: Property[key.name="dependencies"] | Property[key.name="devDependencies"] | Property[key.name="peerDependencies"]
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
    - version management
    - compatibility
    - peer dependencies
  fetchStrategy: on-demand
---

# Version Mismatch Sub-Agent

## Overview

This sub-agent fixes incompatible dependency versions by analyzing package.json files and updating versions to compatible ones. Version mismatches can cause build failures, runtime errors, and security vulnerabilities.

## Detection

### Using pattern-matcher Skill

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis. DO NOT use grep/codebase_search. Use mental AST analysis.**

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** to analyze package.json:
   - `pattern`: "Property[key.name='dependencies'] | Property[key.name='devDependencies'] | Property[key.name='peerDependencies']"
   - `ast`: [package.json AST]
   - `type`: "ast"
   - `code`: [package.json content]
   - `filePath`: "package.json"

3. **Analyze Versions**:
   - Check for conflicting version ranges
   - Check for peer dependency mismatches
   - Check for incompatible major versions
   - Check for outdated packages

4. **Return Detection Result**: If version conflicts found:
   ```javascript
   {
     patternId: "version-mismatch",
     location: { start: { line, column }, end: { line, column } },
     description: "Incompatible dependency versions",
     package: "package-name",
     currentVersion: "1.0.0",
     requiredVersion: "2.0.0",
     conflictType: "peer-dependency" | "major-version" | "range-conflict"
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch package documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "[package-name]"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "version" or "compatibility"
   - `tokens`: 5000

### Step 2: Apply Fix Based on Conflict Type

#### Case 1: Peer Dependency Mismatch

**Problem**:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^17.0.0"  // ❌ Mismatch with react@18
  }
}
```

**Fix**:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0"  // ✅ Match react version
  }
}
```

#### Case 2: Major Version Conflict

**Problem**:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^17.0.0"  // ❌ Next.js 14 requires React 18
  }
}
```

**Fix**:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",  // ✅ Compatible with Next.js 14
    "react-dom": "^18.0.0"
  }
}
```

#### Case 3: Range Conflict

**Problem**:
```json
{
  "dependencies": {
    "package-a": "^1.0.0",
    "package-b": "^2.0.0"  // ❌ Requires package-a@^2.0.0
  }
}
```

**Fix**:
```json
{
  "dependencies": {
    "package-a": "^2.0.0",  // ✅ Update to compatible version
    "package-b": "^2.0.0"
  }
}
```

### Step 3: Validate Fix

- Verify all dependencies are compatible
- Check peer dependency requirements are met
- Ensure major versions are compatible
- Verify no circular dependencies
- Check package.json syntax is valid

## Examples

### Before (Problematic Code)

```json
{
  "name": "my-app",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^17.0.0",
    "react-dom": "^17.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^17.0.0",
    "@types/react-dom": "^17.0.0"
  }
}
```

**Issues**:
- Next.js 14 requires React 18
- @tanstack/react-query v5 requires React 18
- Type definitions don't match React version

### After (Fixed Code)

```json
{
  "name": "my-app",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

**Fixes**:
- Updated React to 18.2.0 (compatible with Next.js 14)
- Updated React DOM to match React version
- Updated type definitions to match React version

## Implementation Notes

- Always check peer dependency requirements
- Update related packages together (e.g., react and react-dom)
- Verify compatibility with framework versions (e.g., Next.js)
- Use compatible version ranges (^, ~)
- Document breaking changes if major version update

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Package version compatibility matrices
- Peer dependency requirements
- Framework compatibility guides
- Migration guides for major version updates
