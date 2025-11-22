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

## Execution Steps

Provide step-by-step instructions for implementing the feature or system. Each step should include:

1. **Step 1: [Step Name]**
   - Description of what this step accomplishes
   - **Critical Practices**: Best practices specific to this step
   - Code examples or configuration examples
   - Common mistakes to avoid

2. **Step 2: [Step Name]**
   - Continue with additional steps...

**Critical Practices** (can be in Execution Steps or separate section):
- Always include [specific practice]
- Select [option] strategically: [option1] (use case), [option2] (use case)
- Define [structure] based on [organization principle]

## Common Patterns

Document proven patterns that should be applied during implementation. Each pattern should include:

### Pattern 1: [Pattern Name]

**Description**: What this pattern accomplishes and when to use it.

**Implementation Steps**:
1. Step 1 of pattern implementation
2. Step 2 of pattern implementation
3. Step 3 of pattern implementation

**Example**:
```code
// Example code showing pattern implementation
```

**When to Use**: Specific conditions when this pattern should be applied.

### Pattern 2: [Pattern Name]

[Repeat structure for additional patterns]

## Best Practices

Document best practices that should be followed during implementation. These can be:
- General best practices for the technology/system
- Best practices specific to execution steps (included in "Critical Practices")
- Performance best practices
- Security best practices

**Best Practice Examples**:
- Use [approach] for [purpose]
- Always [action] when [condition]
- Avoid [action] because [reason]

## Workarounds

Document workarounds for limitations or issues. Each workaround should include:

### Workaround 1: [Workaround Name]

**When**: Specific conditions when this workaround should be used.

**Action**: Step-by-step implementation of the workaround.

**Trade-offs**: 
- Maintenance debt: [description]
- Limitations: [description]
- Future considerations: [description]

**Example**:
```code
// Example code showing workaround implementation
```

### Workaround 2: [Workaround Name]

[Repeat structure for additional workarounds]

## Anti-Patterns to Avoid

Document anti-patterns that should be avoided during implementation. Each anti-pattern should include:

### Anti-Pattern 1: [Anti-Pattern Name]

**Issue**: What problem this anti-pattern causes.

**Example**: Code example showing the anti-pattern.

**Resolution**: How to avoid or fix this anti-pattern.

**Detection**: How to identify if this anti-pattern is present.

### Anti-Pattern 2: [Anti-Pattern Name]

[Repeat structure for additional anti-patterns]

**Summary Table** (optional):

| Anti-Pattern | Issue | Resolution |
|--------------|------|------------|
| Anti-Pattern 1 | [Issue] | [Resolution] |
| Anti-Pattern 2 | [Issue] | [Resolution] |

## Transformation Rules

Document any transformation rules that should be followed:

1. **Rule 1**: [Description of transformation rule]
2. **Rule 2**: [Description of transformation rule]
3. **Rule 3**: [Description of transformation rule]

## Related Skills

- Other skills that work well with this one
- Skills that provide similar functionality

## Notes

- Replace all placeholder text with actual content
- Follow the structure of example skills
- Document all parameters and return values
- Provide clear usage examples
- Include Context7 integration if needed
- **Structure for Interleaved Guidance**: Ensure sections (Common Patterns, Best Practices, Workarounds, Anti-Patterns) are clearly marked and easy to extract for Phase 6 workflow
- **Section Naming**: Use exact section names ("Common Patterns", "Best Practices", "Workarounds", "Anti-Patterns to Avoid") to support automatic extraction
