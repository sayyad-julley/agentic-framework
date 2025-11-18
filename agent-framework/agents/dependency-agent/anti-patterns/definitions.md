---
patterns:
  - id: version-mismatch
    name: Version Mismatch
    description: Incompatible dependency versions that cause conflicts, build failures, or runtime errors
    detectionRule:
      type: ast
      pattern: Property[key.name="dependencies"] | Property[key.name="devDependencies"] | Property[key.name="peerDependencies"]
    subAgent: version-mismatch
    severity: error
    semanticKeywords:
      - version mismatch
      - incompatible version
      - version conflict
      - peer dependency
    semanticDescription: Incompatible dependency versions
    examples:
      before: |
        {
          "dependencies": {
            "next": "^14.0.0",
            "react": "^17.0.0"
          }
        }
      after: |
        {
          "dependencies": {
            "next": "^14.0.0",
            "react": "^18.0.0"
          }
        }

  - id: missing-dependency
    name: Missing Dependency
    description: Package is imported in code but not listed in package.json dependencies or devDependencies
    detectionRule:
      type: ast
      pattern: ImportDeclaration | CallExpression[callee.name="require"]
    subAgent: missing-dependencies
    severity: error
    semanticKeywords:
      - missing dependency
      - package not found
      - module not found
    semanticDescription: Package imported but not in package.json
    examples:
      before: |
        // code.ts
        import { Button } from 'antd';
        
        // package.json - missing antd
      after: |
        {
          "dependencies": {
            "antd": "^5.0.0"
          }
        }
---

# Anti-Pattern Definitions

This file contains all dependency anti-pattern definitions for the Dependency Agent.

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

### 1. Version Mismatch

**ID**: `version-mismatch`

**Description**: Incompatible dependency versions that cause conflicts.

**Detection**: AST pattern matching for dependency properties in package.json

**Sub-Agent**: `version-mismatch`

**Severity**: error

### 2. Missing Dependency

**ID**: `missing-dependency`

**Description**: Package is imported but not in package.json.

**Detection**: AST pattern matching for import statements

**Sub-Agent**: `missing-dependencies`

**Severity**: error

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
