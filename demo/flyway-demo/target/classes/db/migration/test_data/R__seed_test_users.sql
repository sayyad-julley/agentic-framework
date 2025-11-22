-- Repeatable Migration: Seed test users (test/staging environments only)
-- Pattern: Idempotent Repeatable Migration with IF NOT EXISTS logic
-- Best Practice: Environment-specific seed data in separate directory
-- Note: This script only runs when test_data location is included in configuration
-- H2 Compatible: Using MERGE statement for idempotent inserts

-- Use MERGE for idempotent inserts (H2 compatible)
MERGE INTO users (email, first_name, last_name, phone) KEY (email)
VALUES 
    ('test.user@example.com', 'Test', 'User', '+1234567890'),
    ('demo.user@example.com', 'Demo', 'User', '+0987654321');

