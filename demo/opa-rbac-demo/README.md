# OPA RBAC Implementation

Production-ready Role-Based Access Control (RBAC) implementation using Open Policy Agent (OPA) and Rego policies.

## Overview

This implementation follows OPA production best practices:

- **Centralized Control Plane / Decentralized Enforcement**: Policies managed in Git, enforced locally
- **Policy-Data Separation**: Static Rego policies with dynamic JSON data
- **Client-Side Caching**: High-QPS optimization with Caffeine cache
- **Modular Policy Design**: Separate packages for different authorization scenarios
- **Comprehensive Testing**: Rego test suite with 90%+ coverage target
- **Spring Boot Integration**: Seamless integration with Spring Security OAuth2

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│ Spring Boot  │────────▶│  OPA Server │
│  (Browser)  │  JWT    │   Service    │  HTTP   │  (Local)    │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │ Cache
                              ▼
                        ┌─────────────┐
                        │   Caffeine  │
                        │    Cache    │
                        └─────────────┘
```

## Features

### 1. Basic RBAC
- Role-based permissions (admin, manager, developer, viewer, guest)
- Action-based authorization (read, write, delete, etc.)
- Multi-role support

### 2. Resource-Level RBAC
- Resource-specific permissions
- Ownership-based access control
- Resource type filtering

### 3. Multi-Tenant RBAC
- Tenant isolation
- Cross-tenant access prevention
- Tenant status validation
- Account lockout support

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- Docker and Docker Compose (for OPA server)

### 1. Start OPA Server

```bash
docker-compose up -d opa
```

Verify OPA is running:
```bash
curl http://localhost:8181/health
```

### 2. Load Policies and Data

```bash
# Load policies
curl -X PUT http://localhost:8181/v1/policies/rbac \
  --data-binary @policies/rbac.rego

# Load data
curl -X PUT http://localhost:8181/v1/data/roles_map \
  --data-binary @data/roles.json
```

### 3. Run Tests

```bash
# Test Rego policies
docker run --rm -v $(pwd):/workspace openpolicyagent/opa:latest \
  test /workspace/tests/rbac_test.rego -v

# Run Spring Boot tests
mvn test
```

### 4. Start Spring Boot Application

```bash
mvn spring-boot:run
```

### 5. Test Authorization

```bash
# Get JWT token (replace with your OAuth2 provider)
TOKEN="your-jwt-token"

# Check authorization
curl -X POST "http://localhost:8080/api/authz/check?action=read" \
  -H "Authorization: Bearer $TOKEN"

# Get user permissions
curl "http://localhost:8080/api/authz/permissions" \
  -H "Authorization: Bearer $TOKEN"
```

## Policy Structure

### Basic RBAC Policy (`policies/rbac.rego`)

```rego
package policy.rbac

default allow = false

allow {
    user_role := input.roles[_]
    allowed_actions := data.roles_map.permissions[user_role]
    allowed_actions[_] == input.action
}
```

### Resource-Level RBAC (`policies/rbac_with_resource.rego`)

Supports resource-specific permissions and ownership checks.

### Multi-Tenant RBAC (`policies/multi_tenant_rbac.rego`)

Enforces tenant isolation and cross-tenant access prevention.

## Data Structure

### Roles Configuration (`data/roles.json`)

```json
{
  "roles_map": {
    "permissions": {
      "admin": ["read", "write", "delete", "manage_users"],
      "manager": ["read", "write", "view_reports"],
      "viewer": ["read"]
    }
  }
}
```

## Spring Boot Integration

### Configuration

```yaml
opa:
  url: http://localhost:8181
  policy:
    path: policy.rbac.allow
  cache:
    enabled: true
```

### Usage in Controllers

```java
@RestController
public class ResourceController {
    
    @Autowired
    private OpaAuthorizationService opaService;
    
    @GetMapping("/resources/{id}")
    public ResponseEntity<?> getResource(@PathVariable String id) {
        OpaRequest request = OpaRequest.builder()
            .userId(getCurrentUserId())
            .roles(getUserRoles())
            .action("read")
            .resourceType("resource")
            .build();
        
        if (!opaService.isAuthorized(request)) {
            return ResponseEntity.status(403).build();
        }
        
        // Process request...
    }
}
```

## Best Practices Implemented

### 1. Default Deny
All policies use `default allow = false` for security.

### 2. Violation Sets
Policies return denial messages for better debugging:
```rego
deny[msg] {
    not allow
    msg := sprintf("User %v not authorized", [input.user_id])
}
```

### 3. Modular Design
- Separate packages for different domains
- Utility packages for validation
- Clear separation of concerns

### 4. Client-Side Caching
- Caffeine cache for authorization decisions
- Configurable TTL (default: 5 minutes)
- Cache key includes user, action, and resource

### 5. Retry Logic
- Exponential backoff for OPA failures
- Timeout handling (5 seconds)
- Graceful degradation

## Testing

### Rego Tests

```bash
opa test tests/ -v
```

### Coverage

```bash
opa test tests/ --coverage
```

Target: 90%+ coverage

### Spring Boot Tests

```bash
mvn test
```

## Production Deployment

### 1. Policy Bundles

Create versioned bundles for deployment:

```bash
opa build -b policies/ -b data/ -o bundle.tar.gz
```

### 2. OPA Configuration

Use Bundle API for policy distribution:

```yaml
services:
  control-plane:
    url: https://control-plane.example.com

bundles:
  rbac:
    service: control-plane
    resource: /bundles/rbac
    polling:
      min_delay_seconds: 60
      max_delay_seconds: 120
```

### 3. Monitoring

- Decision logs for audit
- Metrics for authorization latency
- Alert on OPA unavailability

## Performance Optimization

### High-QPS Scenarios

1. **Client-Side Caching**: Enable in `application.yml`
2. **Partial Evaluation**: Pre-compute static policy parts
3. **Indexing**: Use direct key lookups in Rego

### Large Datasets

1. **Evaluation Pull**: Query remote data service
2. **Data Pruning**: Include only necessary data in bundles
3. **Bundle Size**: Monitor and optimize

## Security Considerations

- ✅ Default deny posture
- ✅ Input validation
- ✅ JWT token validation
- ✅ Secure OPA communication (HTTPS in production)
- ✅ Audit logging
- ❌ No credentials in policies
- ❌ No sensitive data in bundles

## Troubleshooting

### OPA Not Responding

```bash
# Check OPA health
curl http://localhost:8181/health

# Check OPA logs
docker logs opa-server
```

### Policy Evaluation Fails

```bash
# Test policy directly
curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user_id": "test", "roles": ["admin"], "action": "read"}}'
```

### Cache Issues

Disable cache for debugging:
```yaml
opa:
  cache:
    enabled: false
```

## References

- [OPA Documentation](https://www.openpolicyagent.org/docs/)
- [Rego Language Reference](https://www.openpolicyagent.org/docs/latest/policy-language/)
- [OPA Production Patterns](agent-framework/agents/agent-skills/skills-hms/implementing-opa-production/SKILL.md)

## License

MIT

