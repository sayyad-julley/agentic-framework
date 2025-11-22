-- Versioned Migration: Add email index for performance
-- Pattern: Atomic Change - separate index creation from table creation
-- Best Practice: Sequential versioning ensures proper migration order
-- H2 Compatible: Removed COMMENT ON INDEX (not supported in H2)

CREATE INDEX idx_users_email ON users(email);

