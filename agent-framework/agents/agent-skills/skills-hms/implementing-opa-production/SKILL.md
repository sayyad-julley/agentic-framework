---
name: implementing-opa-production
description: Implements Open Policy Agent (OPA) production policies by applying patterns (Centralized Control Plane/Decentralized Enforcement, Embedded/Sidecar/Gateway/Mesh deployment, Policy-Data separation, RBAC/ABAC, Multi-tenant isolation), following best practices (--strict compilation, violation sets for warn/deny modes, modular packages, GitOps versioning, 90%+ test coverage, guard clauses, indexing), implementing workarounds (Partial Evaluation for high-QPS, Evaluation Pull for massive datasets, data pruning, client-side caching), and avoiding anti-patterns (complex business logic in policies, mixing policy+data, overly complex JSON, large bundles, untestable rules, using OPA as backend). Use when implementing Kubernetes admission control, microservices authorization, API Gateway policies, multi-tenant SaaS, Infrastructure-as-Code validation, CI/CD enforcement, or compliance systems.
version: 1.0.0
---

# Implementing OPA Production

## Overview

OPA is a Policy-as-Code decision engine that decouples policy decisions from enforcement. Rego is a declarative language optimized for hierarchical data (JSON/YAML). Decisions evaluate Policy (Rego rules), Data (contextual info), and Input (runtime request).

## When to Use

- Kubernetes admission control (Gatekeeper)
- Microservices authorization (Envoy/Istio service mesh)
- API Gateway authorization (JWT validation, rate limiting)
- Multi-tenant SaaS authorization (tenant isolation)
- Infrastructure-as-Code validation (Terraform/Conftest)
- CI/CD pipeline policy enforcement
- Compliance and audit systems

**Input format**: OPA runtime access, authorization requirements, policy data sources (JWT, roles, resource metadata)

**Expected output**: Production-ready Rego policies following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

- OPA runtime access (local or remote)
- Understanding of authorization requirements
- Policy data sources (JWT tokens, role definitions, resource metadata)
- Network connectivity to OPA (if remote)
- Control Plane access (if using centralized distribution)

## Execution Steps

### Step 1: Policy Architecture Patterns

**Centralized Control Plane / Decentralized Enforcement**:
- Policy governance: Logically centralized (GitOps, versioned bundles)
- Enforcement: Distributed (sidecar, embedded, local OPA agents)
- Control Plane manages: Policy distribution (Bundles API), decision telemetry (Decision Logs), agent status (Status API), dynamic configuration (Discovery API)

**Deployment Models**:
- **Embedded Library**: Ultra-low latency (sub-millisecond), requires app rebuilds for updates
- **Sidecar Container**: Low latency (1-3ms), independent update cycle via Control Plane
- **API Gateway/Proxy Filter**: Low latency (3-5ms), centralized at edge
- **Service Mesh (Envoy/Istio)**: Infrastructure-layer authorization, fine-grained L7 control

**Policy-Data Separation**:
- Policies (.rego): Static decision logic
- Data (JSON/YAML): Dynamic context (roles, configs, inventories)
- Loaded via Bundle API or Push API

### Step 2: Rego Policy Structure

**Package Organization**:
```rego
package policy.api.v1.authz  // Domain.service.version pattern
```

**Modular Design**:
```rego
import data.utils.validation
import data.roles_map
```

**Helper Rules vs Functions**:
- **Functions**: Take inputs, return single output (data transformations, calculations)
- **Predicates (Rules)**: Define sets or conditions (indexed lookups: `allowed_users["alice"]`)

**Complete Rules (Deterministic)**:
- Must be deterministic (no eval_conflict_error)
- Use incremental (set-based) rules to aggregate violations
- Default deny: `default allow = false`

### Step 3: Data Management Strategy

**Data Replication Strategies** (Performance vs Freshness):

| Strategy | Performance | Update Frequency | Size Limit | Use Case |
|----------|-------------|------------------|------------|----------|
| JWT Tokens | High | Token TTL | Limited | User attributes, claims |
| Input Overload | High | Per request | Negligible | Request metadata |
| Bundle API | High | Lag dependent | Medium (memory) | Static, medium data |
| Push API | High | Controlled refresh | Medium (memory) | Dynamic, medium data |
| Evaluation Pull | Network dependent | Perfectly fresh | No limit | Massive datasets |

**Best Practice**: For high-QPS, prioritize local in-memory data (JWT, Input, Bundle, Push). For massive datasets, use Evaluation Pull (accept latency trade-off) or Partial Evaluation Constraint Generation.

**Bundle Distribution**:
- Package policy + data together (.tar.gz)
- Guarantees policy-data consistency
- Versioned (Git commit SHA or semantic tag)
- Distributed via Control Plane Bundle API

### Step 4: Common Patterns (Code Templates)

**Basic Allow/Deny**:
```rego
package policy.authz

default allow = false

allow {
    input.user == "admin"
}

allow {
    input.method == "GET"
    input.path == ["v1", "data"]
    input.user == "alice"
}
```

**RBAC (Role-Based Access Control)**:
```rego
package policy.rbac

default allow = false

allow {
    user_role := input.roles[_]
    allowed_actions := data.roles_map.permissions[user_role]
    allowed_actions[_] == input.action
}
```

**ABAC (Attribute-Based Access Control)**:
```rego
package policy.abac

default allow = false

allow {
    input.action == "delete"
    input.security_level >= 5
    input.mfa_active == true
}
```

**Multi-Tenant Isolation**:
```rego
package policy.multi_tenant

deny[msg] {
    input.user.tenant_id != input.resource.tenant_id
    msg := "Cross-tenant access forbidden"
}

deny[msg] {
    input.user.account_lockout_flag == true
    msg := "Account is locked"
}

allow {
    not deny
    input.action == "read"
}
```

**Kubernetes Admission (Gatekeeper)**:
```rego
package kubernetes.admission.labels

violation[{"msg": msg, "details": {"label": mandatory_label}}] {
    mandatory_label := "owner"
    not input.review.object.metadata.labels[mandatory_label]
    msg := sprintf("Deployment must contain required label: %v", [mandatory_label])
}
```

**API Gateway Authorization**:
```rego
package gateway.authz

default allow = false

allow {
    input.headers["X-Request-ID"]
    input.path == ["v1", "admin"]
    input.user.role == "super_admin"
    input.method == "POST"
}
```

**Schema Validation**:
```rego
package utils.validation

valid_authz_input {
    is_string(input.user_id)
    is_string(input.action)
}

is_string(x) {
    type_name(x) == "string"
}
```

### Step 5: Best Practices

**Compilation**:
- Use `--strict` flag: `opa check --strict` (catches unused variables, function argument issues)
- Mandatory in CI/CD pipelines

**Violation Sets (Not Booleans)**:
- Return violations set: `deny[msg] { ... }` or `violations[msg] { ... }`
- Enables warn/deny modes at PEP:
  - **Warn Mode**: Log violations, allow request (soft launch)
  - **Deny Mode**: Block request if violations non-empty (hard enforcement)

**Modular Policy Design**:
- Logical packages: `package policy.domain.service.version`
- Base policies for common logic (schema validation, utilities)
- Domain-specific rules extend base policies
- Directory structure: `policies/system/`, `policies/api/v1/`, `policies/k8s/`

**Separate Logic from Data**:
- Policies: Static Rego rules
- Data: External JSON/YAML files
- Changes to roles/configs don't require policy recompilation

**Test Coverage**:
- Mandate 90%+ coverage: `opa test --coverage`
- Use `--fail-on-empty`: `opa test --fail-on-empty` (prevents accidental test skipping)
- All tests must be deterministic (fixed mock input/data)

**GitOps Integration**:
- Policies in Git (source of truth)
- PR workflow for changes
- CI/CD: Lint → Test → Bundle → Deploy
- Version bundles with Git commit SHA

**Performance Optimizations**:
- **Guard Clauses**: Early exit conditions at rule start
- **Indexing Utilization**: Direct key lookups (`data.users[input.user_id]`) over iterative searches
- **Helper Predicates**: Efficient indexed lookups against data namespace

### Step 6: Workarounds

**Partial Evaluation (High-QPS)**:
- Precompute policy parts that don't depend on dynamic input
- Offline computation (during CI/CD, not live requests)
- Transforms search logic into unrolled, indexed rules
- Use for constraint generation (OPA returns allowed IDs, backend executes SQL)

**Evaluation Pull (Massive Datasets)**:
- Workaround for datasets too large for in-memory storage
- Policy queries remote data service during evaluation
- Accept network latency trade-off
- Ensure remote service is highly available, optimized, geographically proximate

**Data Pruning**:
- Control Plane layer ensures bundles contain only minimal necessary data
- Keeps bundle size manageable, OPA memory footprint low
- Critical for high-QPS environments

**Client-Side Caching**:
- PEP caches authorization decisions (User X, Action Y, Resource Z)
- Effective for RBAC where user attributes change infrequently
- Reduces OPA calls

### Step 7: Anti-Patterns to Avoid

**❌ Embedding Complex Business Logic**:
- **Why**: OPA is authorization engine, not business rules engine
- **Fix**: Application computes attributes (risk_score, depreciation_status), passes to OPA via input
- **Pattern**: ABAC with pre-computed attributes

**❌ Mixing Policy + Data**:
- **Why**: Hardcoding configs (privileged users, feature flags) requires full policy redeploy cycle
- **Fix**: Externalize dynamic data to JSON/YAML, load via Bundle/Push API

**❌ Returning Overly Complex JSON**:
- **Why**: PEP must parse large structures, negates OPA's low latency
- **Fix**: Minimal structure - boolean for success, violation strings for failure

**❌ Large Datasets in Bundles**:
- **Why**: Increases memory, slows startup, introduces distribution latency
- **Fix**: Use Evaluation Pull or Partial Evaluation Constraint Generation

**❌ Untestable Rules**:
- **Why**: Non-deterministic data (external API calls) prevents reliable validation
- **Fix**: Mandate deterministic tests with fixed mock input/data, 90%+ coverage

**❌ Using OPA as Full Backend**:
- **Why**: Rego is for logical evaluation, not database queries/joins
- **Fix**: Use Constraint Generation - OPA generates constraints (allowed IDs, SQL conditions), backend executes efficiently

## Real-World Examples

### Example 1: Kubernetes Admission Control (Gatekeeper)

**Policy**: Enforce container image registry requirement

```rego
package kubernetes.admission.images

violation[{"msg": msg}] {
    container := input.review.object.spec.template.spec.containers[_]
    not startswith(container.image, "registry.company.com/")
    msg := sprintf("Container image must use approved registry: %v", [container.image])
}
```

**Input**:
```json
{
  "review": {
    "kind": {"kind": "Deployment"},
    "object": {
      "spec": {
        "template": {
          "spec": {
            "containers": [{"image": "nginx:latest"}]
          }
        }
      }
    }
  }
}
```

**Expected Output**: `[{"msg": "Container image must use approved registry: nginx:latest"}]`

### Example 2: API Gateway Authorization

**Policy**: JWT validation and path-based access

```rego
package gateway.authz

default allow = false

[_, payload, _] := io.jwt.decode(input.token)

deny[msg] {
    payload.iss != "mycorp.com/auth"
    msg := "Invalid token issuer"
}

allow {
    payload.role == "admin"
    input.path == ["v1", "admin"]
    input.method == "POST"
}
```

**Input**:
```json
{
  "token": "eyJhbGci...",
  "path": ["v1", "admin"],
  "method": "POST"
}
```

**Expected Output**: `allow = true` (if JWT valid and role matches)

## Error Handling

**Compilation Errors**:
- Undefined rules: Check rule names, imports
- Type mismatches: Verify input/data schemas
- Use `opa check --strict` in CI/CD

**Evaluation Conflicts**:
- `eval_conflict_error`: Complete rule produces conflicting outputs
- Fix: Ensure deterministic logic, use incremental rules for aggregation

**Undefined Behavior**:
- Missing input/data: Expression evaluates undefined, rule skipped
- Fix: Schema validation, default rules (`default allow = false`)

**Network Failures (Evaluation Pull)**:
- Remote data service unavailable
- Fix: Ensure high availability, fallback strategies, timeout handling

## Security Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, tokens in policies
- ❌ No credentials in SKILL.md or templates
- ✅ Use external credential management
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Default deny posture (`default allow = false`)
- Validate all input schemas
- Use external data sources for credentials
- Audit decision logs for compliance

## Performance Considerations

**Ultra-Low Latency**:
- Local deployment (embedded/sidecar)
- Minimal policy bundles
- Fast data input (JWT, input overload)
- Guard clauses for early exit

**High-QPS Optimization**:
- Partial Evaluation (offline computation)
- Indexing utilization (direct key lookups)
- Client-side caching (PEP-level)

**Bundle Size**:
- Data pruning in Control Plane
- Minimal necessary contextual data
- Monitor OPA memory footprint

## Related Resources

For extensive reference materials, see:
- `templates/`: Reusable Rego policy templates
- OPA Documentation: https://www.openpolicyagent.org/docs/

## Notes

- OPA does not provide Control Plane service (must develop/adopt)
- Partial Evaluation computation must be offline (CI/CD phase)
- Evaluation Pull requires accepting network latency trade-off
- Test coverage mandate (90%+) enforced in CI/CD
- GitOps workflow mandatory for production policy management

