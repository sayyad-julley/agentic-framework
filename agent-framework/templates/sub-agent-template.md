---
id: sub-agent-id
name: Sub-Agent Name
description: What this sub-agent fixes
patterns:
  - pattern-id
semanticKeywords:
  - keyword1
  - keyword2
  - related-term
semanticDescription: Natural language description of what this sub-agent fixes
instructionExamples:
  - Example query 1
  - Example query 2
  - Fix [issue type]
detectionRule:
  type: ast | regex
  pattern: pattern string
fixCapabilities:
  - detect
  - getFix
  - applyFix
severity: error | warning | info
skills:
  - pattern-matcher
context7:
  libraries:
    - library-name
  topics:
    - specific-topic
  fetchStrategy: on-demand
---

# Sub-Agent Name

## Overview

Brief description of what this sub-agent fixes and why it's important. Explain the anti-pattern it addresses.

## Detection

**Pattern-matcher is a conceptual workflow, NOT a tool. DO NOT use grep/codebase_search.**

## Automatic Pattern-Matcher Workflow

**MANDATORY**: When this sub-agent is selected, pattern-matcher workflow MUST be automatically followed.

**Analysis Parameters** (Extracted from detectionRule):
- pattern: `[detectionRule.pattern]`
- type: `[detectionRule.type]`
- code: `[from read_file tool]`
- filePath: `[target file path]`

**LLM MUST**:
1. Read `tools/ast-parser-guide.md`
2. Read `tools/automatic-pattern-detection.md`
3. Read `skills/pattern-matcher.md`
4. Automatically follow pattern-matcher workflow with above parameters
5. LLM performs mental AST analysis (no tools required)
6. Use matches array as ONLY source for detection
7. NO manual analysis allowed
8. DO NOT use grep/codebase_search

### Using pattern-matcher Skill

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** with:
   - `pattern`: "[AST or regex pattern]"
   - `ast`: [current file's AST] (for AST patterns)
   - `type`: "ast" or "regex"
   - `code`: [current file's code]
   - `filePath`: [current file path]

3. **Check Context**: Verify the pattern matches in problematic context:
   - Check surrounding code
   - Verify it's not a false positive
   - Confirm it matches the anti-pattern

4. **Return Detection Result**: If pattern matches:
   ```javascript
   {
     patternId: "pattern-id",
     location: { start: { line, column }, end: { line, column } },
     description: "Description of the issue",
     // Additional context-specific fields
   }
   ```

## Fix Strategy

### Step 1: Fetch Documentation

Before applying fix, fetch relevant documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "[library-name]"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "[specific-topic]"
   - `tokens`: 5000

### Step 2: Apply Fix

1. **Analyze Code**: Understand the current implementation
2. **Apply Transformation**: Follow step-by-step fix instructions
3. **Preserve Functionality**: Ensure fix doesn't break existing behavior
4. **Validate**: Check that fix resolves the issue

### Step 3: Validate Fix

- Verify fix resolves the anti-pattern
- Ensure no syntax errors
- Check that functionality is preserved
- Verify no new issues introduced

## Examples

**CRITICAL**: These examples are the PRIMARY source for fix application. LLM MUST use these examples before using general knowledge.

### Before (Problematic Code)

```typescript
// ❌ Problematic code example
// MUST be specific and match the anti-pattern exactly
// LLM will use this to identify issues
```

### After (Fixed Code)

```typescript
// ✅ Fixed code example
// MUST show exact fix pattern
// LLM MUST copy this pattern when applying fixes
// Include exact imports, exact component structure, exact hooks usage
```

**Usage Instructions for LLM**:

1. When applying fix, FIRST check if detected issue matches "Before" example
2. If match found, use EXACT pattern from "After" example
3. Copy exact import statements from "After" example
4. Copy exact component structure from "After" example
5. Only use general knowledge if no match found in examples

## Implementation Notes

- Use AST transformation when possible
- Preserve code structure and formatting
- Handle edge cases
- Document any assumptions or limitations

## Related Patterns

See `anti-patterns/definitions.md` for the full pattern definition.

## Context7 Documentation

When applying fixes, reference:
- Relevant library documentation
- Best practices guides
- Migration guides if applicable

## Notes

- Replace all placeholder text with actual content
- Follow the structure of example sub-agents
- Include detailed detection and fix instructions
- Provide clear before/after examples
- Document Context7 integration
