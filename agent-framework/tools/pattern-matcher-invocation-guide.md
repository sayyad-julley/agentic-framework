**CRITICAL: Pattern-matcher is a conceptual workflow, NOT a tool. Do NOT search for a pattern-matcher tool. LLM performs mental AST analysis; no tools required. DO NOT use grep/codebase_search. Use mental AST analysis.**

# Pattern-Matcher Workflow Guide

## When to Follow Pattern-Matcher Workflow

Pattern-matcher workflow MUST be automatically followed when:
1. Sub-agent is selected
2. Sub-agent frontmatter contains `skills: [pattern-matcher]`
3. Sub-agent has `detectionRule` in frontmatter
4. User query requires pattern detection

## Forbidden Actions (MUST READ FIRST)

**STRICTLY FORBIDDEN**:
- ❌ **DO NOT use grep/codebase_search instead of pattern-matcher workflow**
- ❌ Manual code analysis using LLM knowledge
- ❌ Using LLM knowledge to identify patterns
- ❌ Skipping pattern-matcher workflow
- ❌ Not reading AST parser guides before workflow
- ❌ Using existing knowledge for pattern detection
- ❌ Constructing manual commands - detection is automatic

## Pattern-Matcher Workflow Steps

### Step 1: Extract Parameters from detectionRule (AUTOMATIC - MANDATORY - BLOCKING)

**CRITICAL**: Parameters MUST be extracted from sub-agent's `detectionRule` frontmatter. NO manual creation allowed.

**BLOCKING VALIDATION**: This step MUST be completed BEFORE any tool calls. You CANNOT proceed to pattern detection until parameters are extracted and displayed.

**Example Sub-Agent Frontmatter**:
```yaml
detectionRule:
  type: ast
  pattern: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
```

**Extraction Process** (MUST FOLLOW EXACTLY):

1. **Read Sub-Agent File**: Read sub-agent markdown file
2. **Locate detectionRule**: Find `detectionRule` in YAML frontmatter
3. **Extract pattern** (MANDATORY):
   - Read `detectionRule.pattern`
   - Copy EXACT value: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression"
   - ❌ FORBIDDEN: Modifying, guessing, or creating pattern manually
4. **Extract type** (MANDATORY):
   - Read `detectionRule.type`
   - Copy EXACT value: "ast"
   - ❌ FORBIDDEN: Using default or guessing type
5. **Extract filePath**:
   - From query context or file analysis
   - Example: "activity-demo/app/home-client.tsx"

**MANDATORY DISPLAY STEP** (CANNOT SKIP):
After extraction, you MUST explicitly display all three parameters:

```
Extracted Parameters:
- pattern: "[EXACT PATTERN FROM detectionRule.pattern]"
- type: "[EXACT TYPE FROM detectionRule.type]"
- filePath: "[EXACT PATH FROM CONTEXT]"
```

**Example Display**:
```
Extracted Parameters:
- pattern: "MemberExpression[object.name='window'] | MemberExpression[object.name='document']"
- type: "ast"
- filePath: "activity-demo/app/home-client.tsx"
```

**Validation Before Workflow** (MUST ANSWER ALL):
- [ ] Can you show the exact `detectionRule.pattern` you extracted? (Must show exact string - DISPLAY IT)
- [ ] Can you show the exact `detectionRule.type` you extracted? (Must show exact string - DISPLAY IT)
- [ ] Can you show the exact `filePath` you extracted? (Must show exact path - DISPLAY IT)
- [ ] Are all three values from sub-agent frontmatter/context? (Must confirm source)
- [ ] Did you display all three parameters explicitly? (Must show displayed values)

**IF YOU CANNOT SHOW EXTRACTED VALUES**: STOP. Do NOT proceed. Return to extraction step.

**PRE-TOOL VALIDATION** (MUST COMPLETE BEFORE ANY TOOL CALLS):
Before calling grep, codebase_search, or any other tool for pattern detection:

1. **Check**: Have you extracted and displayed all three parameters?
   - If NO: STOP. Extract and display parameters first.
   - If YES: Proceed to next check

2. **Check**: Is pattern-matcher workflow required?
   - Check sub-agent frontmatter for `skills: [pattern-matcher]`
   - Check if `detectionRule` exists
   - If YES: You MUST use pattern-matcher workflow, NOT tools
   - If NO: Document why pattern-matcher is not required

3. **Check**: Are you about to call grep/codebase_search for pattern detection?
   - If YES and pattern-matcher is required: STOP. Use pattern-matcher workflow instead.
   - If NO: Proceed with appropriate action

**BLOCKING RULE**: If pattern-matcher workflow is required, you CANNOT call grep/codebase_search. You MUST use pattern-matcher workflow.

**Extracted Parameters** (Example):
- `pattern`: "FunctionDeclaration | ArrowFunctionExpression | FunctionExpression" (from detectionRule.pattern)
- `type`: "ast" (from detectionRule.type)
- `filePath`: "activity-demo/app/home-client.tsx" (from query/context)

### Step 2: Read Required Files (AUTOMATIC)

**MANDATORY**: Read all required guides before following pattern-matcher workflow.

1. Read `tools/ast-parser-guide.md` (MANDATORY - cannot skip)
2. Read `tools/automatic-pattern-detection.md` (MANDATORY - cannot skip)
3. Read `skills/pattern-matcher.md` (MANDATORY - cannot skip)
4. Read target file using `read_file` tool (MANDATORY)
   - Extract `code` from file content

**Validation**: All four files must be read before proceeding.

### Step 3: Apply Pattern-Matcher Analysis (AUTOMATIC - NO TOOLS)

**CRITICAL**: LLM automatically performs mental AST analysis with extracted parameters. NO tools required. NO manual analysis allowed.

**BLOCKING VALIDATION**: Before performing analysis, verify:
- [ ] All parameters extracted and displayed (from Step 1)
- [ ] All required files read (from Step 2)
- [ ] NO grep/codebase_search calls made for pattern detection
- [ ] Pattern-matcher workflow is being used (not tools)

**Analysis Parameters** (MUST USE EXTRACTED VALUES):
- `pattern`: [from detectionRule.pattern - use EXACT extracted value]
- `type`: [from detectionRule.type - use EXACT extracted value]
- `code`: [from read_file tool]
- `filePath`: [target file path - use EXACT extracted value]

**Explicit Mental AST Analysis Procedure** (MUST FOLLOW):

1. **Identify AST Node Types**:
   - For pattern `MemberExpression[object.name='window']`:
     - Look for property access: `window.location`, `window.innerWidth`, etc.
     - Identify these as `MemberExpression` nodes
     - Check if `object.name === 'window'`

2. **Match Against Pattern**:
   - Compare identified AST nodes against extracted pattern
   - For `MemberExpression[object.name='window']`:
     - Match: `window.location` → MemberExpression, object.name='window' ✓
     - Match: `window.innerWidth` → MemberExpression, object.name='window' ✓
     - No match: `document.body` → MemberExpression, object.name='document' ✗

3. **Verify Context**:
   - Check if match is in problematic location:
     - NOT in `useEffect` hook
     - NOT in event handler
     - Directly in render/component body
     - In `useState` initial value

4. **Return Matches**:
   - Format matches in pattern-matcher format
   - Include location, code snippet, node type, context

**Automatic Analysis Process**:
1. LLM automatically performs mental AST analysis with extracted parameters
2. NO tools required (grep, codebase_search, etc.)
3. NO manual code analysis
4. NO LLM knowledge usage for pattern detection
5. Pattern-matcher analysis is ONLY source
6. Use explicit procedure above for mental analysis

**Example Analysis**:
```
Pattern-Matcher Analysis:
- pattern: "CallExpression[callee.property.name='push']"
- type: "ast"
- code: [full file content from read_file]
- filePath: "app/components/Dialog.tsx"

LLM performs mental AST analysis to identify matching nodes.
```

### Step 4: Process Results (AUTOMATIC)

**MANDATORY**: Use matches array from pattern-matcher analysis as ONLY source.

1. **Receive Matches**: Get matches array from pattern-matcher analysis
2. **Verify Context**: Use match metadata to verify context:
   - Check if match is in problematic location (useEffect, event handler, etc.)
   - Verify match represents actual anti-pattern
3. **Apply Fixes**: Use matches array as ONLY source for fix application
   - NO manual pattern identification
   - NO LLM knowledge for pattern detection
   - Pattern-matcher analysis results are authoritative

**Example Match Processing**:
```json
{
  "matches": [
    {
      "location": {
        "start": { "line": 15, "column": 5 },
        "end": { "line": 15, "column": 20 }
      },
      "codeSnippet": "router.push('/page')",
      "nodeType": "CallExpression",
      "filePath": "app/components/Dialog.tsx",
      "context": {
        "inUseEffect": false,
        "inEventHandler": true,
        "inDialogComponent": true
      }
    }
  ],
  "metadata": {
    "patternType": "ast",
    "totalMatches": 1,
    "filePath": "app/components/Dialog.tsx"
  }
}
```

## Validation Checklist

Before proceeding with fix application, verify:

- [ ] Pattern-matcher workflow automatically followed? (YES/NO)
- [ ] Parameters extracted from sub-agent's detectionRule? (YES/NO)
- [ ] AST parser guides read? (YES/NO)
- [ ] Target file read using `read_file` tool? (YES/NO)
- [ ] Matches returned in pattern-matcher format? (YES/NO)
- [ ] Context verified using pattern-matcher analysis results? (YES/NO)

**IF ANY ANSWER IS NO**: Workflow is INVALID. Return to Step 1 and follow pattern-matcher workflow correctly.

## Traceability

Every pattern detection must be traceable to:

1. **Pattern-Matcher Automatic Workflow**: Can you point to the automatic workflow?
2. **Parameters from Sub-Agent**: Can you show parameters extracted from detectionRule?
3. **Matches Array**: Can you show matches array from pattern-matcher analysis?
4. **AST Parser Guides**: Can you confirm guides were read?

**IF YOU CANNOT TRACE**: Pattern detection is INVALID. Re-follow pattern-matcher workflow.

## Example: Complete Workflow

### Scenario: Detect router.push in dialog component

**Step 1: Extract Parameters**
```
Sub-Agent Frontmatter:
  detectionRule:
    type: ast
    pattern: "CallExpression[callee.property.name='push']"

Extracted:
  - pattern: "CallExpression[callee.property.name='push']"
  - type: "ast"
  - filePath: "app/components/Dialog.tsx"
```

**Step 2: Read Required Files**
```
1. Read tools/ast-parser-guide.md ✓
2. Read tools/automatic-pattern-detection.md ✓
3. Read skills/pattern-matcher.md ✓
4. Read app/components/Dialog.tsx using read_file tool ✓
```

**Step 3: Apply Pattern-Matcher Analysis**
```
Automatic Analysis:
- pattern: "CallExpression[callee.property.name='push']"
- type: "ast"
- code: [from read_file]
- filePath: "app/components/Dialog.tsx"

LLM performs mental AST analysis.
Result: Matches array yielded
```

**Step 4: Process Results**
```
Matches Array:
[
  {
    location: { start: { line: 15, column: 5 }, end: { line: 15, column: 20 } },
    codeSnippet: "router.push('/page')",
    context: { inDialogComponent: true }
  }
]

Action: Use matches array to apply fix
```

## Related Documentation

- **Main Guide**: `tools/ast-parser-guide.md` - Complete automatic detection workflow
- **Pattern Reference**: `tools/automatic-pattern-detection.md` - Pattern recognition details
- **Skill Interface**: `skills/pattern-matcher.md` - Pattern-matcher skill documentation
- **Validation**: `agent-framework/WORKFLOW_VALIDATION.md` - Workflow validation checklist

## Notes

- **Pattern-matcher is a conceptual workflow, NOT a tool. LLM performs mental AST analysis.**
- LLM must follow the automatic workflow exactly as specified
- No tools required - LLM performs mental code structure analysis
- No shortcuts or manual analysis allowed
- All pattern detection must be traceable to pattern-matcher workflow
- AST parser guides MUST be read before workflow (no exceptions)
- DO NOT use grep/codebase_search - use mental AST analysis

