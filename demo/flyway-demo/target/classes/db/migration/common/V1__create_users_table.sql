-- Versioned Migration: Create users table
-- Pattern: Atomic Change - one script = one atomic schema change
-- Best Practice: Immutable after application - never modify this script after successful execution
-- H2 Compatible: Using BIGINT AUTO_INCREMENT instead of BIGSERIAL

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

