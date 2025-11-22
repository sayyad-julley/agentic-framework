package policy.rbac

# Default deny - security best practice
default allow = false

# RBAC authorization rule
# Checks if user has a role that grants the requested action
allow if {
    # Extract user roles from input
    user_role := input.roles[_]
    # Lookup permissions for the role from data (note: data is nested as roles_map.roles_map)
    allowed_actions := data.roles_map.roles_map.permissions[user_role]
    # Check if the requested action is in the allowed actions
    allowed_actions[_] == input.action
}

# Helper rule: Check if user has specific role
user_has_role(role) if {
    input.roles[_] == role
}

# Helper rule: Get all permissions for user's roles
user_permissions[permission] if {
    user_role := input.roles[_]
    permission := data.roles_map.roles_map.permissions[user_role][_]
}

# Deny with reason for better debugging
deny[msg] if {
    not allow
    msg := sprintf("User with roles %v is not authorized for action '%v'", [input.roles, input.action])
}

