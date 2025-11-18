---
id: pattern-matcher
name: Pattern Matcher
description: Matches code patterns against AST or regex patterns for detecting anti-patterns
version: 1.0.0
category: analysis
parameters:
  - name: pattern
    type: string
    description: AST pattern (e.g., "CallExpression[callee.property.name='push']") or regex pattern (e.g., "^[\"']use client[\"']")
    required: true
  - name: type
    type: string
    description: Pattern type - "ast" or "regex"
    required: true
  - name: ast
    type: object
    description: AST object (required for AST patterns)
    required: false
  - name: code
    type: string
    description: Source code string (required for regex patterns, optional for AST)
    required: false
  - name: filePath
    type: string
    description: File path for context
    required: false
returns:
  type: object
  description: Returns matches array with location, node, and context information
usage:
  - agent: hydration-agent
  - agent: performance-agent
  - agent: dependency-agent
context7:
  libraries:
    - babel
  topics:
    - ast parsing
    - pattern matching
  fetchStrategy: on-demand
---

**CRITICAL: Pattern-matcher is a conceptual workflow, NOT a tool. Do NOT search for a pattern-matcher tool. LLM performs mental AST analysis; no tools required.**

# Pattern Matcher Skill

## Overview

**Pattern-matcher is a conceptual workflow, NOT a tool. The LLM performs mental AST analysis of code structure; no tools are required.**

The pattern-matcher skill is a reusable utility for matching code patterns against AST (Abstract Syntax Tree) or regex patterns. It's used by sub-agents to detect anti-patterns in code. This skill provides a consistent interface for pattern matching across all agents.

## Usage

**DO NOT use grep/codebase_search. Use mental AST analysis.**

### When to Use

Use this skill when:
- You need to detect specific code patterns (AST nodes or text patterns)
- You're implementing detection logic in a sub-agent
- You need to find code locations matching a pattern
- You want consistent pattern matching across agents

## Automatic Workflow Rules

**CRITICAL**: Pattern-matcher workflow MUST be automatically followed when:
- Sub-agent frontmatter contains `skills: [pattern-matcher]`
- Sub-agent has `detectionRule` in frontmatter
- User query requires pattern detection

**MANDATORY PARAMETER EXTRACTION** (MUST HAPPEN FIRST):

**Step 1: Read Sub-Agent Frontmatter**
```yaml
detectionRule:
  type: ast
  pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
```

**Step 2: Extract Parameters** (MANDATORY - NO MANUAL CREATION):
- `pattern`: Extract EXACT value from `detectionRule.pattern`
  - Example: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
  - ❌ FORBIDDEN: Creating pattern manually or using LLM knowledge
- `type`: Extract EXACT value from `detectionRule.type`
  - Example: "ast"
  - ❌ FORBIDDEN: Guessing type or using default values
- `filePath`: Extract from target file path
  - Example: "activity-demo/app/home-client.tsx"

**Step 3: Read Target File**
- Use `read_file` tool to read target file
- Extract `code` from file content

**Step 4: Apply Pattern-Matcher Analysis** (MANDATORY):
- Apply pattern-matcher analysis with EXACT extracted parameters:
  - pattern: [from detectionRule.pattern - show exact value]
  - type: [from detectionRule.type - show exact value]
  - code: [from read_file]
  - filePath: [target file path]

**VALIDATION**: Before applying pattern-matcher analysis, verify:
- [ ] Can you show the exact `detectionRule.pattern` you extracted?
- [ ] Can you show the exact `detectionRule.type` you extracted?
- [ ] Are these values from sub-agent frontmatter, not from your knowledge?

**IF YOU CANNOT SHOW EXTRACTED VALUES**: Workflow is INVALID.

**AUTOMATIC WORKFLOW PROCESS**:

1. **Extract Parameters from Sub-Agent** (MANDATORY):
   - Read sub-agent frontmatter
   - Extract `detectionRule.pattern` (EXACT value, no modification)
   - Extract `detectionRule.type` (EXACT value, no modification)
   - Extract target file path from query/context

2. **Read Required Files**:
   - Read target file using `read_file` tool
   - Extract `code` from file content

3. **Automatic Analysis**:
   - LLM automatically performs mental AST analysis with extracted parameters
   - NO tools required
   - NO manual analysis
   - NO LLM knowledge usage
   - Pattern-matcher analysis is ONLY source

4. **Process Results**:
   - Use matches array from pattern-matcher analysis
   - Verify context using match metadata
   - Apply fixes based on match results ONLY

### How to Use (Automatic Detection)

**CRITICAL**: This skill uses automatic AST pattern detection. The LLM automatically performs mental AST analysis of code structure without manual commands. "Automatic" means LLM performs mental analysis, not tool invocation.

1. **Read Required Guides** (Automatic):
   - Read `tools/ast-parser-guide.md` for automatic detection workflow
   - Read `tools/automatic-pattern-detection.md` for pattern recognition details
   - Read this file for skill interface

2. **Automatic Detection Process**:
   - Read file content using `read_file` tool (automatic)
   - LLM automatically performs mental analysis of code structure to identify AST nodes
   - LLM automatically matches nodes against pattern from sub-agent's `detectionRule`
   - LLM automatically verifies context (useEffect, event handler, etc.)
   - LLM automatically returns matches in pattern-matcher format

3. **Pattern Matching** (Automatic):
   - For AST patterns: LLM automatically identifies code structures matching the pattern
   - For regex patterns: LLM uses regex matching on code string
   - LLM automatically extracts location, code snippet, and context

4. **Use Results**: Process the automatically returned matches array

### Automatic AST Pattern Detection

**For AST Patterns** (e.g., `CallExpression[callee.property.name='push']`):

1. **Read File**: Automatically use `read_file` tool
2. **Analyze Code**: Automatically identify:
   - Function calls: `router.push()` → CallExpression
   - Property access: `window.location` → MemberExpression
   - Import statements: `import ...` → ImportDeclaration
3. **Match Pattern**: Automatically compare identified nodes against pattern
4. **Verify Context**: Automatically check if match is in problematic location
5. **Return Matches**: Automatically format in pattern-matcher skill format

**Example Automatic Detection**:
- Pattern: `MemberExpression[object.name='window']`
- Code: `const width = window.innerWidth;`
- Automatic Detection: LLM identifies `window.innerWidth` as MemberExpression with object.name='window'
- Result: Match found with location and context

### Regex Pattern Detection

**For Regex Patterns** (e.g., `^["']use client["']`):

1. **Read File**: Automatically use `read_file` tool
2. **Apply Regex**: Automatically search code string with regex pattern
3. **Extract Matches**: Automatically find all matches with locations
4. **Return Matches**: Automatically format in pattern-matcher skill format

## Parameters

### pattern (required)

- **Type**: string
- **Description**: 
  - For AST: Pattern string in format like "CallExpression[callee.property.name='push']"
  - For regex: Regular expression string like "^[\"']use client[\"']"
- **Example AST**: "MemberExpression[object.name='window']"
- **Example Regex**: "^[\"']use client[\"']"

### type (required)

- **Type**: string
- **Description**: Pattern type - must be "ast" or "regex"
- **Example**: "ast"

### ast (optional, required for AST patterns)

- **Type**: object
- **Description**: Abstract Syntax Tree object (parsed code)
- **Example**: Parsed AST from @babel/parser

### code (optional, required for regex patterns)

- **Type**: string
- **Description**: Source code string to search
- **Example**: "const x = window.location.hash;"

### filePath (optional)

- **Type**: string
- **Description**: File path for context in results
- **Example**: "app/components/Button.tsx"

## Returns

The pattern-matcher analysis yields an object with:

```javascript
{
  matches: [
    {
      location: {
        start: { line: 10, column: 5 },
        end: { line: 10, column: 20 }
      },
      node: [AST node object],  // For AST patterns
      path: [Babel path object],  // For AST patterns
      codeSnippet: "window.location",  // Code snippet at location
      filePath: "path/to/file.tsx"
    }
  ],
  metadata: {
    patternType: "ast" | "regex",
    totalMatches: 1,
    filePath: "path/to/file.tsx"
  }
}
```

## Examples

### Example 1: AST Pattern Matching

```markdown
## Detection

Use the `pattern-matcher` skill:

1. Read `skills/pattern-matcher.md` for usage instructions
2. Apply pattern-matcher analysis with:
   - pattern: "CallExpression[callee.property.name='push']"
   - type: "ast"
   - ast: [current file's AST]
   - code: [current file's code]
   - filePath: [current file path]
3. Check matches array for detected patterns
4. Verify context (e.g., check if router.push is in dialog component)
```

### Example 2: Regex Pattern Matching

```markdown
## Detection

Use the `pattern-matcher` skill:

1. Read `skills/pattern-matcher.md` for usage instructions
2. Apply pattern-matcher analysis with:
   - pattern: "^[\"']use client[\"']"
   - type: "regex"
   - code: [current file's code]
   - filePath: [current file path]
3. Check matches array for detected patterns
4. Verify file is page.tsx or layout.tsx
```

## AST Pattern Syntax

AST patterns use a simplified selector syntax:

- **Node Type**: `CallExpression` (matches call expressions)
- **Property Access**: `[callee.property.name='push']` (matches property access)
- **Combined**: `CallExpression[callee.property.name='push']` (matches router.push() calls)
- **Multiple**: `MemberExpression[object.name='window'] | MemberExpression[object.name='document']` (matches window or document)

Common patterns:
- `CallExpression[callee.name='useState']` - useState calls
- `MemberExpression[object.name='window']` - window access
- `ImportDeclaration` - Import statements
- `FunctionDeclaration` - Function declarations

## Regex Pattern Syntax

Regex patterns use standard JavaScript regex:

- `^["']use client["']` - Matches "use client" at start of file
- `router\.push` - Matches router.push
- `window\.location` - Matches window.location

## Implementation Details

### How Automatic Detection Works

1. **AST Patterns** (Automatic - Mental Analysis):
   - LLM automatically reads file using `read_file` tool
   - LLM automatically performs mental analysis of code structure to identify AST nodes
   - LLM automatically matches nodes against pattern selector
   - LLM automatically verifies context (useEffect, event handler, etc.)
   - LLM automatically returns matching nodes with locations
   - **No tools required. LLM performs mental code structure analysis.**

2. **Regex Patterns** (Automatic - Mental Analysis):
   - LLM automatically reads file using `read_file` tool
   - LLM automatically performs mental regex matching on code string
   - LLM automatically finds all matches
   - LLM automatically returns match locations and code snippets
   - **No tools required. LLM performs mental code analysis.**

### Automatic Pattern Recognition

The LLM automatically recognizes code structures:

- **CallExpression**: `router.push()`, `useState()`, `useEffect()`
- **MemberExpression**: `window.location`, `document.body`, `router.push`
- **ImportDeclaration**: `import { useState } from 'react'`
- **VariableDeclaration**: `const x = ...`
- **FunctionDeclaration**: `function MyComponent() { ... }`

### Context Verification (Automatic)

After finding matches, LLM automatically verifies:

- **Window/Document Access**: Is it in useEffect? In event handler? In useState initial?
- **Router.push**: Is it in dialog component? Should dialog be closed first?
- **Import Statements**: Are imports missing from package.json?

### Error Handling

- If file not found: LLM automatically handles gracefully, returns empty matches
- If pattern is invalid: LLM automatically identifies issue, reports in metadata
- If code is empty: LLM automatically returns empty matches array
- If syntax error: LLM automatically identifies syntax issues, may still find some matches

## Context7 Integration

If you need documentation on AST parsing or pattern matching:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "babel"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "ast parsing" or "pattern matching"
   - `tokens`: 5000

## Best Practices

- **Automatic Detection**: LLM automatically detects patterns - no manual commands needed
- Use AST patterns for structural code analysis (automatic recognition)
- Use regex patterns for simple text matching (automatic regex search)
- Always verify matches in context automatically (LLM checks useEffect, event handlers, etc.)
- Check file type before applying patterns (automatic file type detection)
- Handle edge cases automatically (empty code, syntax errors, etc.)

## Automatic Detection Reference

For detailed instructions on automatic AST pattern detection:

- **Main Guide**: `tools/ast-parser-guide.md` - Complete automatic detection workflow
- **Pattern Reference**: `tools/automatic-pattern-detection.md` - Pattern recognition details
- **Examples**: `examples/automatic-ast-detection.md` - Complete examples

**CRITICAL**: The LLM automatically follows these guides - no manual command construction required.

## Related Skills

This skill is foundational and used by all sub-agents for pattern detection.

## Notes

- AST patterns are more precise but require parsed code
- Regex patterns are simpler but less precise
- Always validate matches in context
- Consider performance for large codebases
