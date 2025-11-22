---
name: implementing-linear-excellence
description: Implements Linear operational excellence by applying proven patterns (Heirloom Tomato organizational model, work hierarchy decoupling, momentum-based cycles), following best practices (single assignee DRI, triage zero inbox, keyboard-first navigation), implementing workarounds (multiple assignees via sub-issues, reporting via Screenful, cooldowns via manual cycles), and avoiding anti-patterns (Jira-fication, backlog hoard, shadow work). References real-world implementations from Plum HQ and Descript. Use when setting up Linear workspaces, migrating from legacy tools, or optimizing workflows.
version: 1.0.0
---

# Implementing Linear Excellence

## Overview

Implements Linear operational excellence by applying proven organizational patterns, workflow best practices, and strategic workarounds while actively avoiding common anti-patterns. Provides procedural knowledge for configuring Linear workspaces, migrating from legacy tools, and optimizing existing workflows. Patterns validated by real-world implementations at Plum HQ and Descript.

## When to Use

Use this skill when:
- Setting up a new Linear workspace and need to apply proven organizational patterns from the start
- Migrating from Jira or other project management tools and want to avoid common anti-patterns
- Optimizing existing Linear workflows by applying best practices and implementing workarounds
- Detecting and fixing anti-patterns (Jira-fication, backlog hoard, shadow work) in current setup
- Implementing organizational restructuring using the Heirloom Tomato organizational model

**Input format**: Linear workspace with admin access, understanding of current organizational structure
**Expected output**: Configured Linear workspace following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Linear workspace with admin permissions for configuration changes
- Understanding of current organizational structure and team composition
- Access to GitHub and/or Slack for integration pattern implementation (if applicable)
- Organizational alignment with Linear's philosophy (high trust, high autonomy, momentum over reporting)

## Execution Steps

### Step 1: Apply Heirloom Tomato Organizational Pattern

Identify strategic priorities and configure teams asymmetrically based on importance, not symmetry.

**Implementation:**
1. Identify core product teams (strategic differentiators)
2. Allocate 50%+ headcount to core teams
3. Create lean peripheral teams for non-differentiating work
4. Configure wide scopes to prevent micro-silo fragmentation
5. Assign table-stakes work to shared/rotated teams, not permanent teams

**Pattern Template:**
```markdown
Core Team: [Name] - [Strategic differentiator]
- Headcount: [50%+ of total]
- Scope: [Wide, multiple surface areas]

Peripheral Team: [Name] - [Support function]
- Headcount: [Lean, minimal staffing]
- Scope: [Focused, non-differentiating]
```

**Best Practice:** Avoid symmetrical team sizing for chart aesthetics
**Anti-Pattern Avoidance:** Don't create permanent teams for maintenance work

### Step 2: Implement Work Hierarchy Pattern (Decoupling Scope from Time)

Configure Initiatives, Projects, Cycles, and Issues with clear separation between scope and time.

**Implementation:**
1. Create Initiatives for strategic goals (quarters/years, executive visibility)
2. Create Projects for finite work (weeks/months, max 1 quarter, clear outcome)
3. Configure Cycles for time-boxing (2-4 weeks, not tied to releases)
4. Create Issues as atomic units (days, single assignee)
5. Decouple Projects (scope) from Cycles (time) - key pattern

**Pattern Template:**
```markdown
Initiative: [Strategic Goal]
- Duration: [Quarters/Years]
- Purpose: Executive visibility, cross-team coordination

Project: [Feature/Outcome]
- Duration: [Weeks/Months, max 1 quarter]
- Owner: [Specific lead]
- Outcome: [Clear deliverable]
- Note: Can span multiple Cycles

Cycle: [Time-boxed period]
- Duration: [2-4 weeks]
- Purpose: Pacing and capacity planning
- Note: Not tied to releases, can host multiple Projects

Issue: [Atomic work]
- Assignee: [Single person - DRI principle]
- Duration: [Days, completable in few days]
- Can belong to: Project + Cycle simultaneously
```

**Best Practice:** Projects span multiple Cycles, Cycles host issues from multiple Projects
**Anti-Pattern Avoidance:** Don't force Projects into single Cycle (traditional Epic → Sprint)

### Step 3: Apply Single Assignee Best Practice (DRI Pattern)

Enforce one assignee per issue and apply workarounds for multiple contributors.

**Implementation:**
1. Enforce one assignee per issue (DRI principle)
2. For multiple contributors: Create sub-issues (parent tracks deliverable, sub-issues track individual work)
3. Alternative: Assign lead, others subscribe, transfer ownership as work passes
4. Minor contributions: Use markdown checklist with @mentions

**Pattern Template:**
```markdown
Sub-Issues Pattern:
- Parent Issue: [Feature Name] (Assigned to: [Lead])
  - Sub-Issue 1: [Design Component] (Assigned to: [Designer])
  - Sub-Issue 2: [Develop Component] (Assigned to: [Developer])

Lead + Subscribers Pattern:
- Issue: [Feature Name]
- Assignee: [Lead - responsible for delivery]
- Subscribers: [Contributor 1, Contributor 2]
- Transfer: Change assignee when work passes between contributors

Checklist Pattern:
- Issue Description: Markdown checklist with @mentions
- Example: "- [ ] Review copy @copywriter"
```

**Best Practice:** Single assignee ensures accountability (DRI principle)
**Anti-Pattern Avoidance:** Don't try to assign multiple people (Linear forbids this)

### Step 4: Implement Momentum-Based Cycle Pattern

Enable auto-rollover and focus on velocity and momentum, not sprint commitment tracking.

**Implementation:**
1. Enable auto-rollover (incomplete work moves to next cycle automatically)
2. Use Cycle Graph to monitor scope creep
3. Descope immediately if burn-down line flattens
4. Focus on velocity and momentum, not sprint commitment

**Pattern Template:**
```markdown
Cycle Configuration:
- Auto-rollover: Enabled
- Duration: [2-4 weeks]
- Capacity: Based on past cycle velocity

Monitoring:
- Cycle Graph: Track burn-down
- Action: Descope if line flattens
- Focus: Momentum, not commitment
```

**Best Practice:** Continuous flow of value delivery, not stop-and-start bursts
**Anti-Pattern Avoidance:** Don't create "shame rituals" for incomplete work

### Step 5: Apply Triage Zero Inbox Best Practice

Set up Triage as a decision gate with weekly gatekeeper rotation and Inbox Zero methodology.

**Implementation:**
1. Set up weekly gatekeeper rotation
2. Process all Triage items daily (Inbox Zero methodology)
3. Actions: Accept → Backlog/Cycle | Decline | Snooze (Shift+H) | Merge/Duplicate
4. Treat Triage as decision gate, not storage

**Pattern Template:**
```markdown
Triage Protocol:
- Gatekeeper: Weekly rotation among engineers
- Daily Process: Process all Triage items
- Actions:
  - Accept: Move to Backlog or active Cycle (validate priority)
  - Decline: Reject with comment explaining why
  - Snooze: Hide until relevant (Shift+H for keyboard shortcut)
  - Merge: Mark as duplicate of existing issue
- Principle: Triage is decision gate, not storage
```

**Best Practice:** Inbox Zero prevents notification fatigue
**Anti-Pattern Avoidance:** Don't let Triage become secondary backlog

### Step 6: Implement Keyboard-First Navigation Pattern

Master core shortcuts and navigation chains for speed and flow state maintenance.

**Implementation:**
1. Master core shortcuts: Cmd+K (command menu), C (create), S (status), A (assign), # (label)
2. Use navigation chains: G then I/T/B (Inbox/Triage/Backlog), O then P/C (Project/Cycle)
3. Document shortcuts for team adoption
4. Measure expertise by lack of mouse usage

**Pattern Template:**
```markdown
Core Actions:
- Cmd+K: Global command menu (control center)
- C: Create issue immediately
- S: Change status of selected issue
- A: Assign issue (to self or others)
- #: Add label to issue

Navigation Chains:
- G then I: Go to Inbox
- G then T: Go to Triage
- G then B: Go to Backlog
- O then P: Open Project
- O then C: Open Cycle
```

**Best Practice:** Speed through keyboard mastery, maintain flow state
**Anti-Pattern Avoidance:** Don't interact primarily with GUI (intentionally minimal)

### Step 7: Avoid Anti-Patterns During Implementation

Detect and prevent common anti-patterns: Jira-fication, backlog hoard, shadow work, and "Done" misunderstanding.

**Implementation:**
1. **Jira-fication Anti-Pattern:**
   - Detection: Complex status workflows, granular permissions, gate-keeping transitions
   - Prevention: Keep status list simple (Backlog → In Progress → In Review → Done)
   - Remove: QA Ready, QA In Progress, QA Approved, UAT Ready statuses
   - Accept: High trust, high autonomy (Linear's DNA)

2. **Backlog Hoard Anti-Pattern:**
   - Detection: Thousands of historical tickets, degraded search, psychological burden
   - Prevention: Start Fresh migration - import only active projects + current/next cycle tickets
   - Archive: Keep old system read-only for reference
   - Reset: "New tool, new habits" philosophy

3. **Shadow Work Anti-Pattern:**
   - Detection: Work consuming capacity but not tracked, inaccurate velocity metrics
   - Prevention: Log all work - use Draft PR integration for automatic issue creation
   - Discipline: No work outside Linear if it consumes capacity

4. **Misunderstanding "Done" Anti-Pattern:**
   - Detection: Tickets in "In Progress" until production deployment
   - Prevention: Define "Done" = PR Merged (engineer's contribution complete)
   - Deployment: Track via automations or separate "Released" status
   - Avoid: Tying "Done" to "Live in Production" (artificially drags cycles)

**Pattern Template:**
```markdown
Anti-Pattern Avoidance Checklist:
- [ ] Status workflow simplified to 4-5 core states
- [ ] No complex status chains or gate-keeping transitions
- [ ] Backlog contains only actionable work (no historical hoard)
- [ ] All work is logged (no shadow work)
- [ ] "Done" defined as PR Merged, not production deployment
```

### Step 8: Implement Workarounds for Limitations

Apply workarounds for Linear's constraints: multiple assignees, reporting gaps, cooldowns, and dependencies.

**Implementation:**
1. **Multiple Assignees Workaround:**
   - Limitation: Linear forbids multiple assignees (hard constraint)
   - Solution: Sub-issues pattern (parent + sub-issues for each contributor)
   - Alternative: Lead + Subscribers with ownership transfer

2. **Reporting Gaps Workaround:**
   - Limitation: Native reporting is basic (cycle velocity, flow diagrams)
   - Solution: Screenful Integration (third-party extension for advanced analytics)
   - Alternative: Export via Airbyte to Snowflake/BigQuery, build custom dashboards

3. **Cooldown Periods Workaround:**
   - Limitation: No explicit "Cooldown" assignment in Cycle settings
   - Solution: Create manual cycle labeled "Cooldown Week"
   - Alternative: Pause auto-cycle generation, use "Cooldown" label

4. **Cross-Team Dependencies Workaround:**
   - Limitation: No Gantt chart with hard blocking dependencies
   - Solution: Use "Blocking" and "Blocked By" relations (visual red icon)
   - Alternative: Weekly qualitative assessments in Project Updates feature

**Pattern Template:**
```markdown
Workaround Implementation:
- Multiple Assignees: Sub-issues pattern or Lead + Subscribers
- Reporting: Screenful integration or Data warehouse export
- Cooldowns: Manual "Cooldown Week" cycle or Label method
- Dependencies: "Blocking"/"Blocked By" relations + Project Updates
```

### Step 9: Apply Integration Patterns

Configure GitHub, Slack, and automation integrations to reduce administrative tax.

**Implementation:**
1. **GitHub Integration:**
   - Enable autolinking: [ENG-123] in branch name or PR title
   - Configure magic words: "Fixes ENG-123" or "Closes ENG-123" in PR description
   - Enable Draft PR sync: Opening Draft PR moves Linear issue to "In Progress"
   - Set up personal automation: Auto-assign when user opens PR

2. **Slack Integration:**
   - Configure "Create Issue from Message": Three dots menu → "Create Issue" (bidirectional link)
   - Route notifications: Low-noise channels (#eng-feed-linear)
   - Filter critical alerts: By label, route to high-priority channels

3. **Automation Patterns (Zapier/n8n):**
   - Recurring tasks: Zapier Schedule trigger → Create Issue in Linear
   - Customer feedback: Typeform/Google Forms/Intercom → Auto-create issue in Triage
   - Status emails: Pull Project Update text → Email stakeholders

**Pattern Template:**
```markdown
Integration Configuration:
- GitHub: Autolinking, Magic Words, Draft PR Sync, Personal Automation
- Slack: Create Issue from Message, Notification Routing, Critical Alert Filtering
- Automations: Recurring Tasks, Customer Feedback Loop, Status Emails
```

## Transformation Rules

1. **Organizational Transformation (Heirloom Tomato Pattern)**
   - Identify strategic priorities (core vs peripheral teams)
   - Allocate headcount asymmetrically (50%+ to core teams)
   - Configure wide scopes (prevent micro-silo fragmentation)
   - Transform permanent maintenance teams → shared/rotated responsibilities

2. **Work Hierarchy Transformation (Decoupling Pattern)**
   - Portfolio/Theme → Initiative (strategic goals, quarters/years)
   - Epic/Feature → Project (finite work, weeks/months, max 1 quarter, spans multiple Cycles)
   - Sprint → Cycle (time-boxed, 2-4 weeks, decoupled from scope, not tied to releases)
   - User Story/Task → Issue (atomic work, days, single assignee, belongs to Project + Cycle)

3. **Workflow Transformation (Simplification Pattern)**
   - Complex status chains → Simple 4-5 core states (Backlog → In Progress → In Review → Done)
   - Gate-keeping transitions → High-trust, high-autonomy flow
   - Granular permissions → Accept Linear's constraint (no field-level permissions by design)

## Examples

### Example 1: Start Fresh Migration Pattern

**Input Prompt**: "Migrate our 50-person engineering team from Jira to Linear. We have 10,000 historical tickets."

**Expected Output**: 
- Clean Linear workspace with only actionable work
- Teams configured using Heirloom Tomato pattern (asymmetrical sizing)
- Simple status workflow (Backlog → In Progress → In Review → Done)
- No backlog hoard (anti-pattern avoided)

**Processing Steps**:
1. Apply Start Fresh pattern: Do NOT import closed tickets (avoid backlog hoard anti-pattern)
2. Import only: Active sprint tickets + refined backlog (next 2 weeks)
3. Apply Heirloom Tomato pattern: Identify core teams, allocate 50%+ headcount
4. Apply Simplification pattern: Configure simple status workflow (avoid Jira-fication anti-pattern)
5. Archive: Keep Jira read-only for historical reference

**Key Pattern**: Start Fresh migration prevents importing "Jira baggage" (badly formatted stories, irrelevant fields, zombie tickets)

### Example 2: Plum HQ Manager vs Contributor Workflow Pattern

**Input Prompt**: "Set up Linear for our growing product org. Managers need to plan, contributors need to execute."

**Expected Output**:
- Decoupled planning (managers) and execution (contributors) workflows
- Projects spanning multiple Cycles (scope decoupled from time)
- Shared ownership of estimates (contributors populate Projects with Issues)

**Processing Steps**:
1. Apply Work Hierarchy pattern: Create Initiatives for high-level tracking (e.g., "Q3 Mobile Refresh")
2. Apply Decoupling pattern: Managers use Roadmap + Project views (plan scope), Contributors use Cycle + Issue views (execute)
3. Apply Planning Ritual pattern: Managers set Projects, Contributors populate with Issues during planning phase
4. Apply Integration pattern: Configure GitHub integration for automatic issue updates

**Key Pattern**: Decoupling scope (Projects) from time (Cycles) allows accurate progress tracking - managers see Project burn-up, contributors see Cycle velocity

## Error Handling

- **Complex status workflow causing friction (Jira-fication anti-pattern)**
  - **Detection**: Multiple status transitions, gate-keeping workflows, granular permissions
  - **Resolution**: Apply Simplification pattern - reduce to 4-5 core states, remove gate-keeping transitions
  - **Pattern Applied**: Simplification pattern

- **Backlog hoard degrading performance**
  - **Detection**: Thousands of historical tickets, degraded search, psychological burden
  - **Resolution**: Apply Start Fresh migration pattern - archive old tickets, import only active work
  - **Pattern Applied**: Start Fresh migration pattern

- **Multiple assignees needed but Linear forbids it**
  - **Detection**: Task legitimately requires two people
  - **Resolution**: Apply Sub-issues workaround - create parent issue + sub-issues for each contributor
  - **Workaround Applied**: Sub-issues pattern or Lead + Subscribers pattern

- **Reporting gaps for executives**
  - **Detection**: Native reporting insufficient for executive needs
  - **Resolution**: Apply Reporting workaround - integrate Screenful or export to data warehouse
  - **Workaround Applied**: Screenful integration or Airbyte + data warehouse export

- **Shadow work consuming capacity invisibly**
  - **Detection**: Work being done but not tracked, inaccurate velocity metrics
  - **Resolution**: Apply Log All Work best practice - use Draft PR integration for automatic issue creation
  - **Best Practice Applied**: Log all work pattern

- **Fallback Strategy**: If Linear constraints conflict with organizational needs, evaluate if constraint should be accepted (Linear's philosophy) or if workaround is appropriate. Linear works best when organizations adapt to its constraints rather than fighting them.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No Linear API keys in SKILL.md or scripts
- ❌ No credentials in code
- ✅ Use external credential management for integrations (GitHub, Slack, Zapier)
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Linear workspace admin permissions required for pattern implementation
- GitHub/Slack integration requires appropriate OAuth setup
- Rate limiting considerations for API integrations
- Screenful/data warehouse integrations require external service setup

## Dependencies

This skill requires no external packages. All instructions are procedural knowledge for applying patterns, best practices, workarounds, and avoiding anti-patterns in Linear workspace configuration.

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

## Performance Considerations

- **Token Efficiency**: Move extensive pattern reference to `resources/LINEAR_PATTERNS_REFERENCE.md`
- **Large Migrations**: Apply Start Fresh pattern - process in batches, import only active work
- **Search Performance**: Avoid backlog hoard anti-pattern - keep only actionable items
- **Team Adoption**: Implement keyboard-first navigation pattern for speed gains (50 tickets in 5 minutes)

## Related Resources

For extensive reference materials, see:
- `resources/LINEAR_PATTERNS_REFERENCE.md`: Detailed pattern definitions, anti-pattern catalog, workaround library
- Linear documentation: Official Linear guides and API documentation
- Real-world case studies: Plum HQ (manager/contributor workflow), Descript (triage zero inbox)

## Notes

- **Pattern Philosophy**: Linear enforces constraints by design - success requires accepting constraints as mechanisms for focus
- **Organizational Change**: Adoption requires organizational restructure, not just tool substitution
- **Momentum Focus**: Linear prioritizes momentum over comprehensive reporting
- **Keyboard Mastery**: Keyboard-first navigation is essential for power users (50 tickets in 5 minutes)
- **Real-World Validation**: Patterns validated by Plum HQ (manager/contributor workflow) and Descript (triage zero inbox)
- **Anti-Pattern Prevention**: Most failures come from replicating dysfunctional processes from previous tools
- **Workaround Philosophy**: Workarounds bridge limitations without compromising Linear's speed and simplicity

