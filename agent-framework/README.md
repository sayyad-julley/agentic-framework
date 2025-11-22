# Optimal Prompt Engineering Agent Framework

A markdown-based agent/sub-agent framework that implements optimal prompt engineering techniques from Context7 integration, with Context7 documentation fetching, reusable skills, and efficient context window management.

## Overview

This framework provides a pure markdown-based approach to building agents that can detect and fix code patterns and anti-patterns. All agent definitions, sub-agents, patterns, and skills are defined in markdown files with YAML frontmatter, making them easy to read, modify, and extend.

## Key Features

- **Markdown-Based**: All definitions in markdown files (no JavaScript framework code)
- **Context7 Integration**: Automatic documentation fetching via Context7 MCP
- **Reusable Skills**: Shared utilities like pattern-matcher for common operations
- **Semantic Matching**: Intelligent query-to-agent/sub-agent matching
- **Context Window Optimized**: Efficient token usage with progressive loading
- **Fallback Strategies**: Graceful degradation when services are unavailable
- **Extensible**: Add new agents by creating markdown files

## Quick Start

### 1. Understanding the Structure

```
agent-framework/
├── agents/              # Agent definitions
│   └── [agent-name]/
│       ├── agent.md     # Agent metadata and description
│       ├── sub-agents/   # Sub-agent definitions
│       └── anti-patterns/ # Pattern definitions
├── skills/              # Reusable utility skills
├── templates/           # Templates for creating new agents
└── examples/            # Usage examples
```

### 2. How It Works

1. **LLM Discovers Agents**: Reads `agents/*/agent.md` files
2. **Query Intent Detection**: Determines if query is reactive (fix) or proactive (create)
3. **Flow Selection**: Routes to Reactive Flow or Proactive Flow based on intent
4. **Semantic Matching**: Matches user queries to agents using semantic keywords
5. **Sub-Agent Selection**: Selects appropriate sub-agents based on query intent
6. **Pattern Detection**: Uses skills (like pattern-matcher) to detect patterns
7. **Documentation Fetching**: Fetches relevant docs via Context7 when needed
8. **Fix Application**: Applies fixes based on markdown instructions

### 3. Creating Your First Agent

1. Create a directory: `agents/my-agent/`
2. Create `agent.md` with YAML frontmatter (see `templates/agent-template.md`)
3. Create sub-agents in `sub-agents/` directory
4. Define patterns in `anti-patterns/definitions.md`

## Architecture

### Agent Hierarchy

```
Agent (Domain-Level)
  ├── Sub-Agent 1 (Specific Anti-Pattern 1)
  │   └── Uses Skills (e.g., pattern-matcher)
  ├── Sub-Agent 2 (Specific Anti-Pattern 2)
  └── Sub-Agent 3 (Specific Anti-Pattern 3)
```

### Components

- **Agents**: Domain-level handlers (e.g., Hydration Agent, Performance Agent)
- **Sub-Agents**: Specific pattern handlers within an agent
- **Skills**: Reusable utilities shared across sub-agents
- **Patterns**: Anti-pattern definitions with detection rules

## Context7 Integration

Every agent and sub-agent includes Context7 integration:

```yaml
context7:
  libraries:
    - react
    - next.js
  topics:
    - hydration
  fetchStrategy: on-demand
```

The framework automatically:
1. Extracts keywords from queries
2. Calls Context7 MCP tools to fetch documentation
3. Uses fetched docs as PRIMARY SOURCE for responses
4. Falls back to Document Retrieval System or Web Search if needed

## Skills

Skills are reusable utilities that sub-agents can use. Currently available:

- **pattern-matcher**: Match code patterns against AST or regex patterns

To use a skill in a sub-agent:
1. Read the skill's markdown file from `skills/`
2. Follow the usage instructions
3. Call the skill with appropriate parameters

## Operation Modes: Two Separate Flows

The framework supports two independent flows:

### Reactive Flow (Fix Existing Issues)
- **Trigger**: User asks to fix/solve/resolve an issue
- **Workflow**: Query → Agent Matching → Pattern Detection → Fix Application
- **Purpose**: Fix problems that already exist in codebase
- **Example**: "Fix hydration error" → Activates hydration-agent → Fixes issue

### Proactive Flow (Prevent Issues During Implementation)
- **Trigger**: User creates/builds/implements new code
- **Workflow**: File Detection → Agent Activation → **Real-Time Code Checking During Generation** → Immediate Fixes
- **Purpose**: Prevent issues during code creation by using agents/sub-agents/skills DURING code generation (interleaved)
- **Example**: "Create todo-app" → Activates agents → **Checks each code chunk during generation** → Applies fixes immediately before continuing

### Flow Selection
The framework automatically detects query intent and routes to the appropriate flow:
- Implementation keywords (create, build, implement) → Proactive Flow
- Fix keywords (fix, solve, error, bug) → Reactive Flow
- Both keywords present → Both flows executed sequentially

## Example Agents

### Hydration Agent
Detects and fixes React/Next.js hydration issues:
- Dialog navigation bugs
- Client-only UI hydration issues
- "use client" boundary issues

### Performance Agent
Detects and fixes performance anti-patterns:
- Unnecessary re-renders
- Large bundle sizes

### Dependency Agent
Detects and fixes dependency issues:
- Version mismatches
- Missing dependencies

## Usage

### For LLM (Automatic)

The framework is designed to work automatically with LLMs that can:
1. Read markdown files
2. Parse YAML frontmatter
3. Call Context7 MCP tools
4. Perform semantic matching
5. Apply code transformations

See `.cursorrules` for detailed LLM instructions.

### For Developers

1. **Read the Guide**: See `PROMPT_ENGINEERING_GUIDE.md` for techniques
2. **Use Templates**: Copy templates from `templates/` directory
3. **Follow Examples**: See `examples/usage-examples.md`
4. **Create Agents**: Add new agents in `agents/` directory
5. **Create Skills**: Add reusable skills in `skills/` directory

## Best Practices

1. **Keep Metadata Small**: Use YAML frontmatter for metadata (~200 tokens)
2. **Keep Examples Concise**: Brief examples in markdown (~500 tokens)
3. **Fetch Docs On-Demand**: Use Context7 for full documentation (~5000 tokens)
4. **Use Skills**: Don't duplicate logic, use reusable skills
5. **Implement Fallbacks**: Always have fallback strategies
6. **Document Versions**: Include version compatibility info
7. **Use Semantic Keywords**: For better matching

## Context Window Management

The framework uses progressive context building:

- **Level 1**: Agent metadata (frontmatter) - ~200 tokens
- **Level 2**: Sub-agent metadata - ~500 tokens
- **Level 3**: Pattern definitions - ~1000 tokens
- **Level 4**: Full docs via Context7 - ~5000 tokens (on-demand)

This ensures optimal token usage while maintaining comprehensive functionality.

## Dependencies

- Context7 MCP integration (configured in Cursor)
- Markdown with YAML frontmatter support
- LLM with file reading capabilities
- Babel AST parsing (for pattern matching)

## File Structure Details

### Agent Definition (`agent.md`)
- YAML frontmatter with metadata
- Overview and capabilities
- Context7 integration instructions
- Sub-agent references

### Sub-Agent Definition (`sub-agents/*.md`)
- YAML frontmatter with semantic keywords
- Detection rules
- Fix strategy with Context7 references
- Before/after examples

### Pattern Definition (`anti-patterns/definitions.md`)
- Pattern metadata
- Detection rules (AST/regex)
- Severity levels
- Sub-agent mapping

### Skill Definition (`skills/*.md`)
- Skill metadata
- Usage instructions
- Parameters and return values
- Examples

## Contributing

To add a new agent:
1. Create directory: `agents/[agent-name]/`
2. Create `agent.md` using `templates/agent-template.md`
3. Create sub-agents in `sub-agents/` directory
4. Define patterns in `anti-patterns/definitions.md`
5. Include Context7 integration metadata
6. Use skills for reusable operations

To add a new skill:
1. Create `skills/[skill-name].md`
2. Use `templates/skill-template.md` as reference
3. Document usage, parameters, and examples
4. Reference in sub-agents that need it

## Related Documentation

- `PROMPT_ENGINEERING_GUIDE.md`: Comprehensive guide on prompt engineering techniques
- `templates/`: Templates for creating new agents, sub-agents, patterns, and skills
- `examples/`: Usage examples and workflows
- `.cursorrules`: LLM instructions for agent discovery and usage

## License

MIT
