# OPA RBAC Implementation Demo Guide

This guide provides step-by-step instructions for setting up and testing the RBAC (Role-Based Access Control) implementation using Open Policy Agent (OPA).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Testing the Implementation](#testing-the-implementation)
- [API Endpoints](#api-endpoints)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed:

- **Java 17+** (JDK, not just JRE)
  ```bash
  java -version  # Should show version 17 or higher
  ```

- **Maven 3.8+**
  ```bash
  mvn -version
  ```

- **Docker and Docker Compose**
  ```bash
  docker --version
  docker-compose --version
  ```

- **curl** (for testing)
  ```bash
  curl --version
  ```

## Quick Start

### Step 1: Start OPA Server

```bash
cd opa-rbac-demo
make opa-start
```

Or manually:
```bash
docker-compose up -d opa
```

Verify OPA is running:
```bash
curl http://localhost:8181/health
# Expected: {}
```

### Step 2: Load Policies and Data

```bash
make load-policies
```

This loads:
- RBAC policies (`policies/rbac.rego`)
- Resource-level RBAC (`policies/rbac_with_resource.rego`)
- Multi-tenant RBAC (`policies/multi_tenant_rbac.rego`)
- Role definitions (`data/roles.json`)

### Step 3: Set Java Environment

```bash
# For macOS with Homebrew OpenJDK
export JAVA_HOME=$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home

# Verify Java version
$JAVA_HOME/bin/java -version
```

### Step 4: Start Spring Boot Application

```bash
mvn spring-boot:run -Dmaven.test.skip=true
```

The application will start on `http://localhost:8080`.

## Detailed Setup

### 1. OPA Server Setup

#### Start OPA Container

```bash
docker-compose up -d opa
```

#### Verify OPA Health

```bash
curl http://localhost:8181/health
```

Expected response: `{}`

#### Load Policies

```bash
# Load RBAC policy
curl -X PUT http://localhost:8181/v1/policies/rbac \
  --data-binary @policies/rbac.rego

# Load resource RBAC policy
curl -X PUT http://localhost:8181/v1/policies/rbac_resource \
  --data-binary @policies/rbac_with_resource.rego

# Load multi-tenant RBAC policy
curl -X PUT http://localhost:8181/v1/policies/multi_tenant_rbac \
  --data-binary @policies/multi_tenant_rbac.rego

# Load roles data
curl -X PUT http://localhost:8181/v1/data/roles_map \
  --data-binary @data/roles.json
```

#### Verify Policies Loaded

```bash
curl http://localhost:8181/v1/policies
```

### 2. Spring Boot Application Setup

#### Configure Java Environment

**macOS with Homebrew:**
```bash
export JAVA_HOME=$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home
```

**Linux:**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

**Windows:**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

#### Build Application

```bash
mvn clean compile -DskipTests
```

#### Run Application

```bash
mvn spring-boot:run -Dmaven.test.skip=true
```

The application will be available at `http://localhost:8080`.

## Testing the Implementation

### Direct OPA Testing

Test OPA policies directly before testing through Spring Boot:

#### Test 1: Admin Can Read

```bash
curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user_id": "admin-user",
      "roles": ["admin"],
      "action": "read"
    }
  }'
```

**Expected Response:**
```json
{
  "decision_id": "...",
  "result": true
}
```

#### Test 2: Viewer Cannot Write

```bash
curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user_id": "viewer-user",
      "roles": ["viewer"],
      "action": "write"
    }
  }'
```

**Expected Response:**
```json
{
  "decision_id": "...",
  "result": false
}
```

#### Test 3: Viewer Can Read

```bash
curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user_id": "viewer-user",
      "roles": ["viewer"],
      "action": "read"
    }
  }'
```

**Expected Response:**
```json
{
  "decision_id": "...",
  "result": true
}
```

### Spring Boot API Testing

#### Test 1: Check Authorization (Admin Read)

```bash
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=admin-user&roles=admin' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "user_id": "admin-user",
  "authorized": true,
  "roles": ["admin"],
  "action": "read"
}
```

#### Test 2: Check Authorization (Viewer Write - Denied)

```bash
curl -X POST 'http://localhost:8080/api/authz/check?action=write&userId=viewer-user&roles=viewer' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "user_id": "viewer-user",
  "authorized": false,
  "roles": ["viewer"],
  "action": "write"
}
```

#### Test 3: Check Authorization (Viewer Read - Allowed)

```bash
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=viewer-user&roles=viewer' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "user_id": "viewer-user",
  "authorized": true,
  "roles": ["viewer"],
  "action": "read"
}
```

#### Test 4: Get User Permissions

```bash
curl 'http://localhost:8080/api/authz/permissions?userId=admin-user&roles=admin'
```

**Expected Response:**
```json
{
  "user_id": "admin-user",
  "roles": ["admin"],
  "permissions": []
}
```

#### Test 5: Resource Access (Admin)

```bash
curl 'http://localhost:8080/api/resources/resource-123?resourceType=document&userId=admin-user&roles=admin'
```

**Expected Response:**
```json
{
  "id": "resource-123",
  "name": "Sample Resource",
  "type": "document",
  "owner": "admin-user"
}
```

#### Test 6: Resource Access (Viewer - Denied)

```bash
curl 'http://localhost:8080/api/resources/resource-123?resourceType=document&userId=viewer-user&roles=viewer'
```

**Expected Response:**
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions"
}
```

## API Endpoints

### Authorization Endpoints

#### POST `/api/authz/check`

Check if a user is authorized for an action.

**Query Parameters:**
- `action` (required): Action to check (e.g., "read", "write", "delete")
- `userId` (optional): User ID (defaults to "test-user" if not provided)
- `roles` (optional): Comma-separated list of roles (defaults to ["guest"])
- `resourceType` (optional): Resource type for resource-level permissions
- `resourceOwner` (optional): Resource owner ID for ownership checks

**Example:**
```bash
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=admin-user&roles=admin' \
  -H 'Content-Type: application/json'
```

#### GET `/api/authz/permissions`

Get all permissions for a user based on their roles.

**Query Parameters:**
- `userId` (optional): User ID
- `roles` (optional): Comma-separated list of roles

**Example:**
```bash
curl 'http://localhost:8080/api/authz/permissions?userId=admin-user&roles=admin'
```

### Resource Endpoints

#### GET `/api/resources/{resourceId}`

Get a resource (requires 'read' permission).

**Query Parameters:**
- `resourceType` (optional): Type of resource
- `userId` (optional): User ID
- `roles` (optional): Comma-separated list of roles

**Example:**
```bash
curl 'http://localhost:8080/api/resources/resource-123?userId=admin-user&roles=admin'
```

#### POST `/api/resources`

Create a resource (requires 'write' permission).

**Query Parameters:**
- `userId` (optional): User ID
- `roles` (optional): Comma-separated list of roles

**Body:**
```json
{
  "name": "New Resource",
  "type": "document"
}
```

**Example:**
```bash
curl -X POST 'http://localhost:8080/api/resources?userId=admin-user&roles=admin' \
  -H 'Content-Type: application/json' \
  -d '{"name": "New Resource", "type": "document"}'
```

#### DELETE `/api/resources/{resourceId}`

Delete a resource (requires 'delete' permission).

**Query Parameters:**
- `userId` (optional): User ID
- `roles` (optional): Comma-separated list of roles

**Example:**
```bash
curl -X DELETE 'http://localhost:8080/api/resources/resource-123?userId=admin-user&roles=admin'
```

## Test Scenarios

### Scenario 1: Admin User

Admin users have full access to all actions.

```bash
# Admin can read
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=admin-user&roles=admin'

# Admin can write
curl -X POST 'http://localhost:8080/api/authz/check?action=write&userId=admin-user&roles=admin'

# Admin can delete
curl -X POST 'http://localhost:8080/api/authz/check?action=delete&userId=admin-user&roles=admin'
```

**Expected:** All requests return `"authorized": true`

### Scenario 2: Manager User

Manager users can read and write, but cannot delete.

```bash
# Manager can read
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=manager-user&roles=manager'

# Manager can write
curl -X POST 'http://localhost:8080/api/authz/check?action=write&userId=manager-user&roles=manager'

# Manager cannot delete
curl -X POST 'http://localhost:8080/api/authz/check?action=delete&userId=manager-user&roles=manager'
```

**Expected:** Read and write return `true`, delete returns `false`

### Scenario 3: Viewer User

Viewer users can only read.

```bash
# Viewer can read
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=viewer-user&roles=viewer'

# Viewer cannot write
curl -X POST 'http://localhost:8080/api/authz/check?action=write&userId=viewer-user&roles=viewer'

# Viewer cannot delete
curl -X POST 'http://localhost:8080/api/authz/check?action=delete&userId=viewer-user&roles=viewer'
```

**Expected:** Only read returns `true`, write and delete return `false`

### Scenario 4: Developer User

Developer users can read, write, and deploy.

```bash
# Developer can read
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=dev-user&roles=developer'

# Developer can write
curl -X POST 'http://localhost:8080/api/authz/check?action=write&userId=dev-user&roles=developer'

# Developer can deploy
curl -X POST 'http://localhost:8080/api/authz/check?action=deploy&userId=dev-user&roles=developer'
```

**Expected:** All requests return `true`

### Scenario 5: Multiple Roles

Users with multiple roles inherit permissions from all roles.

```bash
# User with both developer and viewer roles
curl -X POST 'http://localhost:8080/api/authz/check?action=read&userId=multi-user&roles=developer,viewer'

# User with both admin and manager roles
curl -X POST 'http://localhost:8080/api/authz/check?action=delete&userId=multi-user&roles=admin,manager'
```

**Expected:** User gets union of all role permissions

## Automated Testing Script

Create a test script to run all scenarios:

```bash
#!/bin/bash
# test-rbac.sh

BASE_URL="http://localhost:8080"

echo "=== OPA RBAC Integration Tests ==="
echo ""

echo "Test 1: Admin can read"
curl -s -X POST "${BASE_URL}/api/authz/check?action=read&userId=admin-user&roles=admin" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "Test 2: Admin can write"
curl -s -X POST "${BASE_URL}/api/authz/check?action=write&userId=admin-user&roles=admin" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "Test 3: Viewer can read"
curl -s -X POST "${BASE_URL}/api/authz/check?action=read&userId=viewer-user&roles=viewer" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "Test 4: Viewer cannot write"
curl -s -X POST "${BASE_URL}/api/authz/check?action=write&userId=viewer-user&roles=viewer" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "Test 5: Manager can read"
curl -s -X POST "${BASE_URL}/api/authz/check?action=read&userId=manager-user&roles=manager" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "Test 6: Manager cannot delete"
curl -s -X POST "${BASE_URL}/api/authz/check?action=delete&userId=manager-user&roles=manager" \
  -H 'Content-Type: application/json' | python3 -m json.tool
echo ""

echo "✅ All tests completed!"
```

Save as `test-rbac.sh`, make it executable, and run:
```bash
chmod +x test-rbac.sh
./test-rbac.sh
```

## Troubleshooting

### OPA Server Not Responding

**Problem:** `curl http://localhost:8181/health` fails

**Solutions:**
1. Check if OPA container is running:
   ```bash
   docker ps | grep opa
   ```

2. Check OPA logs:
   ```bash
   docker logs opa-server
   ```

3. Restart OPA:
   ```bash
   docker-compose restart opa
   # or
   make opa-stop
   make opa-start
   ```

### Policies Not Loaded

**Problem:** Authorization always returns `false`

**Solutions:**
1. Verify policies are loaded:
   ```bash
   curl http://localhost:8181/v1/policies
   ```

2. Reload policies:
   ```bash
   make load-policies
   ```

3. Test policy directly:
   ```bash
   curl -X POST http://localhost:8181/v1/data/policy/rbac/allow \
     -H "Content-Type: application/json" \
     -d '{"input": {"user_id": "admin-user", "roles": ["admin"], "action": "read"}}'
   ```

### Spring Boot Won't Start

**Problem:** Application fails to start

**Solutions:**
1. Check Java version:
   ```bash
   java -version  # Should be 17+
   ```

2. Set JAVA_HOME:
   ```bash
   export JAVA_HOME=$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home
   ```

3. Check if port 8080 is in use:
   ```bash
   lsof -i :8080
   ```

4. Check application logs for errors

### Authorization Always Returns False

**Problem:** All authorization checks return `false` even for admin

**Solutions:**
1. Verify OPA is accessible from Spring Boot:
   ```bash
   curl http://localhost:8181/health
   ```

2. Check Spring Boot logs for OPA connection errors:
   ```bash
   # Look for "OPA evaluation error" or "OPA request failed"
   ```

3. Verify policy path in `application.yml`:
   ```yaml
   opa:
     policy:
       path: policy.rbac.allow
   ```

4. Test OPA directly (see Direct OPA Testing section)

### Compilation Errors

**Problem:** `mvn compile` fails

**Solutions:**
1. Ensure JDK (not JRE) is installed:
   ```bash
   which javac  # Should return a path
   ```

2. Set JAVA_HOME to JDK:
   ```bash
   export JAVA_HOME=$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home
   ```

3. Clean and rebuild:
   ```bash
   mvn clean compile
   ```

## Available Roles and Permissions

### Admin
- **Permissions:** read, write, delete, manage_users, manage_roles, view_audit_logs
- **Description:** Full access to all resources and administrative functions

### Manager
- **Permissions:** read, write, view_reports
- **Description:** Can read and write resources, view reports, but cannot delete

### Developer
- **Permissions:** read, write, deploy
- **Description:** Can read, write, and deploy code/resources

### Viewer
- **Permissions:** read
- **Description:** Read-only access to resources

### Guest
- **Permissions:** read_public
- **Description:** Limited to public resources only

## Configuration

### OPA Configuration

Located in `src/main/resources/application.yml`:

```yaml
opa:
  url: http://localhost:8181
  timeout: 5000
  policy:
    path: policy.rbac.allow
  cache:
    enabled: false  # Temporarily disabled
```

### Role Definitions

Located in `data/roles.json`:

```json
{
  "roles_map": {
    "permissions": {
      "admin": ["read", "write", "delete", "manage_users", "manage_roles", "view_audit_logs"],
      "manager": ["read", "write", "view_reports"],
      "developer": ["read", "write", "deploy"],
      "viewer": ["read"],
      "guest": ["read_public"]
    }
  }
}
```

## Next Steps

1. **Enable Caching:** Uncomment cache configuration in `application.yml` and add Caffeine dependency
2. **Add OAuth2:** Configure JWT token validation for production use
3. **Add More Policies:** Extend RBAC with resource-level and multi-tenant policies
4. **Add Monitoring:** Integrate with monitoring tools for authorization metrics
5. **Add Tests:** Create comprehensive unit and integration tests

## Additional Resources

- [OPA Documentation](https://www.openpolicyagent.org/docs/)
- [Rego Language Reference](https://www.openpolicyagent.org/docs/latest/policy-language/)
- [Spring Boot OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [OPA Production Patterns](../agent-framework/agents/agent-skills/skills-hms/implementing-opa-production/SKILL.md)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Test OPA directly to isolate issues
4. Check OPA server logs: `docker logs opa-server`

