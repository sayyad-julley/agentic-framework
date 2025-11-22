-- Versioned Migration: Add index for phone column
-- Pattern: Atomic Change - separate index creation
-- Best Practice: Indexes created after column addition to support query performance
-- H2 Compatible: Using regular index (H2 doesn't support partial indexes with WHERE clause)

CREATE INDEX idx_users_phone ON users(phone);

