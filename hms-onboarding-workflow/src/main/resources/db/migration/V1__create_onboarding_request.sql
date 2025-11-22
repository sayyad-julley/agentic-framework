CREATE TABLE onboarding_requests (
    id UUID PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, COMPLETED, FAILED
    process_instance_id VARCHAR(255),
    created_by VARCHAR(255),
    created_date TIMESTAMP,
    last_modified_by VARCHAR(255),
    last_modified_date TIMESTAMP
);

