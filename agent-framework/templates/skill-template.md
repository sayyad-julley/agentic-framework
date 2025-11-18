---
id: skill-id
name: Skill Name
description: What this skill does and when to use it
version: 1.0.0
category: utility | analysis | transformation
parameters:
  - name: param1
    type: string
    description: Description of parameter
    required: true
  - name: param2
    type: object
    description: Description of parameter
    required: false
returns:
  type: object
  description: What the skill returns
usage:
  - agent: agent-name
  - subAgent: sub-agent-name
context7:
  libraries:
    - library-name
  topics:
    - topic1
  fetchStrategy: on-demand
---

# Skill Name

## Overview

Brief description of what this skill does, when to use it, and why it's useful. Skills are reusable utilities that sub-agents can call.

## Usage

### When to Use

Use this skill when:
- Condition 1
- Condition 2
- Condition 3

### How to Call

1. **Read This File**: Sub-agents should read this skill file to understand usage

2. **Call Skill** with parameters:
   ```javascript
   {
     param1: "value1",
     param2: { /* object */ }
   }
   ```

3. **Use Results**: Process the returned data as specified below

## Parameters

### param1 (required)

- **Type**: string
- **Description**: What this parameter is for
- **Example**: "example-value"

### param2 (optional)

- **Type**: object
- **Description**: What this parameter is for
- **Example**: `{ key: "value" }`

## Returns

The skill returns an object with:

- **result**: The main result data
- **metadata**: Additional information about the operation
- **errors**: Any errors encountered (if applicable)

## Examples

### Example 1: Basic Usage

```markdown
## Detection

Use the `skill-name` skill:

1. Read `skills/skill-name.md` for usage instructions
2. Call skill-name with:
   - param1: "value"
   - param2: { key: "value" }
3. Use results for detection
```

### Example 2: Advanced Usage

```markdown
## Fix Strategy

1. Use skill-name to analyze code
2. Process results
3. Apply fix based on skill output
```

## Implementation Details

### How It Works

Explain the internal logic of the skill (if relevant for understanding usage).

### Error Handling

- What errors can occur
- How to handle them
- Fallback strategies

## Context7 Integration

If this skill needs documentation:

1. Call `mcp_context7_resolve-library-id` with `libraryName: "[library-name]"`
2. Call `mcp_context7_get-library-docs` with:
   - `context7CompatibleLibraryID`: [resolved ID]
   - `topic`: "[topic]"
   - `tokens`: 5000

## Best Practices

- When to use this skill vs implementing directly
- Performance considerations
- Common pitfalls to avoid

## Related Skills

- Other skills that work well with this one
- Skills that provide similar functionality

## Notes

- Replace all placeholder text with actual content
- Follow the structure of example skills
- Document all parameters and return values
- Provide clear usage examples
- Include Context7 integration if needed
