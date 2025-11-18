# Optimal Prompt Engineering Techniques for Agent/Sub-Agent Framework

## Overview

This guide documents optimal prompt engineering techniques derived from Context7 integration and best practices for building effective agent/sub-agent frameworks with optimal context window management.

## 1. Prompt Engineering Techniques from Context7 Integration

### A. Keyword Extraction & Semantic Matching

**Technique**: Extract meaningful keywords from queries, remove stop words, prioritize technical terms

**Implementation Pattern**:
- Remove stop words (the, a, an, how, what, etc.)
- Extract technical terms, library names, and concepts
- Identify multi-word phrases (e.g., "react hooks", "state management")
- Prioritize longer, more specific terms
- Extract 3-5 most relevant keywords

**Example**:
```
Query: "how to use react hooks"
Extracted Keywords: ["react-hooks", "react", "hooks"]
```

**Best Practice**: Extract keywords FIRST, then use them for Context7 searches and semantic matching

### B. Context Injection Pattern

**Technique**: Pre-process queries and inject instructions before AI sees the query

**Implementation Pattern**:
- Use clear visual separators (╔═══╗) for instructions
- Provide explicit, numbered tool calls
- Emphasize PRIMARY SOURCE usage
- Include fallback strategies

**Example Format**:
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CONTEXT7 DOCUMENTATION FETCH REQUIRED                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

**AUTOMATIC INSTRUCTION**: Before answering, you MUST:
1. Call mcp_context7_resolve-library-id
2. Call mcp_context7_get-library-docs
3. Use fetched docs as PRIMARY SOURCE
```

**Best Practice**: Always include explicit instructions with tool names and parameters

### C. Multi-Tier Fallback Strategy

**Technique**: Primary → Fallback 1 → Fallback 2 → Final fallback

**Implementation**:
1. **Primary**: Context7 MCP tools
2. **Fallback 1**: Document Retrieval System MCP
3. **Fallback 2**: Web Search
4. **Final Fallback**: Existing knowledge

**Best Practice**: Always have fallbacks, gracefully handle failures

### D. Structured Tool Call Instructions

**Technique**: Generate explicit, numbered tool calls with parameters

**Implementation Pattern**:
```
**REQUIRED ACTIONS** (execute in order):
1. Call mcp_context7_resolve-library-id with:
   - libraryName: "react"
2. Call mcp_context7_get-library-docs with:
   - context7CompatibleLibraryID: [result from step 1]
   - tokens: 5000
```

**Best Practice**: Use placeholders for dynamic values, provide examples

## 2. Patterns & Anti-Patterns

### Patterns (Good Practices)

#### Pattern 1: Semantic Keyword Matching
```yaml
semanticKeywords:
  - dialog
  - navigation
  - reopen
semanticDescription: Fixes dialogs that incorrectly reopen when navigating
instructionExamples:
  - Fix dialog reopening when navigating
  - Dialog opens when I navigate back
```

#### Pattern 2: Context Window Optimization
- Use structured frontmatter for metadata (small, ~200 tokens)
- Keep examples concise in markdown (medium, ~500 tokens)
- Reference external docs instead of embedding (large, ~5000 tokens on-demand)

#### Pattern 3: Progressive Disclosure
- **Agent Level**: High-level overview
- **Sub-Agent Level**: Specific pattern details
- **Pattern Level**: Detection rules and fixes

### Anti-Patterns (Bad Practices)

#### Anti-Pattern 1: Overloading Context Window
```markdown
❌ BAD: Embedding entire documentation in prompts
✅ GOOD: Using Context7 to fetch docs on-demand

❌ BAD: Including all examples in every prompt
✅ GOOD: Using instructionExamples array for matching
```

#### Anti-Pattern 2: Vague Instructions
```markdown
❌ BAD: "Fix the issue"
✅ GOOD: "Call mcp_context7_resolve-library-id with libraryName: 'react'"

❌ BAD: "Use the agent"
✅ GOOD: "Read agent.md from agents/hydration-agent/ and match query semantically"
```

#### Anti-Pattern 3: No Fallback Strategy
```markdown
❌ BAD: Assuming Context7 MCP always works
✅ GOOD: Try Context7 → Document Retrieval → Web Search → Knowledge
```

## 3. Best Practices & Workarounds

### Best Practice 1: Context Window Management

**Strategy**: Use markdown files with YAML frontmatter
- **Metadata in frontmatter** (small, structured, ~200 tokens)
- **Examples in markdown** (readable, concise, ~500 tokens)
- **Full docs via Context7** (on-demand, up-to-date, ~5000 tokens)

**Implementation**:
```markdown
---
id: agent-id
semanticKeywords: [keyword1, keyword2]
---
# Agent Description (concise)
## Examples (brief)
## Full docs fetched via Context7 when needed
```

### Best Practice 2: Prompt Chunking

**Strategy**: Break complex prompts into steps
1. **Discovery phase**: Read agent.md files (~200 tokens)
2. **Matching phase**: Semantic analysis (~300 tokens)
3. **Execution phase**: Read sub-agent files (~500 tokens)
4. **Fix phase**: Apply transformations (~1000 tokens)
5. **Documentation phase**: Fetch via Context7 (~5000 tokens, on-demand)

### Best Practice 3: Explicit Instructions

**Pattern from Context7**:
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CONTEXT7 DOCUMENTATION FETCH REQUIRED                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

**AUTOMATIC INSTRUCTION**: Before answering, you MUST:
1. Extract keywords from query
2. Call mcp_context7_resolve-library-id for each keyword
3. Call mcp_context7_get-library-docs for resolved IDs
4. Use fetched docs as PRIMARY SOURCE
```

### Workaround 1: Version Compatibility Issues

**Problem**: Different stack versions have different APIs

**Solution**: Use Context7 to fetch version-specific docs
```markdown
# In agent prompt:
"Fetch documentation for [library] version [version] using Context7"
```

### Workaround 2: Dependency Conflicts

**Problem**: Conflicting dependency versions

**Solution**: Document in agent metadata
```yaml
dependencies:
  required:
    - "@babel/parser@^7.24.0"
    - "@babel/traverse@^7.24.0"
  compatible:
    - "next@^14.0.0"
```

## 4. Common Issues & Solutions

### Issue 1: Version Mismatches

**Pattern**: Stack version incompatibilities
- **Detection**: Check package.json versions
- **Solution**: Use Context7 to fetch version-specific docs
- **Prevention**: Document compatible versions in agent metadata

### Issue 2: Dependency Installation Failures

**Pattern**: Missing or incompatible dependencies
- **Detection**: Check node_modules, package-lock.json
- **Solution**: Document exact versions, use Context7 for installation guides
- **Prevention**: Include dependency checks in agent initialization

### Issue 3: Context Window Overflow

**Pattern**: Too much context in prompts
- **Detection**: Monitor token usage
- **Solution**: Use markdown files, fetch docs on-demand
- **Prevention**: Keep prompts concise, use references

## 5. Context Window Management Strategies

### Strategy 1: Lazy Loading
- Load agent metadata first (small, ~200 tokens)
- Load sub-agent files only when matched (medium, ~500 tokens)
- Fetch full docs via Context7 when needed (large, ~5000 tokens, on-demand)

### Strategy 2: Hierarchical Context
```
Level 1: Agent metadata (frontmatter) - ~200 tokens
Level 2: Sub-agent metadata - ~500 tokens
Level 3: Pattern definitions - ~1000 tokens
Level 4: Full documentation (Context7) - ~5000 tokens (on-demand)
```

### Strategy 3: Token Budget Allocation
- **Agent Discovery**: 500 tokens
- **Query Matching**: 300 tokens
- **Sub-Agent Selection**: 500 tokens
- **Fix Execution**: 1000 tokens
- **Documentation Fetch**: 5000 tokens (via Context7, on-demand)

## 6. Optimal Prompting Techniques for Agents/Sub-Agents

### Technique 1: Structured Metadata (YAML Frontmatter)
```yaml
---
id: agent-id
semanticKeywords: [keyword1, keyword2]
semanticDescription: Natural language description
instructionExamples:
  - Example query 1
  - Example query 2
---
```

### Technique 2: Explicit Tool Call Instructions
```
**REQUIRED ACTIONS** (execute in order):
1. Call mcp_context7_resolve-library-id with libraryName: "react"
2. Call mcp_context7_get-library-docs with context7CompatibleLibraryID: [result from step 1]
3. Use fetched docs as PRIMARY SOURCE
```

### Technique 3: Semantic Matching Prompts
```
Analyze query: "[user query]"
Extract keywords: [keyword extraction]
Match against agents: [semantic comparison]
Select agent: [agent selection with reasoning]
```

### Technique 4: Progressive Context Building
```
Step 1: Read agent.md (metadata only)
Step 2: If matched, read sub-agents/ directory
Step 3: If sub-agent matched, read pattern definitions
Step 4: If fix needed, fetch docs via Context7
```

## 7. Skills Integration

### Using Skills in Sub-Agents

Skills are reusable utilities that sub-agents can call. Example:

```markdown
## Detection

Use the `pattern-matcher` workflow to match AST patterns:

**Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis.**

1. Read `skills/pattern-matcher.md` for usage instructions
2. Apply pattern-matcher analysis with:
   - pattern: "CallExpression[callee.property.name='push']"
   - ast: [current AST]
   - type: "ast"
3. Use match results for detection
```

## 8. Do's and Don'ts Summary

### Do's:
✅ Use YAML frontmatter for metadata  
✅ Keep markdown content concise  
✅ Use Context7 for full documentation  
✅ Implement fallback strategies  
✅ Use explicit, numbered instructions  
✅ Monitor context window usage  
✅ Document version compatibility  
✅ Use skills for reusable utilities  

### Don'ts:
❌ Embed full docs in prompts  
❌ Use vague instructions  
❌ Assume tools always work  
❌ Overload context window  
❌ Skip fallback mechanisms  
❌ Ignore version compatibility  
❌ Hallucinate solutions  
❌ Duplicate skill logic in sub-agents  

## 9. Implementation Template

### Agent Prompt Structure
```markdown
---
# Metadata (small, ~200 tokens)
---
# Overview (concise)
## Context7 Integration (instructions)
## Sub-Agents (list with links)
## Usage (brief examples)
```

### Sub-Agent Prompt Structure
```markdown
---
# Metadata (small, ~200 tokens)
---
# Detection (rules, use skills)
## Fix Strategy (step-by-step, Context7 refs)
## Examples (before/after)
```

### Skill Prompt Structure
```markdown
---
# Metadata (small, ~200 tokens)
---
# Overview (what it does)
## Usage (how to call)
## Parameters (input/output)
## Examples (usage examples)
```

## 10. Context7 Integration Best Practices

### Always Include Context7 Instructions
Every agent/sub-agent should include:
```yaml
context7:
  libraries:
    - library-name
  topics:
    - topic1
  fetchStrategy: on-demand
```

### Automatic Documentation Fetching
Instruct LLM to:
1. Extract keywords from query
2. Call `mcp_context7_resolve-library-id` for each keyword
3. Call `mcp_context7_get-library-docs` for resolved IDs
4. Use fetched docs as PRIMARY SOURCE

### Fallback Chain
Always provide fallback:
1. Context7 MCP (primary)
2. Document Retrieval System MCP (fallback 1)
3. Web Search (fallback 2)
4. Existing knowledge (final fallback)

## Conclusion

These prompt engineering techniques ensure:
- Optimal context window usage
- Reliable documentation fetching
- Effective semantic matching
- Graceful error handling
- Extensible framework design

Apply these techniques consistently across all agents, sub-agents, and skills for best results.
