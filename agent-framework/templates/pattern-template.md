---
patterns:
  - id: pattern-id
    name: Pattern Name
    description: What the anti-pattern is and why it's problematic
    detectionRule:
      type: ast | regex
      pattern: pattern string
    subAgent: sub-agent-id
    severity: error | warning | info
    semanticKeywords:
      - keyword1
      - keyword2
    semanticDescription: Natural language description of the pattern
    examples:
      before: |
        // Problematic code example
      after: |
        // Fixed code example
---

# Pattern Definitions

This file contains all anti-pattern definitions for [Agent Name].

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

### 1. Pattern Name

**ID**: `pattern-id`

**Description**: Brief description of the anti-pattern.

**Detection**: AST or regex pattern matching description

**Sub-Agent**: `sub-agent-id`

**Severity**: error | warning | info

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

## Notes

- Replace all placeholder text with actual content
- Follow the structure of example pattern definitions
- Include clear detection rules
- Provide helpful before/after examples
- Document severity levels appropriately
