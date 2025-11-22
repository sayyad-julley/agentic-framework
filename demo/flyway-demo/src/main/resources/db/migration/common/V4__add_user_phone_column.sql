-- Versioned Migration: Add phone column with backward compatibility
-- Pattern: Multi-Version Schema Evolution (Add phase)
-- Best Practice: Adding nullable column allows existing application versions to continue working
-- H2 Compatible: Removed COMMENT ON COLUMN (not supported in H2)

ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;

