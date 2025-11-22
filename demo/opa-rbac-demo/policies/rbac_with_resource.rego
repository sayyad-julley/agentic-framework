package policy.rbac.resource

# Extended RBAC with resource-level permissions
# Supports resource-specific authorization (e.g., user can read their own data)

default allow = false

# Allow if user has role with action permission
allow if {
    user_role := input.roles[_]
    allowed_actions := data.roles_map.roles_map.permissions[user_role]
    allowed_actions[_] == input.action
    # No resource constraint - global permission
}

# Allow if user has resource-specific permission
allow if {
    user_role := input.roles[_]
    resource_permissions := data.roles_map.roles_map.resource_permissions[user_role]
    perm := resource_permissions[_]
    perm.action == input.action
    perm.resource_type == input.resource_type
    # Check resource ownership if specified
    resource_ownership_check(perm)
}

# Resource ownership check helper
resource_ownership_check(perm) if {
    not perm.requires_ownership
}

resource_ownership_check(perm) if {
    perm.requires_ownership
    input.resource_owner == input.user_id
}

# Deny with detailed reason
deny[msg] if {
    not allow
    msg := sprintf("User '%v' with roles %v is not authorized for action '%v' on resource type '%v'", 
        [input.user_id, input.roles, input.action, input.resource_type])
}

