---
id: your-agent-id
name: Your Agent Name
description: Brief description of what this agent does
version: 1.0.0
capabilities:
  - scan
  - detect
  - fix
  - autoDetectAndExecute
triggers:
  - keyword1
  - keyword2
  - keyword3
semanticKeywords:
  - keyword1
  - keyword2
  - related-term1
  - related-term2
semanticDescription: Natural language description of what this agent handles, including domain and scope
filePatterns:
  - "*.tsx"
  - "*.ts"
  - "*.jsx"
  - "*.js"
context7:
  libraries:
    - library-name1
    - library-name2
  topics:
    - topic1
    - topic2
  fetchStrategy: on-demand
---

# Your Agent Name

## Overview

Brief description of what this agent does and why it's useful. Explain the domain and types of issues it handles.

## Context7 Integration

Before applying fixes, you MUST fetch relevant documentation:

1. **Extract Keywords**: From the query, extract relevant keywords related to this agent's domain

2. **Fetch Documentation**:
   - Call `mcp_context7_resolve-library-id` with `libraryName: "[library-name]"`
   - For each resolved ID, call `mcp_context7_get-library-docs` with:
     - `context7CompatibleLibraryID`: [resolved ID]
     - `topic`: "[relevant-topic]"
     - `tokens`: 5000

3. **Use Fetched Docs**: Use fetched documentation as PRIMARY SOURCE for fix strategies

## Capabilities

- **Scan**: Scans directories for issues
- **Detect**: Detects issues in specific code
- **Fix**: Automatically fixes detected issues
- **Auto-Detect and Execute**: Full automated workflow

## Sub-Agents

This agent includes the following sub-agents:

1. **Sub-Agent 1** (`sub-agent-1.md`)
   - Description of what it fixes
   - Uses pattern-matcher skill for detection

2. **Sub-Agent 2** (`sub-agent-2.md`)
   - Description of what it fixes
   - Uses pattern-matcher skill for detection

## Usage

The agent is automatically activated when queries contain relevant keywords such as:
- "keyword1 issue"
- "keyword2 problem"
- "related-term1 error"

## Detection Strategy

The agent uses AST parsing and pattern matching to detect anti-patterns. See individual sub-agents for specific detection rules. All sub-agents use the `pattern-matcher` skill for pattern detection.

## Skills Used

- **pattern-matcher**: Used by all sub-agents for AST and regex pattern matching

## Examples

### Example Query: "Fix [issue type]"

1. Agent matches based on keywords
2. Sub-agents are discovered and matched semantically
3. Patterns are detected using pattern-matcher skill
4. Fixes are applied based on sub-agent instructions
5. Results are reported to user

## Related Documentation

- See `PROMPT_ENGINEERING_GUIDE.md` for prompt engineering techniques
- See `skills/pattern-matcher.md` for pattern matching usage
- See `anti-patterns/definitions.md` for all pattern definitions

## Notes

- Replace all placeholder text with actual content
- Follow the structure and format of example agents
- Include Context7 integration instructions
- Document all sub-agents
- Provide clear examples
