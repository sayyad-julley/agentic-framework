package policy.rbac.multi_tenant

# Multi-tenant RBAC with tenant isolation
# Ensures users can only access resources within their tenant

default allow = false

# Deny cross-tenant access
deny[msg] if {
    input.user.tenant_id != input.resource.tenant_id
    msg := sprintf("Cross-tenant access forbidden: user tenant '%v' != resource tenant '%v'", 
        [input.user.tenant_id, input.resource.tenant_id])
}

# Deny if account is locked
deny[msg] if {
    input.user.account_locked == true
    msg := "Account is locked"
}

# Deny if tenant is inactive
deny[msg] if {
    tenant := data.roles_map.tenants[input.user.tenant_id]
    tenant.active == false
    msg := sprintf("Tenant '%v' is inactive", [input.user.tenant_id])
}

# Allow if no denials and user has required role
allow if {
    not deny
    user_role := input.user.roles[_]
    allowed_actions := data.roles_map.roles_map.permissions[user_role]
    allowed_actions[_] == input.action
}

