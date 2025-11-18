---
id: dependency-agent
name: Dependency Agent
description: Detects and fixes dependency issues including version mismatches and missing dependencies
version: 1.0.0
capabilities:
  - scan
  - detect
  - fix
  - autoDetectAndExecute
triggers:
  - dependency
  - version
  - package.json
  - missing dependency
  - version mismatch
  - incompatible
  - install
semanticKeywords:
  - dependency
  - version
  - package.json
  - missing dependency
  - version mismatch
  - incompatible version
  - npm install
  - yarn install
semanticDescription: Handles dependency issues including version mismatches, missing dependencies, incompatible versions, and installation problems
filePatterns:
  - "package.json"
  - "package-lock.json"
  - "yarn.lock"
  - "*.ts"
  - "*.tsx"
  - "*.js"
  - "*.jsx"
context7:
  libraries:
    - npm
    - yarn
    - pnpm
  topics:
    - dependencies
    - version management
    - package management
    - compatibility
  fetchStrategy: on-demand
---

# Dependency Agent

## Overview

This agent detects and fixes dependency issues including version mismatches, missing dependencies, incompatible versions, and installation problems. It analyzes package.json files and code imports to identify dependency issues.

## Context7 Integration

Before applying fixes, you MUST fetch relevant documentation:

1. **Extract Keywords**: From the query, extract: "npm", "yarn", "dependency", "version", package names

2. **Fetch Documentation**:
   - Call `mcp_context7_resolve-library-id` with `libraryName: "npm"` or package name
   - For each resolved ID, call `mcp_context7_get-library-docs` with:
     - `context7CompatibleLibraryID`: [resolved ID]
     - `topic`: "dependencies" or "version management"
     - `tokens`: 5000

3. **Use Fetched Docs**: Use fetched documentation as PRIMARY SOURCE for fix strategies

## Capabilities

- **Scan**: Scans package.json and code files for dependency issues
- **Detect**: Detects version mismatches and missing dependencies
- **Fix**: Automatically fixes dependency issues
- **Auto-Detect and Execute**: Full automated workflow

## Sub-Agents

This agent includes the following sub-agents:

1. **Version Mismatch** (`version-mismatch.md`)
   - Fixes incompatible dependency versions
   - Uses pattern-matcher skill for version analysis

2. **Missing Dependencies** (`missing-dependencies.md`)
   - Detects and fixes missing dependencies
   - Uses pattern-matcher skill for import analysis

## Usage

The agent is automatically activated when queries contain dependency-related keywords such as:
- "dependency issue"
- "version mismatch"
- "missing dependency"
- "incompatible version"
- "package not found"

## Detection Strategy

The agent analyzes package.json files and code imports to detect dependency issues. See individual sub-agents for specific detection rules. All sub-agents use the `pattern-matcher` skill for pattern detection.

## Skills Used

- **pattern-matcher**: Used by all sub-agents for pattern matching and analysis

## Examples

### Example Query: "Fix version mismatch in dependencies"

1. Agent matches based on "version mismatch" keyword
2. Sub-agent "version-mismatch" matches (high relevance)
3. Version conflicts detected using pattern-matcher skill
4. Fixes applied: Update package.json with compatible versions
5. Documentation fetched via Context7 for package compatibility

### Example Query: "Missing dependency error"

1. Agent matches based on "missing dependency" keyword
2. Sub-agent "missing-dependencies" matches (high relevance)
3. Missing imports detected using pattern-matcher skill
4. Fixes applied: Add missing dependencies to package.json
5. Documentation fetched via Context7 for package installation

## Related Documentation

- See `PROMPT_ENGINEERING_GUIDE.md` for prompt engineering techniques
- See `skills/pattern-matcher.md` for pattern matching usage
- See `anti-patterns/definitions.md` for all pattern definitions
