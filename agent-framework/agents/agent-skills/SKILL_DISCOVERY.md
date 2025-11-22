# Skill Discovery Mechanism

This document explains how the `agent-skills` agent discovers and selects skills from the `skills-hms` directory based on user queries.

## Overview

The skill discovery mechanism uses a two-phase matching approach:
1. **Keyword Matching**: Exact and partial matches against skill names and descriptions
2. **Semantic Matching**: Intent-based matching against skill descriptions

Both approaches are combined to rank and select the most relevant skill(s) for a given query.

## Discovery Process

### Step 1: Scan Skills Directory

The agent automatically scans `agent-framework/agents/agent-skills/skills-hms/` to discover **ALL** available skills. All skills in this directory are automatically included in the discovery process during query processing (excluding the `template/` directory which is used for creating new skills).

**Process**:
1. List all directories in `skills-hms/` (excluding `template/`)
2. For each directory, check for `SKILL.md` file
3. If `SKILL.md` exists, the directory is a valid skill and is automatically included in discovery
4. All valid skills are scanned and matched against user queries

**Example Skills**:
- `implementing-ably-realtime/`
- `implementing-algolia-search/`
- `implementing-kafka-production/`
- `implementing-linear-excellence/`
- `mintlify-documentation/`

### Step 2: Load Skill Metadata

For each discovered skill, read the YAML frontmatter from `SKILL.md` to extract discovery data.

**Extracted Fields**:
- `name`: Skill identifier (e.g., "implementing-ably-realtime")
- `description`: Skill description (max 1024 chars) - primary discovery mechanism
- `dependencies`: Required packages (for context, not matching)

**Example Metadata**:
```yaml
---
name: implementing-ably-realtime
description: Implements Ably realtime messaging by applying proven patterns (Pub/Sub with global elasticity, ephemeral channels, token authentication, automatic reconnection, LiveObjects with CRDTs, presence management), following best practices (singleton SDK instance, History API recovery, exponential backoff, batched webhooks, channel scoping), implementing workarounds (REST batching for ordering, rate limiting, webhook batching), and avoiding anti-patterns (channel proliferation, retry storms, improper instantiation, chatty I/O, basic auth on client-side, ignored state loss). Use when implementing realtime features, building collaborative applications, integrating with backend systems, or handling presence and state synchronization.
version: 1.0.0
---
```

### Step 3: Extract Keywords from Query

Extract meaningful keywords from the user query for matching.

**Keyword Extraction Rules**:
1. **Remove Stop Words**: Common words that don't carry semantic meaning
   - Articles: the, a, an
   - Question words: how, what, when, where, why
   - Common verbs: is, are, was, were, be, been
   - Pronouns: it, this, that, these, those
   - Prepositions: in, on, at, to, for, of, with, by

2. **Extract Technical Terms**:
   - Library names: "ably", "algolia", "kafka", "linear", "mintlify"
   - Technology terms: "realtime", "search", "messaging", "streaming"
   - Action verbs: "implement", "build", "create", "setup", "configure"
   - Domain terms: "documentation", "presence", "indexing", "schema"

3. **Identify Multi-Word Phrases**:
   - "realtime messaging" → ["realtime", "messaging"]
   - "search functionality" → ["search", "functionality"]
   - "kafka producer" → ["kafka", "producer"]

4. **Prioritize Longer Terms**:
   - Longer, more specific terms are weighted higher
   - "realtime messaging" > "messaging" > "realtime"

**Example Query Extraction**:
```
Query: "I want to implement Ably realtime chat in my app"

Extracted Keywords:
- implement (action)
- ably (library name - high priority)
- realtime (technology term - high priority)
- chat (domain term)
- app (context - lower priority)
```

### Step 4: Calculate Matching Scores

For each skill, calculate two scores: keyword match score and semantic similarity score.

#### Keyword Match Score

Check if query keywords match the skill's `name` or appear in its `description`.

**Scoring Rules**:
- **Exact match with skill `name`**: 10 points
  - Query: "implement ably" → Skill: "implementing-ably-realtime" → Score: 10
- **Skill `name` contains keyword**: 8 points
  - Query: "ably" → Skill: "implementing-ably-realtime" → Score: 8
- **Keyword appears in skill `description`**: 5 points
  - Query: "realtime" → Skill description contains "realtime" → Score: 5
- **Partial match in `description`**: 2 points
  - Query: "messaging" → Skill description contains "messaging" → Score: 2

**Multiple Keywords**:
- Sum scores for all matching keywords
- Maximum keyword score: 20 (to prevent over-weighting)

**Example Calculation**:
```
Query: "implement ably realtime"
Skill: implementing-ably-realtime

Keyword Matching:
- "ably" → name contains "ably" → 8 points
- "realtime" → name contains "realtime" → 8 points
- "implement" → name contains "implementing" → 8 points

Total Keyword Score: 24 → Capped at 20
```

#### Semantic Similarity Score

Compare the semantic intent of the query with the skill's `description`.

**Scoring Approach**:
1. **Extract Query Intent**: Understand what the user wants to accomplish
   - "implement realtime chat" → Intent: realtime messaging, chat, presence
   - "setup search" → Intent: search functionality, indexing, querying

2. **Compare with Skill Description**: Check if skill description matches intent
   - High similarity (8-10): Skill description directly addresses query intent
   - Medium similarity (5-7): Skill description partially addresses intent
   - Low similarity (2-4): Skill description tangentially related
   - No similarity (0-1): Skill description unrelated

**Semantic Matching Factors**:
- **Technology Match**: Query mentions technology that skill implements
- **Use Case Match**: Query describes use case that skill addresses
- **Pattern Match**: Query needs patterns that skill provides
- **Domain Match**: Query is in domain that skill covers

**Example Calculation**:
```
Query: "build realtime chat with presence"
Skill: implementing-ably-realtime

Semantic Analysis:
- Query intent: realtime messaging, chat, presence management
- Skill description: "realtime messaging", "presence management", "collaborative applications"
- Match: High (direct match on all key concepts)

Semantic Score: 9
```

### Step 5: Combine Scores and Rank Skills

Combine keyword and semantic scores to get a final relevance score for each skill.

**Combined Score Formula**:
```
Combined Score = (Keyword Score × 0.6) + (Semantic Score × 0.4)
```

**Weighting Rationale**:
- Keyword matching (60%): More reliable for exact matches
- Semantic matching (40%): Captures intent when keywords don't match exactly

**Example Calculation**:
```
Skill: implementing-ably-realtime
Keyword Score: 20 (capped)
Semantic Score: 9

Combined Score = (20 × 0.6) + (9 × 0.4)
               = 12 + 3.6
               = 15.6
```

### Step 6: Select Skills

Rank all skills by combined score and select those above the threshold.

**Selection Criteria**:
- **Threshold**: Skills with combined score > 5.0 are considered
- **Top Selection**: Select skill(s) with highest score(s)
- **Multiple Selection**: If multiple skills score similarly (within 2 points), select all

**Selection Rules**:
1. If one skill scores significantly higher (>3 points), select only that skill
2. If multiple skills score similarly, select all relevant skills
3. If no skill scores above threshold, no skill is selected

**Example Selection**:
```
Query: "implement ably realtime"

Scores:
- implementing-ably-realtime: 15.6
- implementing-algolia-search: 2.1
- implementing-kafka-production: 1.8
- implementing-linear-excellence: 0.5
- mintlify-documentation: 0.3

Selected: implementing-ably-realtime (only skill above threshold, significantly higher)
```

## Matching Examples

### Example 1: Exact Keyword Match

**Query**: "implement ably"

**Matching Process**:
1. Keywords: ["implement", "ably"]
2. Skill: implementing-ably-realtime
   - Keyword: "ably" → name contains "ably" → 8 points
   - Keyword: "implement" → name contains "implementing" → 8 points
   - Keyword Score: 16
   - Semantic: Query intent matches skill description → 9 points
   - Combined: (16 × 0.6) + (9 × 0.4) = 13.2

**Result**: implementing-ably-realtime selected (score: 13.2)

### Example 2: Semantic Match

**Query**: "build realtime chat application"

**Matching Process**:
1. Keywords: ["build", "realtime", "chat", "application"]
2. Skill: implementing-ably-realtime
   - Keyword: "realtime" → description contains "realtime" → 5 points
   - Keyword: "chat" → description contains "collaborative applications" → 2 points
   - Keyword Score: 7
   - Semantic: Query intent (realtime chat) matches skill description → 9 points
   - Combined: (7 × 0.6) + (9 × 0.4) = 7.8

**Result**: implementing-ably-realtime selected (score: 7.8)

### Example 3: Multiple Skills Match

**Query**: "setup search functionality"

**Matching Process**:
1. Keywords: ["setup", "search", "functionality"]
2. Skills:
   - implementing-algolia-search:
     - Keyword: "search" → name contains "search" → 8 points
     - Keyword: "search" → description contains "search" → 5 points
     - Keyword Score: 13
     - Semantic: Query intent matches skill description → 9 points
     - Combined: (13 × 0.6) + (9 × 0.4) = 11.4
   - implementing-ably-realtime:
     - Keyword Score: 2
     - Semantic: Low match → 3 points
     - Combined: (2 × 0.6) + (3 × 0.4) = 2.4

**Result**: implementing-algolia-search selected (score: 11.4, only one above threshold)

### Example 4: No Match

**Query**: "fix hydration error"

**Matching Process**:
1. Keywords: ["fix", "hydration", "error"]
2. All skills:
   - implementing-ably-realtime: 0.5
   - implementing-algolia-search: 0.3
   - implementing-kafka-production: 0.2
   - implementing-linear-excellence: 0.1
   - mintlify-documentation: 0.1

**Result**: No skill selected (all scores below threshold of 5.0)

**Note**: This query would match `hydration-agent` instead, not `agent-skills`.

## Implementation Notes

### Performance Considerations

- **Metadata Caching**: Skill metadata (name, description) can be cached after first load
- **Lazy Loading**: Full skill content is only loaded when skill is selected
- **Parallel Matching**: All skills can be matched in parallel

### Extensibility

To add new skills:
1. Create new directory in `skills-hms/`
2. Add `SKILL.md` with YAML frontmatter
3. Ensure `name` and `description` fields are present
4. Discovery mechanism automatically includes new skill

### Debugging

To debug skill discovery:
1. Log extracted keywords from query
2. Log keyword scores for each skill
3. Log semantic scores for each skill
4. Log combined scores and ranking
5. Log selected skill(s) and reasoning

## Post-Discovery: Pattern Extraction

After a skill is selected through the discovery process, the following information should be extracted from the skill's `SKILL.md` file to support the interleaved guidance pattern (Phase 6):

### Extractable Sections

1. **Common Patterns** (if present):
   - Look for section titled "Common Patterns" or "Patterns"
   - Extract pattern names, descriptions, implementation steps, and examples
   - Note when each pattern should be applied
   - These patterns will be applied during code generation

2. **Best Practices** (if present):
   - Look in "Execution Steps" for "Critical Practices" or "Best Practices"
   - May be in separate "Best Practices" section
   - Extract practices with their rationale
   - These practices will be followed during code generation

3. **Workarounds** (if present):
   - Look for "Workarounds" section
   - Extract each workaround's "When" condition
   - Extract implementation steps and trade-offs
   - These workarounds will be applied when "When" conditions are met

4. **Anti-Patterns** (if present):
   - Look for "Anti-Patterns to Avoid" section
   - Extract each anti-pattern's description, issue, and resolution
   - Note how to detect and avoid each one
   - These anti-patterns will be verified after each code block

### Pattern Extraction Process

1. **Read Full Skill Content**: After skill selection, read complete `SKILL.md` file
2. **Identify Sections**: Locate "Common Patterns", "Best Practices", "Workarounds", "Anti-Patterns to Avoid" sections
3. **Extract Information**: Extract relevant information from each section
4. **Organize for Use**: Organize extracted information for use in interleaved guidance pattern

### Integration with Phase 6 Workflow

The extracted patterns, best practices, workarounds, and anti-patterns are used in the **Interleaved Guidance Pattern** (Phase 6, Step 5):

- **Before Code Blocks**: Reference extracted patterns, best practices, anti-patterns
- **During Code Generation**: Apply extracted patterns and best practices, implement workarounds
- **After Code Blocks**: Verify extracted anti-patterns are avoided

See `agent-framework/.cursorrules` for detailed Phase 6 workflow and interleaved guidance pattern.

## Related Documentation

- See `agent-framework/agents/agent-skills/agent.md` for agent definition and interleaved guidance pattern
- See `agent-framework/.cursorrules` for Skill-Assisted Development Flow (Phase 6)
- See `agent-framework/agents/agent-skills/skills-hms/` for available skills
- See `agent-framework/templates/skill-template.md` for skill structure that supports pattern extraction

