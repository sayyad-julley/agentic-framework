-- Repeatable Migration: User summary view
-- Pattern: Idempotent Repeatable Migration
-- Best Practice: CREATE OR REPLACE ensures safe re-execution
-- Note: Repeatable migrations run in alphabetical order and execute when checksum changes
-- H2 Compatible: Removed COMMENT ON VIEW (not supported in H2)

CREATE OR REPLACE VIEW user_summary AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at;

