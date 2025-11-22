---
id: agent-skills
name: Agent Skills
description: Special routing agent that discovers and selects skills from skills-hms directory for skill-assisted development. This agent routes to implementation skills rather than fixing issues.
version: 1.0.0
capabilities:
  - route
  - discover
  - select
triggers:
  - implement
  - build
  - create
  - develop
  - setup
  - configure
  - integrate
  - add
  - make
  - generate
  - new
  - initialize
  - write
semanticKeywords:
  - ably
  - algolia
  - kafka
  - linear
  - mintlify
  - nextjs
  - next.js
  - app router
  - server components
  - server actions
  - react server components
  - rsc
  - realtime
  - search
  - documentation
  - messaging
  - pubsub
  - stream processing
  - project management
  - api documentation
  - openapi
  - collaborative
  - presence
  - indexing
  - schema registry
  - workspace
  - spring boot
  - virtual threads
  - restclient
  - micrometer
  - opentelemetry
  - otlp
  - java
  - microservices
  - jdk 21
  - observability
  - distributed tracing
  - opa
  - open policy agent
  - rego
  - policy as code
  - authorization
  - admission control
  - gatekeeper
  - envoy authorization
  - service mesh authz
  - policy enforcement
  - policy decision point
  - pdp
  - pep
  - policy enforcement point
  - kuma
  - kong mesh
  - service mesh
  - multi-zone
  - global control plane
  - zone control plane
  - data plane
  - control plane
  - zone ingress
  - delegated gateway
  - hybrid fleet
  - mesh policy
  - mesh governance
  - zero trust mesh
  - mtls
  - mesh observability
  - cross-zone routing
  - mesh connectivity
  - universal control plane
  - unleash
  - feature flags
  - feature toggles
  - featureops
  - gradual rollout
  - ab testing
  - kill switch
  - flyway
  - database migration
  - schema versioning
  - shadcn
  - shadcn/ui
  - radix ui
  - radix primitives
  - radix components
  - asChild
  - headless components
  - accessible components
  - wai-aria
  - portal components
  - class-variance-authority
  - cva
  - design system
  - component library
  - ui components
  - tailwind components
  - redis
  - cache
  - rate limiting
  - sentinel
  - cluster
  - persistence
  - rdb
  - aof
  - cache-aside
  - write-through
  - write-behind
  - hot key
  - big key
  - redis-alpine
  - redis 7-alpine
  - containerized redis
  - docker redis
  - kubernetes redis
  - musl libc
  - alpine redis
  - container deployment
  - tailwind
  - utility-first
  - design tokens
  - jit
  - postcss
  - component-first
  - headless ui
  - flyway checksum
  - flyway baseline
  - flyway repair
  - flyway validation
  - schema drift
  - java migration
  - flyway callback
  - sqlfluff
  - code analysis
  - snapshot management
  - flyway toml
  - repeatable migration
  - react 18
  - concurrent rendering
  - usetransition
  - usedeferredvalue
  - react hooks
  - component composition
  - state management
  - zustand
  - react query
  - memoization
  - code splitting
  - error boundaries
  - portals
  - react hook form
  - atomic design
  - custom hooks
  - compound components
  - anti-patterns
  - stale closures
  - prop drilling
  - context api
  - flowable
  - bpmn
  - cmmn
  - dmn
  - process orchestration
  - case management
  - saga pattern
  - external agent
  - workflow engine
  - business process management
semanticDescription: Routes to implementation skills from skills-hms for building features, integrating services, configuring systems, and setting up tools. This agent discovers and selects appropriate skills based on query intent and applies them during code development.
filePatterns:
  - "*.tsx"
  - "*.ts"
  - "*.jsx"
  - "*.js"
  - "*.py"
  - "*.json"
  - "*.yaml"
  - "*.yml"
  - "*.md"
context7:
  libraries: []
  topics:
    - implementation
    - integration
    - configuration
  fetchStrategy: on-demand
proactiveMode:
  enabled: true
  triggers:
    - filePatterns: ["*.tsx", "*.ts", "*.jsx", "*.js", "*.py", "*.json", "*.yaml", "*.yml"]
    - implementationQueries: true
    - developmentQueries: true
  autoScan: false
  autoFix: false
---

# Agent Skills

## Overview

This is a **special routing agent** that discovers and selects skills from the `skills-hms` directory for skill-assisted development. Unlike other agents that detect and fix issues, this agent routes to implementation skills that provide procedural knowledge for building features, integrating services, and configuring systems.

**Key Difference**: This agent does NOT fix issues. It provides guidance during code development by routing to appropriate skills that contain best practices, patterns, workarounds, and anti-patterns for specific technologies or systems.

## Purpose

- **Route to Skills**: Discovers and selects relevant skills from `skills-hms/` directory
- **Skill-Assisted Development**: Provides interleaved guidance during code generation
- **Implementation Guidance**: Applies proven patterns, best practices, and workarounds during development
- **Anti-Pattern Prevention**: Ensures anti-patterns are avoided during implementation

## Skill Discovery Mechanism

This agent implements a skill discovery system that matches user queries to skills using both keyword and semantic matching.

### Discovery Process

1. **Scan Skills Directory**: Automatically lists **ALL** skill directories in `agent-framework/agents/agent-skills/skills-hms/` (excluding `template/` directory). All skills in this directory are automatically discovered and available for matching during query processing.
2. **Load Skill Metadata**: Reads YAML frontmatter from each skill's `SKILL.md` file
3. **Extract Discovery Data**:
   - `name` field (for keyword matching)
   - `description` field (for semantic matching)
   - `dependencies` (for context)
4. **Match Query to Skills**:
   - **Keyword Matching**: Check if query keywords match skill `name` or appear in `description`
   - **Semantic Matching**: Compare query intent with skill `description` semantic meaning
   - **Ranking**: Score skills by relevance (exact keyword match > semantic similarity > partial match)
5. **Select Skill(s)**: Choose most relevant skill(s) based on combined scores

### Matching Algorithm

**Step 1: Extract Keywords**
- Remove stop words (the, a, an, how, what, etc.)
- Extract technical terms, library names, concepts
- Identify multi-word phrases
- Prioritize longer, more specific terms

**Step 2: Calculate Scores**
For each skill in `skills-hms/`:
- **Keyword Match Score**:
  - Exact match with skill `name`: 10 points
  - Skill `name` contains keyword: 8 points
  - Keyword appears in skill `description`: 5 points
  - Partial match in `description`: 2 points
- **Semantic Similarity Score**:
  - Compare query intent with skill `description` semantic meaning
  - Score based on semantic similarity (0-10 scale)
- **Combined Score**:
  - Keyword score × 0.6 + Semantic score × 0.4
  - Threshold: Skills with score > 5.0 are considered

**Step 3: Select Skills**
- Rank all skills by combined score
- Select top skill(s) above threshold
- If multiple skills match, select all relevant ones

### Available Skills

The following skills are available in `skills-hms/`:

1. **implementing-ably-realtime**: Implements Ably realtime messaging by applying proven patterns (Pub/Sub with global elasticity, ephemeral channels, token authentication, automatic reconnection, LiveObjects with CRDTs, presence management), following best practices (singleton SDK instance, History API recovery, exponential backoff, batched webhooks, channel scoping), implementing workarounds (REST batching for ordering, rate limiting, webhook batching), and avoiding anti-patterns (channel proliferation, retry storms, improper instantiation, chatty I/O, basic auth on client-side, ignored state loss). Use when implementing realtime features, building collaborative applications, integrating with backend systems, or handling presence and state synchronization.
2. **implementing-algolia-search**: Implements Algolia search functionality by applying proven patterns (radical denormalization, frontend direct search, secured API keys for multi-tenancy, custom ranking), following best practices (selective indexing, batching operations, infinite scroll, debouncing), implementing workarounds (record splitting with Distinct, atomic re-indexing, paginationLimitedTo), and avoiding anti-patterns (normalized structures, dump-and-pray indexing, backend proxying, index-per-tenant). Use when implementing search functionality, migrating from database-based search, optimizing existing Algolia implementations, or handling multi-tenant search requirements.
3. **implementing-flyway-db-enterprise**: Implements Flyway DB 11.x enterprise database lifecycle management by applying proven patterns (Immutability Principle with Schema History Table, Atomic Change Pattern, Directory Separation, Validation-First CI/CD, Snapshot and Drift Detection), following best practices (strict naming conventions, dedicated migration users with privilege separation, backward compatibility for zero-downtime, quality gates with code analysis, callback lifecycle hooks), implementing workarounds (Repair Safety Protocol for checksum mismatches, Out-of-Order Migration for hotfixes, Baseline Pattern for legacy systems), and avoiding anti-patterns (mutability of applied versioned scripts, retrospective insertion, relying on undo for disaster recovery, missing privilege separation, skipping validation steps). Use when implementing database migrations in Java/Spring Boot projects, setting up CI/CD database deployment pipelines, managing multi-environment schemas, enforcing database governance, or detecting schema drift.
4. **implementing-kafka-production**: Implements Apache Kafka production deployments by applying patterns (over-partitioning for keyed messages, high-throughput producer tuning, consumer parallelism, binary serialization Avro/Protobuf, HA/DR with replication/ISR, Dead Letter Queue, backpressure management, Kafka Streams stateful processing), following best practices (partition sizing, manual offset management, schema evolution, rack awareness, standby replicas), implementing workarounds (kafka-reassign-partitions, bounded queues, pause/resume, level compaction), and avoiding anti-patterns (Kafka as SoT, topic overproliferation, single-partition topics, partition skew, default producer settings, under-provisioned consumers, textual formats). Use when deploying Kafka in production, optimizing throughput, mitigating consumer lag, implementing schema evolution, disaster recovery, managing backpressure, or stateful stream processing.
5. **implementing-linear-excellence**: Implements Linear operational excellence by applying proven patterns (Heirloom Tomato organizational model, work hierarchy decoupling, momentum-based cycles), following best practices (single assignee DRI, triage zero inbox, keyboard-first navigation), implementing workarounds (multiple assignees via sub-issues, reporting via Screenful, cooldowns via manual cycles), and avoiding anti-patterns (Jira-fication, backlog hoard, shadow work). References real-world implementations from Plum HQ and Descript. Use when setting up Linear workspaces, migrating from legacy tools, or optimizing workflows.
6. **implementing-nextjs-14-production**: Implements Next.js 14 App Router production patterns by applying proven architectural strategies (Server Components as default, Server Actions for mutations, comprehensive caching with revalidatePath/revalidateTag, Parallel/Intercepting Routes, middleware optimization), following best practices (component interleaving, serialization constraints, mandatory validation/auth, useActionState error handling), implementing workarounds (Date serialization, cache externalization for multi-replica, REST batching), and avoiding anti-patterns (direct SC import into CC, non-serializable props, Server Actions for reads, missing validation, local cache in multi-replica). Use when building Next.js 14 applications, implementing Server Components, setting up caching strategies, configuring advanced routing, or deploying to production environments.
7. **implementing-radix-ui-production**: Implements Radix UI primitives using architectural patterns (asChild composition with mandatory prop spreading and ref forwarding, component abstraction for custom APIs, data attribute styling for state-driven visuals), applying best practices (semantic responsibility, WAI-ARIA labeling, portal container pattern), implementing workarounds (CSS layering for Tailwind conflicts, portal context preservation, theme palette abstraction), and avoiding anti-patterns (missing prop spreading causing broken functionality, non-functional element overrides breaking accessibility, CSS order conflicts removing styles, portal context loss breaking theming, rigid theming limiting design flexibility). Use when building accessible UI components, integrating with design systems, managing portals and theming, or creating production-ready interactive components.
8. **implementing-redis-production**: Implements Redis production deployments by applying patterns (Cache-Aside lazy loading, Write-Through consistency, Write-Behind async buffering, atomic rate limiting), following best practices (connection pool sizing, eviction policies volatile-lru/allkeys-lru, HA/Scaling Sentinel/Cluster decision, memory reservations, proactive expiration), implementing workarounds (hot key distribution via client-side caching/read replicas, big key mitigation via splitting/async UNLINK, optimistic locking WATCH/MULTI/EXEC, memory fragmentation MEMORY PURGE), and avoiding anti-patterns (Redis as SoT, big keys >1MB, hot key contention, blocking operations KEYS/unbounded queries, connection pool exhaustion, noeviction on caches, large JSON blobs). Use when deploying Redis in production, optimizing caching strategies, implementing rate limiting, setting up HA/Cluster, managing memory, mitigating big/hot keys, or configuring persistence RDB/AOF.
9. **implementing-shadcn-ui-production**: Implements shadcn/ui components using open code distribution model by applying atomic composition patterns (building composites from primitives), CVA standardization (class-variance-authority for type-safe variants), advanced theming (dark mode via next-themes, custom design tokens with @theme directive), following best practices (component composition with Context/Redux, mandatory CVA usage, dual CSS variable declaration, component governance policy, mandatory Axe testing), implementing workarounds (controlled upstream synchronization with diff workflow, monorepo adoption with packages/ui, managed internal library with Bit), and avoiding anti-patterns (maintenance debt trap from neglected updates, SSR hydration errors from client logic in Server Components, Tailwind typography conflicts from hardcoded values, accessibility regression from missing ARIA). Use when building production UI systems, customizing components, setting up design tokens, managing component lifecycle, or avoiding integration pitfalls.
10. **implementing-spring-boot-3.2**: Implements production-ready Spring Boot 3.2.0 applications using Virtual Threads for high-concurrency I/O operations, RestClient migration from RestTemplate with timeouts and error handling, Micrometer/OpenTelemetry OTLP tracing, stateless REST security with JWT, and concurrent initialization. Avoids anti-patterns: transactional overload on reads, business logic in controllers, blocking I/O in reactive code, unbounded caching. Implements workarounds: DevTools remote deployment tuning, RestClient logging, tracing sampling. Use when migrating to Spring Boot 3.2.0, implementing high-throughput microservices with Java 21, replacing RestTemplate, or setting up distributed tracing.
11. **implementing-tailwind-enterprise**: Implements enterprise-scale Tailwind CSS by applying architectural patterns (Component-First Abstraction, Semantic Design Tokens, Headless UI Integration), following best practices (JIT content configuration, theme customization, performance optimization), implementing workarounds (CSS variables for dynamic styling, arbitrary values, custom modifiers), and avoiding anti-patterns (@apply misuse, class soup, ignoring theme customization, dynamic class generation). Use when building large-scale frontend applications, migrating from legacy CSS, implementing design systems, or optimizing CSS bundle size.
12. **implementing-unleash-featureops**: Implements Unleash v9.2.0 feature flag management by applying proven architectural patterns (SPOE single point evaluation, abstraction layer decoupling, multi-strategy inclusive OR logic, Edge daisy chaining for multi-region), following best practices (complete context building, constraint-based targeting over custom strategies, userId stickiness for A/B testing, telemetry-enabled governance), implementing workarounds (Edge daisy chaining for latency mitigation, constraint-based targeting as alternative to custom strategies), and avoiding anti-patterns (flag sprawl, long-lived flags becoming config, fragmented evaluation, custom strategy overload, incomplete context, missing telemetry). Use when implementing feature flags, setting up A/B testing infrastructure, configuring gradual rollouts, deploying multi-region feature flag infrastructure, or managing feature flag lifecycle and governance.
13. **mintlify-documentation**: Implements and configures Mintlify documentation sites following best practices, avoiding common anti-patterns, and applying workarounds for API reference integration, personalization, and customization. Use when setting up new Mintlify sites, troubleshooting blank API pages, configuring OpenAPI integration, implementing personalization features, or applying custom styling workarounds.
14. **implementing-redis-7-alpine-containerized**: Implements Redis 7-Alpine containerized deployments by applying container-specific patterns (multi-stage builds for musl/glibc compatibility, network isolation, connection pooling/multiplexing, pipelining, Lua scripting with EVALSHA), following best practices (Alpine image optimization, security hardening with CONFIG command disable, AOF persistence, LFU eviction for hot keys, co-location strategies), implementing workarounds (client-side caching for hot keys, key sharding, MEMORY PURGE for fragmentation, cache stampede mutex locks), and avoiding anti-patterns (KEYS command blocking, caching without TTL, hot key bottlenecks, JSON string storage, frequent connection open/close, musl/glibc compatibility issues). Use when deploying Redis 7 in Docker/Kubernetes with Alpine images, optimizing containerized Redis performance, handling musl libc compatibility, securing containerized Redis instances, or implementing high-performance patterns in containerized environments.
15. **implementing-react-18-architecture**: Implements React 18 scalable architecture by applying concurrent rendering patterns (useTransition for non-urgent updates, useDeferredValue for UI stabilization, createRoot initialization), component composition strategies (Custom Hooks for reusable logic, Compound Components with Context API, Atomic Design hierarchy), state management best practices (local state colocation, Context for static data only, subscription-based libraries for high-frequency updates, React Query for server state), performance optimization (strategic memoization, code splitting with Suspense), implementing workarounds (functional state updates for stale closures, component definition outside render, Context API for prop drilling), and avoiding anti-patterns (legacy ReactDOM.render, business logic in Atoms, everything in App state lifting, Context for high-frequency updates, stale closures, inline component creation, prop drilling, premature memoization, manual useEffect data fetching). Use when building scalable React 18 applications, implementing concurrent features, setting up component architecture, managing state, optimizing performance, or avoiding common React pitfalls.
16. **implementing-flowable-orchestration**: Implements Flowable 2025.1 Intelligent Orchestration by applying proven patterns (Saga Orchestration for microservices consistency, External Agent Bridge for AI integration, External Worker for long-running tasks, Event Registry for EDA), following best practices (Transient Variable Doctrine, History/Runtime separation, thread-safe delegates, secure configuration), implementing workarounds (asynchronous continuation for parallel joins, Job Executor pool sizing, process versioning with migration tools), and avoiding anti-patterns (synchronous parallel gateway joins causing optimistic locking, data hoarding with persistent variables, Job Executor pool exhaustion, implicit script variable assignment). Use when implementing BPMN/CMMN/DMN processes, integrating with microservices, orchestrating AI agents, setting up event-driven architectures, or managing long-running workflows.
17. **implementing-kuma-production**: Implements Kuma (Kong Mesh) service mesh production deployments by applying patterns (Global/Zone CP separation, multi-zone topology, delegated gateway, hybrid fleet management), following best practices (mTLS with CA rotation, control plane sizing, reachable-services, policy layering), implementing workarounds (Argo CD certificate drift, CNI for GKE Autopilot, Cilium compatibility), and avoiding anti-patterns (policy fragmentation, quorum loss, configuration drift, in-memory storage). Use when implementing service mesh, zero trust architecture, multi-cluster connectivity, hybrid Kubernetes/VM deployments, or API gateway integration.
18. **implementing-opa-production**: Implements Open Policy Agent (OPA) production policies by applying patterns (Centralized Control Plane/Decentralized Enforcement, Embedded/Sidecar/Gateway/Mesh deployment, Policy-Data separation, RBAC/ABAC, Multi-tenant isolation), following best practices (--strict compilation, violation sets for warn/deny modes, modular packages, GitOps versioning, 90%+ test coverage, guard clauses, indexing), implementing workarounds (Partial Evaluation for high-QPS, Evaluation Pull for massive datasets, data pruning, client-side caching), and avoiding anti-patterns (complex business logic in policies, mixing policy+data, overly complex JSON, large bundles, untestable rules, using OPA as backend). Use when implementing Kubernetes admission control, microservices authorization, API Gateway policies, multi-tenant SaaS, Infrastructure-as-Code validation, CI/CD enforcement, or compliance systems.

## Skill-Assisted Development Flow

When this agent is matched and a skill is selected, the **Skill-Assisted Development Flow** (Phase 6) is activated. This flow provides interleaved guidance during code generation.

### Interleaved Guidance Pattern

During code development, the selected skill's instructions are applied throughout the generation process using the **Before/During/After** pattern:

#### Before Code Generation

1. **Load Full Skill Content**: Read complete `SKILL.md` file for selected skill(s)
2. **Extract Key Information**:
   - **Execution Steps**: From "Execution Steps" section - step-by-step implementation guide
   - **Common Patterns**: From "Common Patterns" section - proven patterns with examples
   - **Best Practices**: From "Execution Steps" (Critical Practices) or "Best Practices" section
   - **Workarounds**: From "Workarounds" section - when to use and how to implement
   - **Anti-Patterns**: From "Anti-Patterns to Avoid" section - what to avoid and how
   - **Examples and Templates**: From skill's examples and templates directories
3. **Load Referenced Resources**: If skill references resources/templates:
   - Read files from `resources/` directory
   - Read files from `templates/` directory
   - Load any referenced scripts or examples

#### Before Each Code Block

1. **Reference Skill Instructions**: Read relevant sections from skill's `SKILL.md` that apply to the code being generated
2. **Extract Patterns**: Identify which patterns from skill's "Common Patterns" section should be applied
3. **Identify Best Practices**: Note which best practices from skill's "Execution Steps" or "Best Practices" section should be followed
4. **Note Anti-Patterns**: List which anti-patterns from skill's "Anti-Patterns to Avoid" section must be avoided
5. **Check Workarounds**: Review skill's "Workarounds" section to determine if any workarounds are applicable based on "When" conditions

#### During Code Generation

1. **Apply Patterns**: Implement skill's proven patterns as you write code (from "Common Patterns" section)
2. **Follow Best Practices**: Apply skill's best practices in code structure (from "Execution Steps" or "Best Practices" section)
3. **Implement Workarounds**: Apply skill's workarounds where "When" conditions are met (from "Workarounds" section)
4. **Use Examples/Templates**: Reference skill's examples and templates as guidance for code structure
5. **Reference Execution Steps**: Follow skill's execution steps in order for proper implementation
6. **Apply Transformation Rules**: Follow skill's transformation rules (if present) for data/code transformation

#### After Code Blocks

1. **Verify Anti-Patterns**: Check each anti-pattern from skill's "Anti-Patterns to Avoid" section:
   - Verify the anti-pattern is not present in generated code
   - Check for patterns that might lead to the anti-pattern
   - Confirm resolution steps from skill are applied if anti-pattern was detected
2. **Verify Best Practices**: Confirm that best practices from skill are correctly applied
3. **Verify Patterns**: Ensure patterns from skill are correctly implemented
4. **Verify Workarounds**: If workarounds were applied, verify they're correctly implemented with proper trade-off documentation

#### Throughout Development

1. **Continuous Reference**: Continuously reference skill instructions at each development step
2. **Pattern Compliance**: Ensure code follows skill's patterns and best practices throughout
3. **Anti-Pattern Prevention**: Actively avoid anti-patterns during implementation, not just after
4. **Workaround Documentation**: Document any workarounds used and their maintenance implications

### Pattern Extraction from Skills

When loading a skill, systematically extract the following sections from `SKILL.md`:

1. **Common Patterns** (if present):
   - Look for section titled "Common Patterns" or "Patterns"
   - Extract pattern names, descriptions, and examples
   - Note when each pattern should be applied
   - Example: Mintlify skill has "Pattern 1: OpenAPI Validation Workflow", "Pattern 2: Path Conflict Resolution"

2. **Best Practices** (if present):
   - Look in "Execution Steps" for "Critical Practices" or "Best Practices"
   - May be in separate "Best Practices" section
   - Extract practices with their rationale
   - Example: Ably skill has "Use singleton SDK instance", "Channels are ephemeral"

3. **Workarounds** (if present):
   - Look for "Workarounds" section
   - Extract each workaround's "When" condition
   - Extract implementation steps and trade-offs
   - Example: Mintlify skill has "Workaround 1: CORS Configuration", "Workaround 2: Custom UI Element Targeting"

4. **Anti-Patterns** (if present):
   - Look for "Anti-Patterns to Avoid" section
   - Extract each anti-pattern's description, issue, and resolution
   - Note how to detect and avoid each one
   - Example: Mintlify skill has "OpenAPI 2.0 Usage", "Path Mismatch", "Case Sensitivity Failure"

### Anti-Pattern Verification Process

After each code block, systematically verify:

1. **Check Each Anti-Pattern**: For each anti-pattern listed in skill's "Anti-Patterns to Avoid" section:
   - Verify the anti-pattern is not present in generated code
   - Check for patterns that might lead to the anti-pattern
   - Confirm resolution steps from skill are applied if anti-pattern was detected

2. **Verification Checklist**:
   - [ ] All anti-patterns from skill checked
   - [ ] No anti-pattern instances found in code
   - [ ] Resolution steps applied if anti-pattern detected
   - [ ] Code structure prevents anti-pattern occurrence

### Best Practices Application Process

During code generation, apply best practices:

1. **Identify Applicable Practices**: From skill's best practices section, identify which apply to current code block
2. **Apply Practices**: Implement best practices in code structure, naming, organization
3. **Verify Application**: After code block, verify practices are correctly applied

### Workaround Implementation Process

When workarounds are needed:

1. **Check "When" Conditions**: Review each workaround's "When" condition to determine applicability
2. **Evaluate Trade-offs**: Understand maintenance debt and trade-offs before applying
3. **Implement Workaround**: Follow workaround's implementation steps exactly
4. **Document Usage**: Document that workaround was used and why, including maintenance implications

### Example Flow: Ably Realtime

```
Query: "Implement Ably realtime chat"

1. Agent matches: agent-skills (implementation keyword detected)
2. Skill discovery: 
   - Scans skills-hms/
   - Matches "implementing-ably-realtime" (keyword: "ably", semantic: "realtime chat")
   - Score: 9.2 (above threshold)
3. Skill loading:
   - Reads implementing-ably-realtime/SKILL.md
   - Extracts patterns: singleton SDK instance, ephemeral channels, token authentication
   - Extracts best practices: reuse SDK throughout lifecycle, subscribe before publishing
   - Extracts anti-patterns: channel proliferation, retry storms, basic auth on client-side
   - Extracts workarounds: REST batching for ordering, rate limiting
4. Interleaved code generation:
   - [Before]: Reference skill instruction "Use singleton SDK instance"
   - [During]: Apply pattern - Generate: const ably = new Ably.Realtime({ authUrl: '/api/ably-token' });
   - [After]: Verify anti-pattern "improper instantiation" avoided (singleton used)
   
   - [Before]: Reference skill instruction "Channels are ephemeral - no pre-provisioning"
   - [During]: Apply pattern - Generate: const channel = ably.channels.get('room:general');
   - [After]: Verify anti-pattern "channel proliferation" avoided (logical grouping)
   
   - [Before]: Reference skill instruction "Use token authentication for client-side (mandatory)"
   - [During]: Apply best practice - Verify: authUrl configured, not using basic auth
   - [After]: Verify anti-pattern "basic auth on client-side" avoided
   
   - [Before]: Reference skill instruction "Subscribe to messages before publishing"
   - [During]: Apply best practice - Generate: channel.subscribe((message) => { ... });
   - [After]: Verify best practice correctly applied
   
   Complete implementation following all Ably patterns and best practices
```

### Example Flow: Mintlify Documentation

```
Query: "Implement Mintlify documentation"

1. Agent matches: agent-skills (implementation keyword detected)
2. Skill discovery:
   - Matches "mintlify-documentation" (keyword: "mintlify", semantic: "documentation")
   - Score: 8.5 (above threshold)
3. Skill loading:
   - Reads mintlify-documentation/SKILL.md
   - Extracts patterns: OpenAPI Validation Workflow, Path Conflict Resolution
   - Extracts best practices: Always include $schema, select theme strategically
   - Extracts anti-patterns: OpenAPI 2.0 Usage, Path Mismatch, Case Sensitivity Failure
   - Extracts workarounds: CORS Configuration, Custom UI Element Targeting
4. Interleaved code generation:
   - [Before]: Reference skill instruction "Always include $schema reference"
   - [During]: Apply best practice - Generate: { "$schema": "https://mintlify.com/docs.json", ... }
   - [After]: Verify best practice correctly applied
   
   - [Before]: Reference skill instruction "Select theme strategically: maple (modern, clean)"
   - [During]: Apply best practice - Generate: "theme": "maple"
   - [After]: Verify best practice correctly applied
   
   - [Before]: Note anti-pattern "OpenAPI 2.0 Usage" must be avoided
   - [During]: If adding OpenAPI, ensure it's 3.x only
   - [After]: Verify anti-pattern "OpenAPI 2.0 Usage" avoided (no OpenAPI 2.0 references)
   
   Complete implementation following Mintlify patterns and best practices
```

### Example Flow: Algolia Search

```
Query: "Setup Algolia search"

1. Agent matches: agent-skills (keyword: "setup")
2. Skill discovery:
   - Matches "implementing-algolia-search" (keyword: "algolia", semantic: "search")
   - Score: 10.1 (above threshold)
3. Skill loading:
   - Reads implementing-algolia-search/SKILL.md
   - Extracts patterns: Radical denormalization, Frontend direct search
   - Extracts best practices: Flatten all related data, use Search-Only API key
   - Extracts anti-patterns: Normalized structures, Admin API key on frontend
4. Interleaved code generation:
   - [Before]: Reference skill instruction "Radical denormalization - flatten all related data"
   - [During]: Apply pattern - Generate: Flattened product record with all related data
   - [After]: Verify anti-pattern "normalized structures" avoided (data is flattened)
   
   - [Before]: Reference skill instruction "Frontend direct search - use Search-Only API key"
   - [During]: Apply best practice - Generate: Client-side search with Search-Only key
   - [After]: Verify anti-pattern "Admin API key on frontend" avoided
   
   Complete implementation following Algolia patterns and best practices
```

## Reactive Flow Usage

This agent activates in reactive mode when queries contain:
- "implement [technology]"
- "build [feature] with [technology]"
- "create [system] using [technology]"
- "setup [service]"
- "configure [tool]"
- "integrate [service]"

## Proactive Flow Usage

This agent automatically activates in proactive mode when:
- Creating implementation code (*.tsx, *.ts, *.jsx, *.js, *.py)
- Writing configuration files (*.json, *.yaml, *.yml)
- Developing features that match skill domains
- Setting up integrations or services

**Proactive Behavior**:
- Discovers relevant skills based on code being written
- Applies skill instructions during code generation
- Ensures best practices and patterns are followed
- Prevents anti-patterns during implementation

## Integration with Other Agents

This agent works alongside other agents:
- **Hydration Agent**: Can run alongside if React/Next.js code is being written
- **Performance Agent**: Can run alongside if performance-sensitive code is being written
- **Dependency Agent**: Can run alongside if dependencies are being added

The skill-assisted development flow (Phase 6) runs in parallel with reactive/proactive flows when applicable.

## Skills Used

This agent does not use traditional skills like `pattern-matcher`. Instead, it routes to implementation skills from `skills-hms/` that contain procedural knowledge.

## Examples

### Example Query: "Implement Ably realtime messaging"

1. Agent matches: `agent-skills` (keyword: "implement")
2. Skill discovery: Matches `implementing-ably-realtime` (keyword: "ably", semantic: "realtime messaging")
3. Skill loading: Reads full `SKILL.md` content
4. Interleaved guidance: Applies Ably patterns during code generation
5. Implementation: Code follows Ably best practices, avoids anti-patterns

### Example Query: "Setup Algolia search"

1. Agent matches: `agent-skills` (keyword: "setup")
2. Skill discovery: Matches `implementing-algolia-search` (keyword: "algolia", semantic: "search")
3. Skill loading: Reads full `SKILL.md` content
4. Interleaved guidance: Applies Algolia patterns (radical denormalization, frontend direct search)
5. Implementation: Code follows Algolia best practices, avoids normalized structures

### Example Query: "Build Kafka producer"

1. Agent matches: `agent-skills` (keyword: "build")
2. Skill discovery: Matches `implementing-kafka-production` (keyword: "kafka", semantic: "producer")
3. Skill loading: Reads full `SKILL.md` content
4. Interleaved guidance: Applies Kafka patterns (over-partitioning, high-throughput tuning)
5. Implementation: Code follows Kafka best practices, avoids single-partition topics

## Related Documentation

- See `SKILL_DISCOVERY.md` for detailed discovery algorithm documentation
- See `agent-framework/agents/agent-skills/skills-hms/` for available skills
- See `agent-framework/.cursorrules` for Skill-Assisted Development Flow (Phase 6)

