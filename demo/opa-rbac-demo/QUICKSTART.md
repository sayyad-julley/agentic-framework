# OPA RBAC Quick Start Guide

Get up and running with OPA RBAC in 5 minutes.

## Prerequisites

- Docker and Docker Compose
- Java 17+
- Maven 3.8+
- `curl` and `jq` (optional, for testing)

## Step 1: Start OPA Server

```bash
make opa-start
```

Or manually:
```bash
docker-compose up -d opa
```

Verify it's running:
```bash
curl http://localhost:8181/health
```

## Step 2: Load Policies and Data

```bash
make load-policies
```

This loads:
- RBAC policies (`policies/rbac.rego`)
- Resource-level RBAC (`policies/rbac_with_resource.rego`)
- Multi-tenant RBAC (`policies/multi_tenant_rbac.rego`)
- Role definitions (`data/roles.json`)

## Step 3: Test Policies

```bash
make opa-test
```

Or test manually:
```bash
# Test admin can read
curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user_id": "admin-user",
      "roles": ["admin"],
      "action": "read"
    }
  }'

# Expected: {"result": true}
```

## Step 4: Build and Run Spring Boot App

```bash
# Build
make build

# Run
make run
```

Or:
```bash
mvn spring-boot:run
```

## Step 5: Test Authorization API

### Get a JWT Token

You'll need a JWT token with roles claim. For testing, you can use a mock token or configure an OAuth2 provider.

Example JWT payload:
```json
{
  "sub": "user123",
  "roles": ["admin"],
  "exp": 9999999999
}
```

### Test Authorization Endpoint

```bash
# Replace YOUR_JWT_TOKEN with actual token
TOKEN="YOUR_JWT_TOKEN"

# Check authorization
curl -X POST "http://localhost:8080/api/authz/check?action=read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Get user permissions
curl "http://localhost:8080/api/authz/permissions" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Resource Endpoints

```bash
# Read resource (requires 'read' permission)
curl "http://localhost:8080/api/resources/resource-123" \
  -H "Authorization: Bearer $TOKEN"

# Create resource (requires 'write' permission)
curl -X POST "http://localhost:8080/api/resources" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Resource", "type": "document"}'

# Delete resource (requires 'delete' permission)
curl -X DELETE "http://localhost:8080/api/resources/resource-123" \
  -H "Authorization: Bearer $TOKEN"
```

## Example Test Scenarios

### Scenario 1: Admin User

```bash
# Admin can read, write, and delete
curl -X POST "http://localhost:8080/api/authz/check?action=read" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: {"authorized": true}

curl -X POST "http://localhost:8080/api/authz/check?action=write" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: {"authorized": true}
```

### Scenario 2: Viewer User

```bash
# Viewer can read but not write
curl -X POST "http://localhost:8080/api/authz/check?action=read" \
  -H "Authorization: Bearer $VIEWER_TOKEN"
# Expected: {"authorized": true}

curl -X POST "http://localhost:8080/api/authz/check?action=write" \
  -H "Authorization: Bearer $VIEWER_TOKEN"
# Expected: {"authorized": false}
```

## Troubleshooting

### OPA Not Responding

```bash
# Check OPA logs
docker logs opa-server

# Restart OPA
make opa-stop
make opa-start
```

### Policy Not Found

```bash
# Reload policies
make load-policies

# List loaded policies
curl http://localhost:8181/v1/policies
```

### Authorization Always Denied

1. Check JWT token has `roles` claim
2. Verify roles exist in `data/roles.json`
3. Check OPA logs: `docker logs opa-server`
4. Test policy directly with `curl` (see Step 3)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore different RBAC patterns in `policies/` directory
- Customize roles and permissions in `data/roles.json`
- Add your own policies following the patterns

## Clean Up

```bash
make clean
```

This stops OPA and cleans build artifacts.

