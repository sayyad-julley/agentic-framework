# Agent Registry

This file consolidates all agent metadata for quick loading and discovery. Load this file FIRST before processing any user query to ensure all agents are available in context.

## Quick Reference Table

| Agent ID | Name | Description | Capabilities | Sub-Agents |
|----------|------|-------------|--------------|------------|
| `hydration-agent` | Hydration Agent | Detects and fixes React/Next.js hydration issues | scan, detect, fix, autoDetectAndExecute | 3 |
| `performance-agent` | Performance Agent | Detects and fixes React/Next.js performance anti-patterns | scan, detect, fix, autoDetectAndExecute | 2 |
| `dependency-agent` | Dependency Agent | Detects and fixes dependency issues | scan, detect, fix, autoDetectAndExecute | 2 |
| `agent-skills` | Agent Skills | Special routing agent that discovers and selects skills from skills-hms for skill-assisted development | route, discover, select | N/A (routes to skills) |

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

**Reactive Flow Triggers**:
- Keywords: hydration, hydration error, hydration mismatch, client component, server component, window access, dialog hydration, use client

**Proactive Flow Triggers**:
- File patterns: `*.tsx`, `*.ts`, `*.jsx`, `*.js`
- React/Next.js component creation
- Client component usage
- Dialog/modal creation
- Window/document access in code

**Proactive Mode Configuration**:
- Enabled: true
- Auto-scan: true
- Auto-fix: true
- Activation: Automatic when creating React/Next.js components

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

**Reactive Flow Triggers**:
- Keywords: performance, re-render, unnecessary render, bundle size, optimization, memoization, useMemo, useCallback, React.memo

**Proactive Flow Triggers**:
- File patterns: `*.tsx`, `*.ts`, `*.jsx`, `*.js`
- React/Next.js component creation
- Component optimization opportunities
- Import statements and bundle analysis

**Proactive Mode Configuration**:
- Enabled: true
- Auto-scan: true
- Auto-fix: true
- Activation: Automatic when creating React/Next.js components

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

**Reactive Flow Triggers**:
- Keywords: dependency, version, package.json, missing dependency, version mismatch, incompatible version, npm install, yarn install

**Proactive Flow Triggers**:
- File patterns: `package.json`, `package-lock.json`, `yarn.lock`
- Package.json creation or modification
- Dependency installation
- Import statements in code files

**Proactive Mode Configuration**:
- Enabled: true
- Auto-scan: true
- Auto-fix: true
- Activation: Automatic when creating or modifying package.json

**Location:** `agent-framework/agents/dependency-agent/agent.md`

---

### Agent Skills

**Metadata:**
```yaml
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
```

**Available Skills:**
1. `implementing-ably-realtime` - Implements Ably realtime messaging by applying proven patterns (Pub/Sub with global elasticity, ephemeral channels, token authentication, automatic reconnection, LiveObjects with CRDTs, presence management), following best practices (singleton SDK instance, History API recovery, exponential backoff, batched webhooks, channel scoping), implementing workarounds (REST batching for ordering, rate limiting, webhook batching), and avoiding anti-patterns (channel proliferation, retry storms, improper instantiation, chatty I/O, basic auth on client-side, ignored state loss). Use when implementing realtime features, building collaborative applications, integrating with backend systems, or handling presence and state synchronization.
2. `implementing-algolia-search` - Implements Algolia search functionality by applying proven patterns (radical denormalization, frontend direct search, secured API keys for multi-tenancy, custom ranking), following best practices (selective indexing, batching operations, infinite scroll, debouncing), implementing workarounds (record splitting with Distinct, atomic re-indexing, paginationLimitedTo), and avoiding anti-patterns (normalized structures, dump-and-pray indexing, backend proxying, index-per-tenant). Use when implementing search functionality, migrating from database-based search, optimizing existing Algolia implementations, or handling multi-tenant search requirements.
3. `implementing-flyway-db-enterprise` - Implements Flyway DB 11.x enterprise database lifecycle management by applying proven patterns (Immutability Principle with Schema History Table, Atomic Change Pattern, Directory Separation, Validation-First CI/CD, Snapshot and Drift Detection), following best practices (strict naming conventions, dedicated migration users with privilege separation, backward compatibility for zero-downtime, quality gates with code analysis, callback lifecycle hooks), implementing workarounds (Repair Safety Protocol for checksum mismatches, Out-of-Order Migration for hotfixes, Baseline Pattern for legacy systems), and avoiding anti-patterns (mutability of applied versioned scripts, retrospective insertion, relying on undo for disaster recovery, missing privilege separation, skipping validation steps). Use when implementing database migrations in Java/Spring Boot projects, setting up CI/CD database deployment pipelines, managing multi-environment schemas, enforcing database governance, or detecting schema drift.
4. `implementing-kafka-production` - Implements Apache Kafka production deployments by applying patterns (over-partitioning for keyed messages, high-throughput producer tuning, consumer parallelism, binary serialization Avro/Protobuf, HA/DR with replication/ISR, Dead Letter Queue, backpressure management, Kafka Streams stateful processing), following best practices (partition sizing, manual offset management, schema evolution, rack awareness, standby replicas), implementing workarounds (kafka-reassign-partitions, bounded queues, pause/resume, level compaction), and avoiding anti-patterns (Kafka as SoT, topic overproliferation, single-partition topics, partition skew, default producer settings, under-provisioned consumers, textual formats). Use when deploying Kafka in production, optimizing throughput, mitigating consumer lag, implementing schema evolution, disaster recovery, managing backpressure, or stateful stream processing.
5. `implementing-linear-excellence` - Implements Linear operational excellence by applying proven patterns (Heirloom Tomato organizational model, work hierarchy decoupling, momentum-based cycles), following best practices (single assignee DRI, triage zero inbox, keyboard-first navigation), implementing workarounds (multiple assignees via sub-issues, reporting via Screenful, cooldowns via manual cycles), and avoiding anti-patterns (Jira-fication, backlog hoard, shadow work). References real-world implementations from Plum HQ and Descript. Use when setting up Linear workspaces, migrating from legacy tools, or optimizing workflows.
6. `implementing-nextjs-14-production` - Implements Next.js 14 App Router production patterns by applying proven architectural strategies (Server Components as default, Server Actions for mutations, comprehensive caching with revalidatePath/revalidateTag, Parallel/Intercepting Routes, middleware optimization), following best practices (component interleaving, serialization constraints, mandatory validation/auth, useActionState error handling), implementing workarounds (Date serialization, cache externalization for multi-replica, REST batching), and avoiding anti-patterns (direct SC import into CC, non-serializable props, Server Actions for reads, missing validation, local cache in multi-replica). Use when building Next.js 14 applications, implementing Server Components, setting up caching strategies, configuring advanced routing, or deploying to production environments.
7. `implementing-radix-ui-production` - Implements Radix UI primitives using architectural patterns (asChild composition with mandatory prop spreading and ref forwarding, component abstraction for custom APIs, data attribute styling for state-driven visuals), applying best practices (semantic responsibility, WAI-ARIA labeling, portal container pattern), implementing workarounds (CSS layering for Tailwind conflicts, portal context preservation, theme palette abstraction), and avoiding anti-patterns (missing prop spreading causing broken functionality, non-functional element overrides breaking accessibility, CSS order conflicts removing styles, portal context loss breaking theming, rigid theming limiting design flexibility). Use when building accessible UI components, integrating with design systems, managing portals and theming, or creating production-ready interactive components.
8. `implementing-redis-production` - Implements Redis production deployments by applying patterns (Cache-Aside lazy loading, Write-Through consistency, Write-Behind async buffering, atomic rate limiting), following best practices (connection pool sizing, eviction policies volatile-lru/allkeys-lru, HA/Scaling Sentinel/Cluster decision, memory reservations, proactive expiration), implementing workarounds (hot key distribution via client-side caching/read replicas, big key mitigation via splitting/async UNLINK, optimistic locking WATCH/MULTI/EXEC, memory fragmentation MEMORY PURGE), and avoiding anti-patterns (Redis as SoT, big keys >1MB, hot key contention, blocking operations KEYS/unbounded queries, connection pool exhaustion, noeviction on caches, large JSON blobs). Use when deploying Redis in production, optimizing caching strategies, implementing rate limiting, setting up HA/Cluster, managing memory, mitigating big/hot keys, or configuring persistence RDB/AOF.
9. `implementing-shadcn-ui-production` - Implements shadcn/ui components using open code distribution model by applying atomic composition patterns (building composites from primitives), CVA standardization (class-variance-authority for type-safe variants), advanced theming (dark mode via next-themes, custom design tokens with @theme directive), following best practices (component composition with Context/Redux, mandatory CVA usage, dual CSS variable declaration, component governance policy, mandatory Axe testing), implementing workarounds (controlled upstream synchronization with diff workflow, monorepo adoption with packages/ui, managed internal library with Bit), and avoiding anti-patterns (maintenance debt trap from neglected updates, SSR hydration errors from client logic in Server Components, Tailwind typography conflicts from hardcoded values, accessibility regression from missing ARIA). Use when building production UI systems, customizing components, setting up design tokens, managing component lifecycle, or avoiding integration pitfalls.
10. `implementing-spring-boot-3.2` - Implements production-ready Spring Boot 3.2.0 applications using Virtual Threads for high-concurrency I/O operations, RestClient migration from RestTemplate with timeouts and error handling, Micrometer/OpenTelemetry OTLP tracing, stateless REST security with JWT, and concurrent initialization. Avoids anti-patterns: transactional overload on reads, business logic in controllers, blocking I/O in reactive code, unbounded caching. Implements workarounds: DevTools remote deployment tuning, RestClient logging, tracing sampling. Use when migrating to Spring Boot 3.2.0, implementing high-throughput microservices with Java 21, replacing RestTemplate, or setting up distributed tracing.
11. `implementing-tailwind-enterprise` - Implements enterprise-scale Tailwind CSS by applying architectural patterns (Component-First Abstraction, Semantic Design Tokens, Headless UI Integration), following best practices (JIT content configuration, theme customization, performance optimization), implementing workarounds (CSS variables for dynamic styling, arbitrary values, custom modifiers), and avoiding anti-patterns (@apply misuse, class soup, ignoring theme customization, dynamic class generation). Use when building large-scale frontend applications, migrating from legacy CSS, implementing design systems, or optimizing CSS bundle size.
12. `implementing-unleash-featureops` - Implements Unleash v9.2.0 feature flag management by applying proven architectural patterns (SPOE single point evaluation, abstraction layer decoupling, multi-strategy inclusive OR logic, Edge daisy chaining for multi-region), following best practices (complete context building, constraint-based targeting over custom strategies, userId stickiness for A/B testing, telemetry-enabled governance), implementing workarounds (Edge daisy chaining for latency mitigation, constraint-based targeting as alternative to custom strategies), and avoiding anti-patterns (flag sprawl, long-lived flags becoming config, fragmented evaluation, custom strategy overload, incomplete context, missing telemetry). Use when implementing feature flags, setting up A/B testing infrastructure, configuring gradual rollouts, deploying multi-region feature flag infrastructure, or managing feature flag lifecycle and governance.
13. `mintlify-documentation` - Implements and configures Mintlify documentation sites following best practices, avoiding common anti-patterns, and applying workarounds for API reference integration, personalization, and customization. Use when setting up new Mintlify sites, troubleshooting blank API pages, configuring OpenAPI integration, implementing personalization features, or applying custom styling workarounds.

**Reactive Flow Triggers**:
- Keywords: implement, build, create, develop, setup, configure, integrate, add, make, generate, new, initialize, write

**Proactive Flow Triggers**:
- File patterns: `*.tsx`, `*.ts`, `*.jsx`, `*.js`, `*.py`, `*.json`, `*.yaml`, `*.yml`, `*.md`
- Implementation queries
- Development queries

**Proactive Mode Configuration**:
- Enabled: true
- Auto-scan: false (does not scan, routes to skills)
- Auto-fix: false (does not fix, provides guidance)
- Activation: Automatic when creating implementation code or configuration files

**Key Difference**: This agent does NOT fix issues. It provides guidance during code development by routing to appropriate skills that contain best practices, patterns, workarounds, and anti-patterns for specific technologies or systems.

**Skill Discovery**: Uses keyword + semantic matching to select skills from `skills-hms/` directory. See `agent-framework/agents/agent-skills/SKILL_DISCOVERY.md` for detailed algorithm.

**Location:** `agent-framework/agents/agent-skills/agent.md`

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
- Query: "Implement Ably realtime chat" → **agent-skills** → routes to `implementing-ably-realtime` skill
- Query: "Setup Algolia search" → **agent-skills** → routes to `implementing-algolia-search` skill
- Query: "Build Kafka producer" → **agent-skills** → routes to `implementing-kafka-production` skill

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

