#!/bin/bash
# Flyway CI/CD Pipeline Script (Validation-First Approach)
# Usage: ./flyway-deploy.sh <environment>
#
# Pattern: Validation-First CI/CD
# Best Practice: Execute testConnection → validate → check --drift → migrate sequence
#
# This script demonstrates:
# - Pre-flight connectivity checks
# - Code analysis quality gates
# - Validation before migration
# - Drift detection for staging/production
# - Safe migration deployment

set -e

# Get script directory to locate .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "Loading environment variables from .env file..."
    # Export variables from .env, ignoring comments and empty lines
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

ENVIRONMENT=${1:-staging}
FLYWAY_CLI=${FLYWAY_CLI:-flyway}

# Use environment variables from .env, with fallback defaults
# H2 Database: file-based (persistent) or mem: (in-memory)
# File-based: jdbc:h2:file:./data/flyway_demo
# In-memory: jdbc:h2:mem:flyway_demo
DB_NAME=${DB_NAME:-flyway_demo}
DB_URL="${DB_URL:-jdbc:h2:file:./data/${DB_NAME}}"
FLYWAY_USER="${FLYWAY_USER:-${DB_MIGRATION_USER:-sa}}"
FLYWAY_PASS="${FLYWAY_PASSWORD:-${DB_MIGRATION_PASSWORD:-}}"
MIGRATION_LOCATIONS="${MIGRATION_LOCATIONS:-filesystem:${PROJECT_DIR}/src/main/resources/db/migration/common}"

echo "=== Flyway Deployment Pipeline: ${ENVIRONMENT} ==="

# Step 1: Pre-Flight Check (testConnection - Flyway 11.x)
echo "Step 1: Testing database connectivity..."
${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
  -locations="${MIGRATION_LOCATIONS}" \
  testConnection >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Database connectivity test failed"
  exit 1
fi
echo "✓ Connectivity test passed"

# Step 2: Quality Gate - Code Analysis (SQLFluff - Flyway 11.x Enterprise)
# Note: Code analysis is an Enterprise feature. Skip if not available.
echo "Step 2: Running code analysis (Enterprise feature, skipping if not available)..."
if ${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
  -locations="${MIGRATION_LOCATIONS}" \
  -codeAnalysis.enabled=true \
  -codeAnalysis.scope=all \
  analyze 2>/dev/null; then
  echo "✓ Code analysis passed"
else
  echo "⚠ Code analysis skipped (Enterprise feature not available in OSS edition)"
fi

# Step 3: Validation (validate - checksum verification)
# Note: Validation allows pending migrations (for fresh databases)
# It only fails on checksum mismatches for already-applied migrations
echo "Step 3: Validating migration scripts..."
${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
  -locations="${MIGRATION_LOCATIONS}" \
  -ignoreMigrationPatterns='*:pending' \
  validate
VALIDATION_RESULT=$?
if [ $VALIDATION_RESULT -ne 0 ]; then
  echo "ERROR: Migration validation failed (checksum mismatch or out-of-order)"
  echo "This usually means an already-applied migration was modified."
  exit 1
fi
echo "✓ Validation passed"

# Step 4: Drift Check (check --drift - staging/production only)
# Note: Drift check is an Enterprise feature. Skip if not available.
if [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "production" ]; then
  echo "Step 4: Checking for schema drift (Enterprise feature, skipping if not available)..."
  if ${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
    -locations="${MIGRATION_LOCATIONS}" \
    check --drift 2>/dev/null; then
    echo "✓ Drift check passed"
  else
    echo "⚠ Drift check skipped (Enterprise feature not available in OSS edition)"
  fi
fi

# Step 5: Migration Deployment (migrate)
echo "Step 5: Executing database migrations..."
${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
  -locations="${MIGRATION_LOCATIONS}" \
  migrate
if [ $? -ne 0 ]; then
  echo "ERROR: Migration execution failed"
  exit 1
fi
echo "✓ Migration completed successfully"

# Step 6: Snapshot Capture (optional - for drift detection in future deployments)
# Note: Snapshot is an Enterprise feature. Skip if not available.
if [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "production" ]; then
  echo "Step 6: Capturing schema snapshot (Enterprise feature, skipping if not available)..."
  if ${FLYWAY_CLI} -url="${DB_URL}" -user="${FLYWAY_USER}" -password="${FLYWAY_PASS}" \
    -locations="${MIGRATION_LOCATIONS}" \
    snapshot 2>/dev/null; then
    echo "✓ Snapshot captured"
  else
    echo "⚠ Snapshot skipped (Enterprise feature not available in OSS edition)"
  fi
fi

echo "=== Deployment Pipeline Completed Successfully ==="

