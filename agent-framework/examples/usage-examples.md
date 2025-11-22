# Usage Examples

This document provides comprehensive examples of how the agent framework works, including agent discovery, semantic matching, Context7 integration, and fix application workflows.

## Example 1: Agent Discovery Workflow

### Scenario: User asks "Fix hydration issues in my code"

**Step 1: Discover Agents**
```
1. LLM lists agent-framework/agents/ directory
2. Finds: hydration-agent/, performance-agent/, dependency-agent/
3. Reads each agent.md file
4. Extracts metadata from YAML frontmatter
```

**Step 2: Semantic Matching**
```
Query: "Fix hydration issues in my code"
Keywords: ["hydration", "issues", "fix"]
Intent: fix
Domain: hydration

Matches:
- hydration-agent: HIGH (keywords match, domain matches)
- performance-agent: LOW (no match)
- dependency-agent: LOW (no match)

Selected: hydration-agent
```

**Step 3: Sub-Agent Discovery**
```
1. Reads agents/hydration-agent/sub-agents/ directory
2. Finds: dialog-navigation-bug.md, client-only-ui-hydration.md, use-client-boundary.md
3. Reads each sub-agent file
4. Extracts metadata from YAML frontmatter
```

**Step 4: Sub-Agent Matching**
```
Query: "Fix hydration issues in my code"
Keywords: ["hydration", "issues"]

Matches:
- dialog-navigation-bug: MEDIUM (hydration-related)
- client-only-ui-hydration: HIGH (hydration keyword, common issue)
- use-client-boundary: MEDIUM (hydration-related)

Selected: client-only-ui-hydration (highest relevance)
```

## Example 2: Context7 Integration Workflow

### Scenario: Sub-agent needs React documentation

**Step 1: Extract Keywords**
```
From query/context: ["react", "hydration", "useEffect", "useState"]
Primary keyword: "react"
```

**Step 2: Fetch Documentation**
```
1. Call mcp_context7_resolve-library-id with libraryName: "react"
   → Returns: "/facebook/react"

2. Call mcp_context7_get-library-docs with:
   - context7CompatibleLibraryID: "/facebook/react"
   - topic: "hydration"
   - tokens: 5000
   → Returns: React hydration documentation

3. Use fetched docs as PRIMARY SOURCE for fix strategy
```

**Step 3: Fallback (if Context7 fails)**
```
1. Context7 MCP fails
2. Try Document Retrieval System:
   - Call mcp_document-retrieval-system_search_documents
   - Call mcp_document-retrieval-system_get_document_context
3. If that fails, try Web Search
4. If all fail, use existing knowledge (with note about potential outdated info)
```

## Example 3: Pattern Detection Workflow

### Scenario: Detect window access in render

**Step 1: Read Skill**
```
1. Sub-agent reads skills/pattern-matcher.md
2. Understands usage instructions
3. Gets parameter format
```

**Step 2: Apply Pattern-Matcher Analysis**
```
Apply pattern-matcher analysis with:
{
  pattern: "MemberExpression[object.name='window']",
  type: "ast",
  ast: [file's AST],
  code: [file's code],
  filePath: "app/components/LoginDialog.tsx"
}
```

**Step 3: Process Results**
```
Pattern-matcher analysis yields:
{
  matches: [
    {
      location: { start: { line: 5, column: 20 }, end: { line: 5, column: 35 } },
      node: [AST node],
      codeSnippet: "window.location.hash",
      filePath: "app/components/LoginDialog.tsx"
    }
  ]
}
```

**Step 4: Verify Context**
```
1. Check if window access is in render (not in useEffect)
2. Check if it's used in useState initial value
3. Confirm it's a hydration issue
4. Return detection result
```

## Example 3.5: Automatic Pattern-Matcher Workflow with detectionRule (MANDATORY)

### Scenario: Sub-agent requires pattern-matcher - Automatic workflow with detectionRule parameters

**CRITICAL**: This example demonstrates the MANDATORY automatic workflow process with detectionRule extraction. NO manual analysis allowed. **Pattern-matcher is a conceptual workflow, NOT a tool.**

**Step 1: Extract Parameters from detectionRule** (MANDATORY):
```
Sub-Agent Frontmatter (unnecessary-re-renders.md):
  detectionRule:
    type: ast
    pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"

Extracted Parameters (MUST SHOW EXACT VALUES):
  - pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression" (from detectionRule.pattern)
  - type: "ast" (from detectionRule.type)
  - filePath: "activity-demo/app/home-client.tsx" (from query/context)

VALIDATION:
✓ Can show exact detectionRule.pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
✓ Can show exact detectionRule.type: "ast"
✓ Can confirm these are from sub-agent frontmatter, not LLM knowledge
```

**Step 2: Read Required Files** (MANDATORY):
```
AUTOMATIC FILE READING (Cannot skip):
1. Read tools/ast-parser-guide.md ✓
2. Read tools/automatic-pattern-detection.md ✓
3. Read skills/pattern-matcher.md ✓
4. Read activity-demo/app/home-client.tsx using read_file tool ✓
   - Extract code: [full file content]
```

**Step 3: Automatic Pattern-Matcher Workflow** (MANDATORY):
```
LLM AUTOMATICALLY FOLLOWS pattern-matcher workflow with EXTRACTED PARAMETERS:

{
  pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression",  // FROM detectionRule.pattern
  type: "ast",  // FROM detectionRule.type
  code: [from read_file - full file content],
  filePath: "activity-demo/app/home-client.tsx"
}

VALIDATION: Can you show these exact parameters came from detectionRule? YES
- pattern source: detectionRule.pattern in unnecessary-re-renders.md
- type source: detectionRule.type in unnecessary-re-renders.md

NO MANUAL ANALYSIS:
- ❌ NO manual code scanning
- ❌ NO LLM knowledge usage
- ❌ NO grep/codebase_search
- ✅ ONLY pattern-matcher workflow with extracted parameters
```

**Step 5: Process Matches (AUTOMATIC)**
```
Pattern-Matcher Analysis Yields:
{
  matches: [
    {
      location: { start: { line: 12, column: 0 }, end: { line: 45, column: 1 } },
      codeSnippet: "const Counter: React.FC<CounterProps> = ({ label }) => { ... }",
      nodeType: "ArrowFunctionExpression",
      filePath: "app/home-client.tsx",
      context: {
        isComponent: true,
        receivesProps: true,
        notMemoized: true
      }
    },
    {
      location: { start: { line: 47, column: 0 }, end: { line: 80, column: 1 } },
      codeSnippet: "export function HomeClient() { ... }",
      nodeType: "FunctionDeclaration",
      filePath: "app/home-client.tsx",
      context: {
        isComponent: true,
        notMemoized: true
      }
    }
  ],
  metadata: {
    patternType: "ast",
    totalMatches: 2,
    filePath: "app/home-client.tsx"
  }
}
```

**Step 4: Use Sub-Agent Examples for Fix** (MANDATORY):
```
Sub-Agent Example (unnecessary-re-renders.md):

Before:
```typescript
const Counter: React.FC<CounterProps> = ({ label }) => {
  const handleClick = () => { ... };
  return <Button onClick={handleClick} />;
}
```

After:
```typescript
import { memo, useCallback } from 'react';

const Counter: React.FC<CounterProps> = memo(({ label }) => {
  const handleClick = useCallback(() => { ... }, []);
  return <Button onClick={handleClick} />;
});
```

LLM MUST:
1. Match detected issue to "Before" example
2. Apply EXACT pattern from "After" example
3. Use exact imports: `import { memo, useCallback } from 'react';`
4. Use exact structure: `memo(({ label }) => { ... })`
5. Use exact hook: `useCallback(() => { ... }, [])`

USING MATCHES ARRAY AS ONLY SOURCE:
- Match 1: Counter component (from pattern-matcher)
  - Issue: Not memoized (from match context)
  - Matches "Before" example: Component without memo
  - Apply "After" example: Wrap with memo, use useCallback

NO MANUAL PATTERN IDENTIFICATION:
- ✅ Use matches array from pattern-matcher
- ✅ Apply fixes using EXACT pattern from sub-agent "After" example
- ❌ NO manual analysis
- ❌ NO general knowledge when sub-agent examples exist
```

**Step 5: Validation (MANDATORY)**
```
Before responding, verify:
- [x] Pattern-matcher workflow automatically followed? YES
- [x] Parameters extracted from detectionRule? YES
  - Can show exact detectionRule.pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
  - Can show exact detectionRule.type: "ast"
- [x] AST parser guides read? YES
- [x] Matches returned in pattern-matcher format? YES
- [x] Context verified using pattern-matcher results? YES
- [x] Sub-agent examples read? YES
- [x] Fix applied using exact pattern from "After" example? YES

TRACEABILITY:
✓ Can trace to pattern-matcher automatic invocation
✓ Can show exact parameters from detectionRule (with source)
✓ Can show matches array from pattern-matcher
✓ Can point to exact sub-agent example used for fix
✓ Can confirm AST guides were read

RESULT: Workflow is VALID
```

**Key Points**:
- Parameters MUST come from detectionRule (not LLM knowledge)
- Fixes MUST follow sub-agent examples (not general knowledge)
- General examples are FALLBACK only (when sub-agent examples don't exist)
- Full traceability required (can show exact source for every decision)
- Pattern-matcher is AUTOMATICALLY invoked - no manual trigger needed
- All parameters extracted from sub-agent frontmatter
- AST parser guides MUST be read before invocation
- Matches array is ONLY source for pattern detection
- NO manual code analysis allowed

## Example 4: Fix Application Workflow

### Scenario: Fix window access in useState

**Step 1: Read Fix Strategy**
```
1. Read sub-agent markdown file (client-only-ui-hydration.md)
2. Find "Fix Strategy" section
3. Read step-by-step instructions
```

**Step 2: Fetch Documentation**
```
1. Call Context7 to fetch React useEffect/useState docs
2. Get best practices for client-only code
```

**Step 3: Apply Fix**
```
Before:
```typescript
const hashCheck = typeof window !== 'undefined' && window.location.hash === "#login";
const [open, setOpen] = useState(hashCheck);
```

After:
```typescript
const [open, setOpen] = useState(false);

useEffect(() => {
  const hashCheck = window.location.hash === "#login";
  setOpen(hashCheck);
  
  const handleHashChange = () => {
    setOpen(window.location.hash === "#login");
  };
  window.addEventListener("hashchange", handleHashChange);
  return () => window.removeEventListener("hashchange", handleHashChange);
}, []);
```
```

**Step 4: Validate**
```
1. Check syntax is correct
2. Verify functionality is preserved
3. Ensure no new issues introduced
4. Report results to user
```

## Example 5: Context Window Management

### Progressive Loading Example

**Level 1: Agent Metadata (~200 tokens)**
```
Read only YAML frontmatter from agent.md:
- id, name, description
- triggers, semanticKeywords
- capabilities
```

**Level 2: Sub-Agent Metadata (~500 tokens)**
```
Read only YAML frontmatter from matched sub-agent:
- id, name, description
- semanticKeywords, instructionExamples
- detectionRule, fixCapabilities
```

**Level 3: Pattern Definitions (~1000 tokens)**
```
Read anti-patterns/definitions.md for matched patterns:
- Pattern definitions
- Detection rules
- Examples
```

**Level 4: Full Documentation (~5000 tokens, on-demand)**
```
Fetch via Context7 only when needed:
- React documentation
- Next.js documentation
- Library-specific guides
```

**Total Token Usage**: ~200 + ~500 + ~1000 = 1700 tokens (before documentation)
**With Documentation**: ~6700 tokens (only when needed)

## Example 6: Multi-Agent Scenario

### Scenario: "Fix performance and dependency issues"

**Step 1: Query Analysis**
```
Query: "Fix performance and dependency issues"
Keywords: ["performance", "dependency", "issues"]
Intent: fix
Domains: performance, dependency
```

**Step 2: Multi-Agent Matching**
```
Matches:
- performance-agent: HIGH (performance keyword)
- dependency-agent: HIGH (dependency keyword)
- hydration-agent: LOW (no match)

Selected: performance-agent, dependency-agent
```

**Step 3: Parallel Processing**
```
1. Process performance-agent:
   - Match sub-agents
   - Detect patterns
   - Apply fixes

2. Process dependency-agent:
   - Match sub-agents
   - Detect patterns
   - Apply fixes

3. Report combined results
```

## Example 7: Skill Usage in Sub-Agent

### Scenario: Using pattern-matcher in dialog-navigation-bug sub-agent

**In sub-agent markdown:**
```markdown
## Detection

### Using pattern-matcher Skill

1. **Read Skill**: Read `skills/pattern-matcher.md` for usage instructions

2. **Apply pattern-matcher analysis** with:
   - pattern: "CallExpression[callee.property.name='push']"
   - ast: [current file's AST]
   - type: "ast"
   - code: [current file's code]
   - filePath: [current file path]

3. **Check Context**: Verify router.push is in dialog component

4. **Return Detection Result**: If pattern matches
```

**LLM Execution:**
```
1. Reads skills/pattern-matcher.md
2. Understands how to call the skill
3. Calls pattern-matcher with correct parameters
4. Processes results
5. Validates in context
6. Returns detection result
```

## Example 8: Error Handling

### Scenario: Context7 MCP fails

**Step 1: Try Primary Strategy**
```
Call mcp_context7_resolve-library-id → FAILS
```

**Step 2: Fallback to Document Retrieval**
```
Call mcp_document-retrieval-system_search_documents → SUCCESS
Use retrieved documents
```

**Step 3: Report to User**
```
"Fixed hydration issue. Note: Used document retrieval system as Context7 was unavailable."
```

## Best Practices Demonstrated

1. **Progressive Context Building**: Load only what's needed at each level
2. **Context7 Integration**: Always fetch docs before applying fixes
3. **Fallback Strategies**: Never fail completely, always have alternatives
4. **Skill Reusability**: Use pattern-matcher instead of duplicating logic
5. **Semantic Matching**: Match based on intent, not just keywords
6. **Explicit Instructions**: Clear, numbered steps for LLM to follow

## Example 9: Reactive Flow - Fix Hydration Error

### Scenario: User asks "Fix hydration error in my code"

**Step 1: Flow Selection**
```
Query: "Fix hydration error in my code"
Intent: Fix (keyword: "fix")
Flow: Reactive
```

**Step 2: Reactive Flow Execution**
```
R1: Match query → hydration-agent (high relevance)
R2: Discover sub-agents → client-only-ui-hydration.md
R3: Match sub-agent → client-only-ui-hydration (high relevance)
R4: Detect patterns → window access in useState
R5: Fetch docs → React hydration documentation
R6: Apply fix → Move window access to useEffect
```

**Result**: Fixed existing hydration error

---

## Example 10: Proactive Flow - Create Todo App

### Scenario: User asks "Create todo-app with React"

**Step 1: Flow Selection**
```
Query: "Create todo-app with React"
Intent: Implementation (keyword: "create")
Flow: Proactive
```

**Step 2: Proactive Flow Execution (Interleaved During Code Generation)**
```
P1: Detect files → React components (*.tsx)
P2: Activate agents → hydration-agent, performance-agent
P3: Load sub-agents → All proactive-enabled sub-agents

P4-P6: DURING Code Generation (Interleaved):
  
  Chunk 1: Generate TodoList component
    → P4: Detect window access in useState (hydration issue)
    → P5: Fetch React hydration docs
    → P6: Fix immediately → Move to useEffect
    → Continue with fixed code
  
  Chunk 2: Generate TodoItem component
    → P4: Detect missing memoization (performance issue)
    → P5: Fetch React performance docs
    → P6: Fix immediately → Add React.memo
    → Continue with fixed code
  
  Chunk 3: Generate handlers
    → P4: Detect missing useCallback (performance issue)
    → P5: Fetch React hooks docs
    → P6: Fix immediately → Add useCallback
    → Continue with fixed code
```

**Result**: Created todo-app with proactive fixes applied DURING generation (not after)

---

## Example 11: Both Flows - Create and Fix

### Scenario: User asks "Create login page and fix hydration error"

**Step 1: Flow Selection**
```
Query: "Create login page and fix hydration error"
Intent: Both (keywords: "create" + "fix")
Flow: Both (Proactive first, then Reactive)
```

**Step 2: Proactive Flow Execution**
```
P1-P6: Create login page with proactive fixes
```

**Step 3: Reactive Flow Execution**
```
R1-R6: Fix existing hydration error
```

**Result**: Created login page (proactive) and fixed existing error (reactive)

## Example 12: Skill-Assisted Development with Interleaved Pattern

### Scenario: Implement Mintlify documentation site

This example demonstrates the complete interleaved guidance pattern (Before/During/After) for skill-assisted development.

**Query**: "Implement Mintlify in root folder"

**Phase 6 Execution**:

**Step 1: Query Analysis**
```
Intent: Set up Mintlify documentation site
Keywords: ["mintlify", "implement", "documentation"]
Scope: Create docs folder, docs.json, initial pages
```

**Step 2: Agent Matching (Phase 1)**
```
Query matches: agent-skills (keyword: "implement")
Agent capabilities: route, discover, select
```

**Step 3: Skill Discovery**
```
Scans skills-hms/ directory
Matches: mintlify-documentation
- Keyword: "mintlify" → name contains "mintlify" → 8 points
- Semantic: Query intent matches skill description → 9 points
- Combined: (8 × 0.6) + (9 × 0.4) = 8.4
Selected: mintlify-documentation (score: 8.4)
```

**Step 4: Skill Loading**
```
Reads mintlify-documentation/SKILL.md

Extracted Patterns:
- Pattern 1: OpenAPI Validation Workflow (2-step validation)
- Pattern 2: Path Conflict Resolution (x-mint extension)
- Pattern 3: Performance-Optimized Custom Components

Extracted Best Practices:
- Always include $schema reference for validation
- Select theme strategically (maple for AI/SaaS)
- Define navigation structure based on content organization

Extracted Workarounds:
- Workaround 1: CORS Configuration for API Playground
- Workaround 2: Custom UI Element Targeting (with maintenance debt)
- Workaround 3: File/Operation Conflict Resolution

Extracted Anti-Patterns:
- Anti-Pattern 1: OpenAPI 2.0 Usage (results in blank pages)
- Anti-Pattern 2: Path Mismatch (trailing slash differences)
- Anti-Pattern 3: Case Sensitivity Failure (lowercase HTTP methods)
- Anti-Pattern 4: Partial Inclusion Pitfall (mixing auto/manual)
- Anti-Pattern 5: File/Operation Conflict (MDX file vs OpenAPI operation)
```

**Step 5: Interleaved Code Generation**

**Code Block 1: Create docs.json**

**Before Code Block**:
```
[Skill Instruction Reference]: "Always include $schema reference for validation and autocomplete"
[Pattern Identified]: None (initial setup)
[Best Practice Identified]: Include $schema, select theme strategically
[Anti-Pattern Noted]: No OpenAPI 2.0 references, no path mismatches (not applicable yet)
[Workaround Checked]: Not applicable for initial setup
```

**During Code Generation**:
```
[Apply Best Practice]: Include $schema reference
Generate: { "$schema": "https://mintlify.com/docs.json", ... }

[Apply Best Practice]: Select theme strategically (maple for modern, clean)
Generate: "theme": "maple"

[Apply Best Practice]: Define navigation structure based on content organization
Generate: "navigation": [ { "group": "Getting Started", "pages": [...] } ]
```

**After Code Block**:
```
[Verify Anti-Pattern]: OpenAPI 2.0 Usage - ✓ Not present (no OpenAPI yet)
[Verify Anti-Pattern]: Path Mismatch - ✓ Not applicable (no OpenAPI yet)
[Verify Best Practice]: $schema included - ✓ Verified
[Verify Best Practice]: Theme selected - ✓ Verified (maple)
[Verify Pattern]: None applied - ✓ N/A
```

**Code Block 2: Create introduction.mdx**

**Before Code Block**:
```
[Skill Instruction Reference]: Basic MDX page structure
[Pattern Identified]: None (simple page)
[Best Practice Identified]: Use frontmatter for metadata
[Anti-Pattern Noted]: No OpenAPI path mismatches (not applicable)
[Workaround Checked]: Not applicable
```

**During Code Generation**:
```
[Apply Best Practice]: Use frontmatter for page metadata
Generate:
---
title: Introduction
description: Welcome to the documentation
---

# Introduction
...
```

**After Code Block**:
```
[Verify Anti-Pattern]: All anti-patterns checked - ✓ None applicable
[Verify Best Practice]: Frontmatter used - ✓ Verified
[Verify Pattern]: None applied - ✓ N/A
```

**Code Block 3: Future OpenAPI Integration (Example)**

**Before Code Block**:
```
[Skill Instruction Reference]: "OpenAPI 3.x only - OpenAPI 2.0 results in blank pages"
[Pattern Identified]: Pattern 1: OpenAPI Validation Workflow
[Best Practice Identified]: Validate OpenAPI 3.x before integration
[Anti-Pattern Noted]: OpenAPI 2.0 Usage MUST be avoided
[Workaround Checked]: Not applicable
```

**During Code Generation**:
```
[Apply Pattern]: OpenAPI Validation Workflow
- Step 1: Run mint dev locally to reveal configuration issues
- Step 2: Validate externally with Swagger Editor

[Apply Best Practice]: Ensure OpenAPI is 3.x
Generate: openapi: path/to/openapi.yaml (ensuring it's 3.x)

[Apply Anti-Pattern Prevention]: Verify OpenAPI version is 3.x, not 2.0
Check: openapi.yaml version field is "3.0.0" or "3.1.0"
```

**After Code Block**:
```
[Verify Anti-Pattern]: OpenAPI 2.0 Usage - ✓ Avoided (verified 3.x)
[Verify Anti-Pattern]: Path Mismatch - ✓ Checked (paths match exactly)
[Verify Anti-Pattern]: Case Sensitivity - ✓ Checked (HTTP methods uppercase)
[Verify Best Practice]: OpenAPI 3.x validated - ✓ Verified
[Verify Pattern]: Validation workflow applied - ✓ Verified
```

**Result**: 
- All skill patterns applied during development
- All best practices followed
- All anti-patterns verified and avoided
- Workarounds documented when applicable
- Complete interleaved guidance pattern demonstrated

**Key Takeaways**:
1. **Before Each Code Block**: Reference skill instructions, identify patterns/best practices/anti-patterns
2. **During Code Generation**: Apply patterns, follow best practices, implement workarounds
3. **After Code Blocks**: Verify anti-patterns avoided, best practices followed, patterns correctly applied
4. **Throughout**: Continuously reference skill instructions, maintain pattern compliance

## Notes

- All examples follow the framework's prompt engineering techniques
- Context window is optimized through progressive loading
- Skills are used for reusable operations
- Context7 is integrated throughout for up-to-date documentation
- Fallback strategies ensure reliability
- Framework supports both reactive (fix) and proactive (prevent) flows
- **Phase 6 (Skill-Assisted Development)**: Uses interleaved guidance pattern (Before/During/After) to apply patterns, best practices, workarounds, and avoid anti-patterns during development

