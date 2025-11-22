package policy.rbac.test

# Test 1: Admin can perform all actions
test_admin_can_read if {
    data.policy.rbac.allow with input as {
        "user_id": "admin-user",
        "roles": ["admin"],
        "action": "read"
    }
}

test_admin_can_write if {
    data.policy.rbac.allow with input as {
        "user_id": "admin-user",
        "roles": ["admin"],
        "action": "write"
    }
}

test_admin_can_delete if {
    data.policy.rbac.allow with input as {
        "user_id": "admin-user",
        "roles": ["admin"],
        "action": "delete"
    }
}

# Test 2: Viewer can only read
test_viewer_can_read if {
    data.policy.rbac.allow with input as {
        "user_id": "viewer-user",
        "roles": ["viewer"],
        "action": "read"
    }
}

test_viewer_cannot_write if {
    not data.policy.rbac.allow with input as {
        "user_id": "viewer-user",
        "roles": ["viewer"],
        "action": "write"
    }
}

test_viewer_cannot_delete if {
    not data.policy.rbac.allow with input as {
        "user_id": "viewer-user",
        "roles": ["viewer"],
        "action": "delete"
    }
}

# Test 3: Manager can read and write
test_manager_can_read if {
    data.policy.rbac.allow with input as {
        "user_id": "manager-user",
        "roles": ["manager"],
        "action": "read"
    }
}

test_manager_can_write if {
    data.policy.rbac.allow with input as {
        "user_id": "manager-user",
        "roles": ["manager"],
        "action": "write"
    }
}

test_manager_cannot_delete if {
    not data.policy.rbac.allow with input as {
        "user_id": "manager-user",
        "roles": ["manager"],
        "action": "delete"
    }
}

# Test 4: User with multiple roles
test_multiple_roles if {
    data.policy.rbac.allow with input as {
        "user_id": "multi-role-user",
        "roles": ["developer", "viewer"],
        "action": "read"
    }
}

# Test 5: Deny for unauthorized action
test_guest_cannot_write if {
    not data.policy.rbac.allow with input as {
        "user_id": "guest-user",
        "roles": ["guest"],
        "action": "write"
    }
}

