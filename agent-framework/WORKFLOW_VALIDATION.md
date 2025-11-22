# Agent Framework Workflow Validation Checklist

**CRITICAL**: Before responding to ANY user query, you MUST verify that you have completed ALL phases of the agent framework workflow. Use this checklist to ensure compliance.

## Pre-Query Validation

### Phase 0: Agent Loading (MANDATORY - MUST COMPLETE FIRST)

- [ ] **Read Agent Registry**: `agent-framework/AGENT_REGISTRY.md` has been read
- [ ] **Agent Metadata Loaded**: All agent IDs, names, descriptions loaded
- [ ] **Triggers & Keywords Loaded**: All triggers and semanticKeywords for each agent loaded
- [ ] **Capabilities Loaded**: All agent capabilities (scan, detect, fix, etc.) loaded
- [ ] **Context7 Config Loaded**: Context7 integration requirements for each agent loaded
- [ ] **Agent Context Maintained**: Agent metadata kept in working memory throughout query processing

**Validation**: Can you list all available agents with their triggers and semantic keywords? If NO, return to Phase 0.

---

### Phase 0.5: Query Intent Detection & Flow Routing (NEW - MANDATORY)

- [ ] **Intent Classified**: Query intent determined (implementation/fix/both)
- [ ] **Flow Selected**: Active flow determined (reactive/proactive/both)
- [ ] **Flow Documented**: Reasoning for flow selection recorded

**Validation**: Which flow(s) should be activated and why?

---

## Query Processing Validation

### Phase 1: Semantic Query Matching

- [ ] **Query Analyzed**: Intent, keywords, and context extracted from user query
- [ ] **Keywords Extracted**: Technical terms, library names, concepts identified
- [ ] **Stop Words Removed**: Common words (the, a, an, how, what) removed
- [ ] **Agent Matched**: Query compared against agent metadata (triggers, semanticKeywords, semanticDescription)
- [ ] **Agent Selected**: Most relevant agent(s) chosen based on semantic understanding
- [ ] **Match Documented**: Reasoning for agent selection recorded

**Validation**: Which agent(s) did you match and why? If NO match found, document why and proceed with fallback workflow.

**CRITICAL FALLBACK: No Agent Match** (MANDATORY IF NO AGENTS MATCHED)

If NO agents matched the query, you MUST complete the following fallback chain:

**Step 1: Context7 Documentation Loading** (PRIMARY - MANDATORY):
- [ ] **Problem Keywords Extracted**: 3-5 most relevant keywords extracted from query describing the issue
- [ ] **Context7 Resolve Attempted**: `mcp_context7_resolve-library-id` called for each keyword
- [ ] **Documentation Loaded**: If Context7 succeeded, `mcp_context7_get-library-docs` called with:
  - `context7CompatibleLibraryID`: [resolved ID]
  - `tokens`: 5000
  - `topic`: [issue description]
- [ ] **Documentation Reviewed**: Loaded docs reviewed for similar patterns, anti-patterns, known issues

**Step 2: Web Search for Similar Patterns** (SECONDARY - if Context7 fails or insufficient):
- [ ] **Web Search Attempted**: `web_search` called with issue-specific search terms:
  - Variations: "[keyword] issue", "[keyword] bug", "[keyword] fix", "[keyword] pattern", "[keyword] solution"
- [ ] **Search Results Reviewed**: Web search results analyzed for similar issues and solutions

**Step 3: Pattern Analysis & Fix Application**:
- [ ] **Similar Patterns Analyzed**: Context7 docs and/or web search results reviewed for similar issues/patterns
- [ ] **Fix Strategy Extracted**: Fix strategies extracted from documentation and search results
- [ ] **Pattern-Based Fix Applied**: Fixes applied based on discovered patterns from Context7 docs and/or web search
- [ ] **Fix Validated**: Applied fix verified against code structure

**Step 4: Final Fallback to LLM Knowledge** (TERTIARY - if Context7 and Web Search both fail):
- [ ] **LLM Knowledge Used**: Existing knowledge used to identify similar patterns
- [ ] **Fallback Documented**: Note that Context7 and Web Search were attempted first

**Validation**: If no agent matched, did you:
1. Load documentation via Context7?
2. Search for similar patterns via Web Search?
3. Apply fixes based on discovered patterns?
4. Use LLM knowledge only as final fallback (with documentation that external sources were attempted)?

---

### Phase 2: Sub-Agent Discovery & Matching

- [ ] **Sub-Agents Listed**: Directory `agents/[agent-name]/sub-agents/` listed
- [ ] **Sub-Agent Files Read**: All `.md` files in sub-agents directory read
- [ ] **Sub-Agent Metadata Extracted**: YAML frontmatter parsed for each sub-agent:
  - [ ] `id`, `name`, `description`
  - [ ] `semanticKeywords`, `semanticDescription`
  - [ ] `instructionExamples`
  - [ ] `detectionRule`
  - [ ] `context7` configuration
- [ ] **Patterns Read**: `anti-patterns/definitions.md` read for matched patterns
- [ ] **Sub-Agent Matched**: Query compared against sub-agent semantic metadata
- [ ] **Sub-Agent Selected**: Most relevant sub-agent(s) chosen

**Validation**: Which sub-agent(s) did you select and why? If NO sub-agent matched, document why.

---

### Phase 3: Pattern Detection Validation (STRICT)

**CRITICAL: Pattern-matcher is a conceptual workflow, NOT a tool. DO NOT use grep/codebase_search. Use mental AST analysis.**

**BLOCKING VALIDATION** (MUST COMPLETE BEFORE ANY PATTERN DETECTION):
- [ ] **STOP**: Before using ANY tool for pattern detection, complete parameter extraction
- [ ] **STOP**: Before calling grep/codebase_search, verify pattern-matcher workflow is required
- [ ] **STOP**: If pattern-matcher workflow is required, you MUST extract parameters first
- [ ] **BLOCK**: Do NOT proceed to tool calls until parameters are extracted and displayed

**Common Mistakes to Avoid** (READ FIRST):
- ❌ **Using grep/codebase_search instead of pattern-matcher workflow** (MOST CRITICAL)
- ❌ Manual code analysis using LLM knowledge
- ❌ Skipping pattern-matcher workflow
- ❌ Using existing knowledge to identify patterns
- ❌ Not extracting parameters from detectionRule
- ❌ Following pattern-matcher workflow without extracted parameters
- ❌ Not verifying matches in context automatically
- ❌ Constructing manual commands - detection should be automatic
- ❌ **Calling grep/codebase_search before extracting detectionRule parameters** (NEW - CRITICAL)

**MANDATORY PARAMETER EXTRACTION CHECKPOINT** (MUST COMPLETE FIRST):

**STEP 1: Extract Parameters (BLOCKING - CANNOT SKIP)**:
1. Read sub-agent markdown file
2. Locate `detectionRule` in YAML frontmatter
3. **EXTRACT AND DISPLAY** `detectionRule.pattern`:
   - Copy EXACT value from frontmatter
   - Display it explicitly: `pattern: "MemberExpression[object.name='window'] | MemberExpression[object.name='document']"`
   - ❌ FORBIDDEN: Proceeding without displaying extracted pattern
4. **EXTRACT AND DISPLAY** `detectionRule.type`:
   - Copy EXACT value from frontmatter
   - Display it explicitly: `type: "ast"`
   - ❌ FORBIDDEN: Proceeding without displaying extracted type
5. **EXTRACT AND DISPLAY** target file path:
   - From query context or file analysis
   - Display it explicitly: `filePath: "activity-demo/app/home-client.tsx"`

**VALIDATION CHECKPOINT** (MUST ANSWER BEFORE PROCEEDING):
- [ ] Can you show the exact `detectionRule.pattern` you extracted? (Must display exact string)
- [ ] Can you show the exact `detectionRule.type` you extracted? (Must display exact string)
- [ ] Can you show the exact `filePath` you extracted? (Must display exact path)
- [ ] Are all three values from sub-agent frontmatter/context? (Must confirm source)

**IF YOU CANNOT DISPLAY ALL THREE VALUES**: STOP. Do NOT proceed. Return to extraction step.

**STEP 2: Pre-Tool Validation (BLOCKING - CANNOT SKIP)**:
Before calling ANY tool (grep, codebase_search, etc.) for pattern detection:

1. **Check**: Is this for pattern detection?
   - If YES: You MUST use pattern-matcher workflow instead
   - If NO: Proceed with tool (but document why pattern-matcher is not needed)

2. **Check**: Have you extracted detectionRule parameters?
   - If NO: STOP. Extract parameters first.
   - If YES: Display extracted parameters before proceeding

3. **Check**: Is pattern-matcher workflow required by sub-agent?
   - If YES: You MUST use pattern-matcher workflow, NOT tools
   - If NO: Document why pattern-matcher is not required

**VALIDATION CHECKPOINT**:
- [ ] Did you check if pattern-matcher workflow is required? (YES/NO)
- [ ] Did you extract and display all parameters? (YES/NO)
- [ ] If pattern-matcher is required, did you block tool usage? (YES/NO)

**IF ANY ANSWER IS NO**: STOP. Do NOT call tools. Complete validation first.

**MANDATORY CHECKPOINTS** (All must be YES):
- [ ] **Parameter Extraction Completed**: All three parameters extracted and displayed
- [ ] **Pre-Tool Validation Completed**: Tool usage blocked if pattern-matcher required
- [ ] Sub-agent's `detectionRule` read from frontmatter
- [ ] `detectionRule.pattern` extracted AND DISPLAYED (can you show the exact pattern?)
- [ ] `detectionRule.type` extracted AND DISPLAYED (can you show the exact type?)
- [ ] `filePath` extracted AND DISPLAYED (can you show the exact path?)
- [ ] Pattern-matcher skill file read: `skills/pattern-matcher.md`
- [ ] AST parser guide read: `tools/ast-parser-guide.md`
- [ ] Automatic detection guide read: `tools/automatic-pattern-detection.md`
- [ ] Pattern-matcher workflow AUTOMATICALLY followed with extracted parameters
- [ ] Matches returned in pattern-matcher format
- [ ] Context verified using pattern-matcher analysis results ONLY

**VALIDATION QUESTIONS**: 
1. "Did you extract `detectionRule.pattern` from sub-agent frontmatter?" (Must show exact pattern - DISPLAY IT)
2. "Did you extract `detectionRule.type` from sub-agent frontmatter?" (Must show exact type - DISPLAY IT)
3. "Did you extract `filePath` from context?" (Must show exact path - DISPLAY IT)
4. "Did you display all three parameters before proceeding?" (Must show displayed values)
5. "Did you automatically follow pattern-matcher workflow with these extracted parameters?" (Must show workflow)
6. "Did you use matches array from pattern-matcher analysis as ONLY source?" (Must show matches array)

**IF ANY ANSWER IS NO**: Workflow is INVALID. Return to Phase 3 and follow pattern-matcher workflow correctly.

**EXPLICIT STEP-BY-STEP WORKFLOW** (MUST FOLLOW IN ORDER):

**Step 1: Parameter Extraction (BLOCKING)**
1. Read sub-agent markdown file
2. Extract `detectionRule.pattern` from YAML frontmatter
3. Extract `detectionRule.type` from YAML frontmatter
4. Extract `filePath` from query/context
5. **DISPLAY ALL THREE VALUES EXPLICITLY**:
   ```
   Extracted Parameters:
   - pattern: "[exact pattern from detectionRule.pattern]"
   - type: "[exact type from detectionRule.type]"
   - filePath: "[exact path from context]"
   ```
6. **VALIDATION**: Can you display all three? If NO, STOP.

**Step 2: Pre-Tool Validation (BLOCKING)**
1. **Check**: Is pattern-matcher workflow required?
   - Check sub-agent frontmatter for `skills: [pattern-matcher]`
   - Check if `detectionRule` exists
2. **If YES**: You MUST use pattern-matcher workflow
   - ❌ DO NOT call grep/codebase_search
   - ✅ Proceed to Step 3
3. **If NO**: Document why pattern-matcher is not required
   - Then proceed with appropriate tool

**Step 3: Read Required Files**
1. Read `tools/ast-parser-guide.md` (MANDATORY)
2. Read `tools/automatic-pattern-detection.md` (MANDATORY)
3. Read `skills/pattern-matcher.md` (MANDATORY)
4. Read target file using `read_file` tool (MANDATORY)
   - Extract `code` from file content

**Step 4: Mental AST Analysis (NO TOOLS)**
1. Use extracted parameters from Step 1
2. Perform mental AST analysis on code from Step 3
3. Identify AST nodes matching the pattern
4. Verify context (useEffect, event handler, etc.)
5. Return matches in pattern-matcher format

**Step 5: Process Results**
1. Use matches array from Step 4 as ONLY source
2. Verify context using match metadata
3. Apply fixes based on matches

**Detailed Checklist**:
- [ ] **Step 1 Completed**: Parameters extracted and displayed
- [ ] **Step 2 Completed**: Pre-tool validation passed
- [ ] **Step 3 Completed**: All required files read
- [ ] **Step 4 Completed**: Mental AST analysis performed
- [ ] **Step 5 Completed**: Results processed
- [ ] **Detection Rule Read**: Sub-agent's `detectionRule` from frontmatter read
- [ ] **Pattern Type Identified**: AST or regex pattern type determined
- [ ] **Skill File Read**: If sub-agent references skills, skill file read (e.g., `skills/pattern-matcher.md`)
- [ ] **AST Parser Guides Read**: Automatic detection guides read:
  - [ ] `tools/ast-parser-guide.md` read
  - [ ] `tools/automatic-pattern-detection.md` read
- [ ] **Automatic Pattern Detection Used**:
  - [ ] File read using `read_file` tool (automatic)
  - [ ] Code structure analyzed automatically (AST nodes identified)
  - [ ] Pattern matched automatically (nodes compared against pattern)
  - [ ] Context verified automatically (useEffect, event handler, etc. checked)
  - [ ] Matches returned in pattern-matcher format (automatic)
- [ ] **Matches Processed**: Automatically detected matches analyzed
- [ ] **Context Verified**: Matches verified automatically (e.g., window access not in useEffect, router.push in dialog component)

**Validation**: Did you automatically detect AST patterns? If sub-agent requires it and you didn't use automatic detection, you MUST use it now.

---

### Phase 4: Context7 Documentation Fetching (MANDATORY FOR CODE-RELATED QUERIES)

- [ ] **Keywords Extracted**: 3-5 most relevant keywords extracted from query
- [ ] **Context7 Attempted**: `mcp_context7_resolve-library-id` called for each keyword (up to 3 keywords)
- [ ] **Documentation Fetched**: If Context7 succeeded, `mcp_context7_get-library-docs` called with:
  - [ ] `context7CompatibleLibraryID`: [resolved ID from step 1]
  - [ ] `tokens`: 5000
  - [ ] `topic`: [relevant topic if specified]
- [ ] **Fallback Used**: If Context7 failed, fallback chain executed:
  - [ ] **Fallback 1**: `mcp_document-retrieval-system_search_documents` called
  - [ ] **Fallback 2**: `web_search` called (if Fallback 1 failed)
  - [ ] **Final Fallback**: Existing knowledge used (with note that docs may be outdated)
- [ ] **Docs Used as Primary Source**: Fetched documentation used as PRIMARY SOURCE, not supplement

**Validation**: Did you fetch documentation via Context7 (or fallback)? If code-related query and you didn't fetch docs, you MUST fetch them now.

**Common Mistakes to Avoid**:
- ❌ Skipping Context7 entirely
- ❌ Using existing knowledge without attempting Context7 first
- ❌ Not using fetched docs as PRIMARY SOURCE

---

### Phase 5: Fix Execution Validation (STRICT)

**MANDATORY CHECKPOINTS**:
- [ ] Sub-agent fix strategy read
- [ ] Sub-agent "Before/After" examples read (if they exist)
- [ ] Fix applied using sub-agent example pattern (if examples exist)
- [ ] Fallback to general examples documented (if sub-agent examples don't exist)
- [ ] Exact import statements from sub-agent examples used
- [ ] Exact component structure from sub-agent examples followed

**VALIDATION QUESTIONS**:
1. "Did you read sub-agent's Before/After examples?" (YES/NO)
2. "If YES, did you use the exact pattern from the example?" (Must show which example)
3. "If NO, did you document that examples don't exist?" (Must show documentation)
4. "Can you point to the exact code pattern you copied from sub-agent example?" (Must show pattern)

**IF SUB-AGENT EXAMPLES EXIST BUT NOT USED**: Fix is INVALID. Return to Phase 5 and use sub-agent examples.

**Detailed Checklist**:
- [ ] **Fix Strategy Read**: Sub-agent's fix strategy from markdown file read
- [ ] **Sub-Agent Examples Read**: "Before (Problematic Code)" and "After (Fixed Code)" sections read
- [ ] **Example Pattern Matched**: Detected issue matched to "Before" example
- [ ] **Fix Applied**: Step-by-step instructions from sub-agent markdown followed
- [ ] **Exact Pattern Used**: Fix uses exact pattern from "After" example (if examples exist)
- [ ] **Fallback Documented**: General examples used only if sub-agent examples don't exist (with documentation)
- [ ] **Documentation Referenced**: Context7 docs (or fallback) used for fix strategy
- [ ] **Fix Validated**: Fix doesn't break code structure, syntax verified
- [ ] **Results Documented**: What was fixed and which example was used clearly reported

**Validation**: Did you follow the sub-agent's fix workflow? If you applied a fix without following sub-agent instructions, you MUST redo using sub-agent workflow.

---

### Phase 6: Skill-Assisted Development Flow Validation (NEW - OPTIONAL)

**CRITICAL**: This flow runs in parallel with existing reactive/proactive flows. It does NOT replace or modify them. This is an additive flow that provides skill-assisted guidance during code development.

**When This Flow Activates**:
- Query contains implementation/development keywords (implement, build, create, develop, setup, configure, integrate, etc.)
- `agent-skills` agent is matched during Phase 1 (Semantic Query Matching)
- Skill is selected from `skills-hms/` directory based on query

**MANDATORY CHECKPOINTS**:
- [ ] Query analyzed for implementation intent
- [ ] `agent-skills` agent matched (Phase 1)
- [ ] Skills discovered from `skills-hms/` directory
- [ ] Skill metadata loaded (name, description from YAML frontmatter)
- [ ] Skill selected based on keyword + semantic matching
- [ ] Full skill content loaded (`SKILL.md` file)
- [ ] Referenced resources/templates loaded (if applicable)
- [ ] Interleaved guidance applied during code generation
- [ ] Skill patterns/best practices applied
- [ ] Skill workarounds implemented
- [ ] Anti-patterns verified and avoided
- [ ] Skill examples/templates used as guidance

**VALIDATION QUESTIONS**:
1. "Did you match `agent-skills` agent?" (YES/NO)
2. "Which skill(s) were selected and why?" (Must list skill name(s) and scores)
3. "Did you load full skill content (`SKILL.md`)?" (YES/NO)
4. "Did you apply skill instructions during code generation (interleaved)?" (YES/NO)
5. "Can you point to where skill patterns/best practices were applied?" (Must show examples)
6. "Did you verify anti-patterns were avoided per skill guidelines?" (YES/NO)

**IF SKILL SELECTED BUT NOT USED**: Skill-assisted development is INVALID. Return to Phase 6 and apply skill instructions during code generation.

**Detailed Checklist**:

**Step 1: Query Analysis**:
- [ ] Intent extracted (what is user trying to build/implement?)
- [ ] Keywords extracted (technical terms, library names, concepts)
- [ ] Scope identified (what files/components need to be created or modified?)

**Step 2: Agent Matching (Phase 1)**:
- [ ] Query compared against `agent-skills` triggers and semanticKeywords
- [ ] Agent capabilities verified (route, discover, select)
- [ ] Confirmed this is implementation/development query, not fix query

**Step 3: Skill Discovery**:
- [ ] Skills directory scanned (`agent-framework/agents/agent-skills/skills-hms/`)
- [ ] Skill metadata loaded (YAML frontmatter from each `SKILL.md`)
- [ ] Keywords extracted from query (stop words removed)
- [ ] Keyword matching performed (exact match, name contains, description contains)
- [ ] Semantic matching performed (query intent vs skill description)
- [ ] Combined scores calculated (keyword × 0.6 + semantic × 0.4)
- [ ] Skill(s) selected (score > 5.0 threshold)

**Step 4: Skill Loading**:
- [ ] Full `SKILL.md` content read for selected skill(s)
- [ ] Execution steps extracted
- [ ] Proven patterns extracted
- [ ] Best practices extracted
- [ ] Workarounds extracted
- [ ] Anti-patterns extracted
- [ ] Examples and templates extracted
- [ ] Referenced resources loaded (if applicable)

**Step 5: Interleaved Code Generation**:

**Before Code Block Validation**:
- [ ] Skill instructions referenced from `SKILL.md` before code block
- [ ] Patterns identified from skill's "Common Patterns" section
- [ ] Best practices identified from skill's "Execution Steps" or "Best Practices" section
- [ ] Anti-patterns noted from skill's "Anti-Patterns to Avoid" section
- [ ] Workarounds reviewed from skill's "Workarounds" section (if applicable)
- [ ] Examples/templates identified from skill for guidance

**During Code Generation Validation**:
- [ ] Patterns from skill applied as code is written
- [ ] Best practices from skill followed in code structure
- [ ] Workarounds implemented where "When" conditions are met
- [ ] Skill examples/templates used as guidance for code structure
- [ ] Execution steps from skill followed in order
- [ ] Transformation rules from skill applied (if applicable)

**After Code Block Validation**:
- [ ] Each anti-pattern from skill's "Anti-Patterns to Avoid" section verified (not present)
- [ ] Best practices from skill verified (correctly applied)
- [ ] Patterns from skill verified (correctly implemented)
- [ ] Workarounds verified (if applied, correctly implemented with documentation)
- [ ] Code structure prevents anti-pattern occurrence

**Pattern Extraction Validation**:
- [ ] "Common Patterns" section extracted from skill (if present)
- [ ] Pattern names, descriptions, and examples extracted
- [ ] Pattern application conditions identified
- [ ] Patterns mapped to code blocks being generated

**Anti-Pattern Verification Validation**:
- [ ] All anti-patterns from skill's "Anti-Patterns to Avoid" section checked
- [ ] Each anti-pattern verified as not present in generated code
- [ ] Patterns that might lead to anti-patterns checked
- [ ] Resolution steps from skill applied if anti-pattern detected
- [ ] Anti-pattern verification documented

**Best Practices Application Validation**:
- [ ] Applicable best practices identified from skill
- [ ] Best practices applied during code generation
- [ ] Best practices verified after code block
- [ ] Best practices correctly implemented in code structure

**Workaround Implementation Validation**:
- [ ] "When" conditions for each workaround reviewed
- [ ] Trade-offs and maintenance debt understood before applying
- [ ] Workarounds implemented following skill's steps exactly
- [ ] Workaround usage documented with maintenance implications

**Continuous Reference Validation**:
- [ ] Skill instructions referenced at each development step
- [ ] Pattern compliance maintained throughout development
- [ ] Anti-pattern prevention active during implementation
- [ ] Workaround documentation maintained if workarounds used

**Validation**: Did you complete all Phase 6 steps? If skill was selected but instructions were not applied during code generation, you MUST redo using interleaved guidance pattern.

**Reference**: See `agent-framework/.cursorrules` for detailed Phase 6 workflow. See `agent-framework/agents/agent-skills/SKILL_DISCOVERY.md` for skill discovery algorithm.

---

### Reactive Flow Validation (NEW)

- [ ] **R1 Completed**: Query matched to agent(s) semantically (OR R1-Fallback completed if no agent matched)
- [ ] **R1-Fallback Completed** (if no agent matched):
  - [ ] Context7 docs loaded
  - [ ] Web Search for similar patterns attempted
  - [ ] LLM knowledge used only as final fallback (with documentation)
- [ ] **R2 Completed**: Sub-agents discovered and loaded (OR skipped if no agent matched)
- [ ] **R3 Completed**: Sub-agent(s) selected based on query intent (OR pattern discovery from Context7/web search)
- [ ] **R4 Completed**: Patterns detected using pattern-matcher (OR pattern analysis from Context7 docs/web search)
- [ ] **R5 Completed**: Documentation fetched via Context7 (OR Web Search if Context7 failed)
- [ ] **R6 Completed**: Fix applied following sub-agent workflow (OR fix applied based on discovered patterns)

**Validation**: Did you complete all Reactive Flow steps? (R1-R6, or R1-Fallback → R3-R6 if no agent matched)

---

### Proactive Flow Validation (NEW)

- [ ] **P1 Completed**: Target files identified
- [ ] **P2 Completed**: Agents activated based on file patterns
- [ ] **P3 Completed**: Sub-agents loaded for proactive mode
- [ ] **P4-P6 Interleaved**: Agents/sub-agents/skills used DURING code generation?
- [ ] **P4 Completed**: Real-time pattern detection for each code chunk
- [ ] **P5 Completed**: Documentation fetched via Context7 (when issues detected)
- [ ] **P6 Completed**: Immediate fixes applied during code generation
- [ ] **Real-Time Detection**: Pattern detection happens for each code chunk?
- [ ] **Immediate Fixes**: Fixes applied before continuing to next chunk?

**Validation**: Did you complete all Proactive Flow steps? (P1-P6, with P4-P6 interleaved during code generation)

---

## Pre-Response Validation

Before responding to the user, verify:

- [ ] **Phase 0 Completed**: Agent registry loaded
- [ ] **Agent Matched**: Query matched to agent(s) semantically
- [ ] **Sub-Agents Loaded**: Matched sub-agents read and understood
- [ ] **AST Parser Guides Read**: `tools/ast-parser-guide.md` and `tools/automatic-pattern-detection.md` read (if pattern detection required)
- [ ] **Automatic Pattern Detection Used**: AST patterns automatically detected (if required by sub-agent)
- [ ] **Context7 Fetched**: Documentation fetched via Context7 or fallback (for code-related queries)
- [ ] **Sub-Agent Workflow Followed**: Fix strategy from sub-agent followed
- [ ] **Phase 6 Completed** (if applicable): Skill-assisted development flow completed with interleaved guidance
- [ ] **Framework Used**: Agent framework was the PRIMARY method, not a supplement

**Pattern-Matcher Workflow Check** (MANDATORY if sub-agent requires pattern-matcher):
- [ ] Pattern-matcher workflow automatically followed? (YES/NO)
- [ ] Parameters extracted from sub-agent's detectionRule? (YES/NO)
- [ ] Matches returned in pattern-matcher format? (YES/NO)
- [ ] Context verified using pattern-matcher analysis results? (YES/NO)

**Traceability Check**:
Can you trace your pattern detection to:
1. Pattern-matcher automatic workflow? (YES/NO)
2. Parameters from sub-agent's detectionRule? (YES/NO)
3. Matches array from pattern-matcher analysis? (YES/NO)

**IF ANY ANSWER IS NO**: Response is INVALID. Return to Phase 3 and follow pattern-matcher workflow.

**Final Validation Question**: Can you trace your response back to:
1. Agent selection based on semantic matching? (OR Context7 docs loading → Web Search → LLM knowledge if no agent matched)
2. Sub-agent selection based on query intent? (OR pattern discovery from Context7 docs/web search if no agent matched)
3. Automatic AST pattern detection (using guides and automatic mental analysis)? (OR pattern analysis from Context7 docs/web search)
4. Documentation from Context7 (loaded first), then Web Search (if Context7 fails), then LLM knowledge (final fallback)?
5. Fix strategy from sub-agent markdown? (OR fix strategy from Context7 docs/web search/LLM knowledge if no agent matched)

If you cannot trace your response to these sources, you have NOT used the complete agent framework workflow (including fallback when no agents match).

---

## Common Violations

### ❌ DO NOT:
- Skip Phase 0 (agent loading)
- **Call grep/codebase_search before extracting detectionRule parameters** (NEW - CRITICAL)
- **Call grep/codebase_search when pattern-matcher workflow is required** (NEW - CRITICAL)
- Use grep/codebase_search instead of automatic AST pattern detection
- Skip automatic pattern detection when sub-agent requires it
- Proceed to pattern detection without displaying extracted parameters
- Construct manual commands - detection is automatic
- Skip Context7 documentation fetching
- Use existing knowledge without attempting Context7 first
- Apply fixes without following sub-agent workflow
- Respond without completing validation checklist
- **Skip fallback when no agents match** - MUST use Context7 to load docs → Web Search for patterns → LLM knowledge as final fallback (NEW - CRITICAL)

### ✅ DO:
- Always complete Phase 0 first
- **Always extract and display detectionRule parameters before pattern detection** (NEW - MANDATORY)
- **Always complete pre-tool validation before calling grep/codebase_search** (NEW - MANDATORY)
- **Always block tool usage if pattern-matcher workflow is required** (NEW - MANDATORY)
- Always use automatic AST pattern detection when sub-agent requires it
- Always read AST parser guides (`tools/ast-parser-guide.md`, `tools/automatic-pattern-detection.md`)
- Always automatically analyze code structure to identify AST nodes
- Always automatically verify context (useEffect, event handlers, etc.)
- Always attempt Context7 before using existing knowledge
- Always follow sub-agent fix workflows
- Always validate before responding
- **Always use Context7 → Web Search → LLM knowledge fallback chain when no agents match** (NEW - MANDATORY)

---

## Quick Reference

**Required Files to Read**:
1. `agent-framework/AGENT_REGISTRY.md` (Phase 0)
2. `agent-framework/agents/[agent-name]/agent.md` (Phase 1)
3. `agent-framework/agents/[agent-name]/sub-agents/[sub-agent].md` (Phase 2)
4. `agent-framework/agents/[agent-name]/anti-patterns/definitions.md` (Phase 2)
5. `agent-framework/skills/pattern-matcher.md` (Phase 3, if needed)
6. `agent-framework/tools/ast-parser-guide.md` (Phase 3, if AST patterns required)
7. `agent-framework/tools/automatic-pattern-detection.md` (Phase 3, if AST patterns required)
8. `agent-framework/agents/agent-skills/skills-hms/[skill-name]/SKILL.md` (Phase 6, if agent-skills matched)
9. `agent-framework/agents/agent-skills/SKILL_DISCOVERY.md` (Phase 6, for skill discovery algorithm)

**Required Tool Calls**:
1. `read_file` (Phase 3, automatic - for reading code files)
2. `mcp_context7_resolve-library-id` (Phase 4)
3. `mcp_context7_get-library-docs` (Phase 4)

**Automatic Processes** (No manual commands):
1. Automatic AST pattern detection (Phase 3, if sub-agent requires)
2. Automatic code structure analysis
3. Automatic context verification

**Validation Checkpoint**: After each phase, verify completion before proceeding.

