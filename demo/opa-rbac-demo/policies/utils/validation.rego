package utils.validation

# Input validation utilities
# Ensures input schema is correct before policy evaluation

valid_rbac_input if {
    is_string(input.user_id)
    is_string(input.action)
    is_array(input.roles)
}

valid_resource_rbac_input if {
    valid_rbac_input
    is_string(input.resource_type)
}

valid_multi_tenant_input if {
    valid_rbac_input
    input.user.tenant_id
    input.resource.tenant_id
}

# Type checking helpers
is_string(x) if {
    type_name(x) == "string"
}

is_array(x) if {
    type_name(x) == "array"
}

is_object(x) if {
    type_name(x) == "object"
}

