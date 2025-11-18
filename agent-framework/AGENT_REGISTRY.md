# Agent Registry

This file consolidates all agent metadata for quick loading and discovery. Load this file FIRST before processing any user query to ensure all agents are available in context.

## Quick Reference Table

| Agent ID | Name | Description | Capabilities | Sub-Agents |
|----------|------|-------------|--------------|------------|
| `hydration-agent` | Hydration Agent | Detects and fixes React/Next.js hydration issues | scan, detect, fix, autoDetectAndExecute | 3 |
| `performance-agent` | Performance Agent | Detects and fixes React/Next.js performance anti-patterns | scan, detect, fix, autoDetectAndExecute | 2 |
| `dependency-agent` | Dependency Agent | Detects and fixes dependency issues | scan, detect, fix, autoDetectAndExecute | 2 |

## Agent Details

### Hydration Agent

**Metadata:**
```yaml
id: hydration-agent
name: Hydration Agent
description: Detects and fixes React/Next.js hydration issues using static code analysis
version: 1.0.0
capabilities:
  - scan
  - detect
  - fix
  - autoDetectAndExecute
triggers:
  - hydration
  - client component
  - server component
  - use client
  - hydration error
  - hydration mismatch
  - dialog hydration
  - window access
semanticKeywords:
  - hydration
  - hydration error
  - hydration mismatch
  - client component
  - server component
  - window access
  - dialog hydration
  - use client
  - client-only ui
semanticDescription: Handles React and Next.js hydration issues including client/server component boundaries, window access, dialog hydration, and state management anti-patterns
filePatterns:
  - "*.tsx"
  - "*.ts"
  - "*.jsx"
  - "*.js"
context7:
  libraries:
    - react
    - next.js
    - react-dom
  topics:
    - hydration
    - server components
    - client components
    - useEffect
    - useState
  fetchStrategy: on-demand
```

**Sub-Agents:**
1. `dialog-navigation-bug.md` - Fixes dialogs that reopen on navigation
2. `client-only-ui-hydration.md` - Fixes window/document access without mounted check
3. `use-client-boundary.md` - Removes "use client" from page/layout files

**Location:** `agent-framework/agents/hydration-agent/agent.md`

---

### Performance Agent

**Metadata:**
```yaml
id: performance-agent
name: Performance Agent
description: Detects and fixes React/Next.js performance anti-patterns including unnecessary re-renders and large bundle sizes
version: 1.0.0
capabilities:
  - scan
  - detect
  - fix
  - autoDetectAndExecute
triggers:
  - performance
  - re-render
  - bundle size
  - optimization
  - slow
  - lag
  - memory leak
semanticKeywords:
  - performance
  - re-render
  - unnecessary render
  - bundle size
  - optimization
  - memoization
  - useMemo
  - useCallback
  - React.memo
semanticDescription: Handles React and Next.js performance issues including unnecessary re-renders, large bundle sizes, memory leaks, and optimization opportunities
filePatterns:
  - "*.tsx"
  - "*.ts"
  - "*.jsx"
  - "*.js"
context7:
  libraries:
    - react
    - next.js
  topics:
    - performance
    - optimization
    - memoization
    - bundle size
    - code splitting
  fetchStrategy: on-demand
```

**Sub-Agents:**
1. `unnecessary-re-renders.md` - Fixes components that re-render unnecessarily
2. `large-bundle-size.md` - Fixes large bundle sizes through code splitting and optimization

**Location:** `agent-framework/agents/performance-agent/agent.md`

---

### Dependency Agent

**Metadata:**
```yaml
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
```

**Sub-Agents:**
1. `version-mismatch.md` - Fixes incompatible dependency versions
2. `missing-dependencies.md` - Detects and fixes missing dependencies

**Location:** `agent-framework/agents/dependency-agent/agent.md`

---

## Skills Reference

### Pattern Matcher

**Metadata:**
```yaml
id: pattern-matcher
name: Pattern Matcher
description: Matches code patterns against AST or regex patterns for detecting anti-patterns
version: 1.0.0
category: analysis
```

**Usage:** Used by all agents for pattern detection. See `agent-framework/skills/pattern-matcher.md` for detailed usage instructions.

**Location:** `agent-framework/skills/pattern-matcher.md`

---

## Agent Matching Guide

### How to Match Queries to Agents

1. **Extract Keywords**: From user query, extract technical terms and concepts
2. **Check Triggers**: Match against agent `triggers` list (exact matches)
3. **Check Semantic Keywords**: Match against agent `semanticKeywords` list (semantic matches)
4. **Check Semantic Description**: Compare query intent with `semanticDescription`
5. **Rank Agents**: Score agents by relevance (exact trigger match > semantic keyword > description similarity)
6. **Select Agent(s)**: Choose highest scoring agent(s)

### Example Matches

- Query: "Fix hydration error" → **hydration-agent** (exact trigger match)
- Query: "Dialog reopens on navigation" → **hydration-agent** (semantic keyword: "dialog hydration")
- Query: "Component re-renders too much" → **performance-agent** (semantic keyword: "re-render")
- Query: "Bundle size is large" → **performance-agent** (semantic keyword: "bundle size")
- Query: "Version mismatch in dependencies" → **dependency-agent** (exact trigger match)
- Query: "Missing package error" → **dependency-agent** (semantic keyword: "missing dependency")

---

## Usage Instructions

### For LLM

1. **Load This Registry First**: Read this file at the start of every query
2. **Match Query to Agents**: Use the matching guide above
3. **Load Matched Agent**: Read the full `agent.md` file for matched agent(s)
4. **Load Sub-Agents**: Read sub-agent files based on query specificity
5. **Execute Agent Logic**: Follow agent instructions to detect and fix issues

### For Developers

- See `agent-framework/README.md` for framework overview
- See `agent-framework/.cursorrules` for detailed LLM instructions
- See `agent-framework/templates/` for creating new agents
- See `agent-framework/examples/` for usage examples

---

## Maintenance

This registry should be updated when:
- New agents are added
- Agent metadata changes
- Sub-agents are added or removed
- Skills are added or modified

**Last Updated:** Generated from agent files in `agent-framework/agents/`

