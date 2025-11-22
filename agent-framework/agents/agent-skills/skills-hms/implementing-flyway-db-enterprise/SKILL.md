---
name: implementing-flyway-db-enterprise
description: Implements Flyway DB 11.x enterprise database lifecycle management by applying proven patterns (Immutability Principle with Schema History Table, Atomic Change Pattern, Directory Separation, Validation-First CI/CD, Snapshot and Drift Detection, Java-Based Migrations, Callback Lifecycle Hooks, TOML Configuration), following best practices (strict naming conventions, dedicated migration users with privilege separation, backward compatibility for zero-downtime, quality gates with SQLFluff code analysis, callback lifecycle hooks, snapshot management), implementing workarounds (Repair Safety Protocol for checksum mismatches, Out-of-Order Migration for hotfixes, Baseline Pattern for legacy systems, Snapshot Phased Adoption, Java Migration Classpath Resolution), and avoiding anti-patterns (mutability of applied versioned scripts, retrospective insertion, relying on undo for disaster recovery, missing privilege separation, skipping validation steps, non-idempotent repeatable migrations, missing quality gates, improper callback registration, Java migration transaction issues). Use when implementing database migrations in Java/Spring Boot projects, setting up CI/CD database deployment pipelines, managing multi-environment schemas, enforcing database governance, detecting schema drift, implementing Java-based migrations, or integrating callbacks for operational tasks.
version: 1.0.0
dependencies:
  - org.flywaydb:flyway-core>=11.0.0
  - org.flywaydb:flyway-database-postgresql>=11.0.0
---

# Implementing Flyway DB Enterprise

## Overview

Implements Flyway DB 11.x enterprise database lifecycle management for reliable, governed schema evolution. Flyway enforces immutable infrastructure principles through Schema History Table (FSH) checksum validation, ensuring database migrations are version-controlled and reproducible. Version 11.x introduces enterprise capabilities: snapshotting and drift detection for governance, integrated code analysis (SQLFluff) for quality gates, and testConnection command for CI/CD efficiency. This skill provides procedural knowledge for implementing production-ready migration pipelines following enterprise patterns, best practices, workarounds, and anti-pattern avoidance.

## When to Use

Use this skill when:
- Implementing database migrations in Java/Spring Boot projects
- Setting up CI/CD database deployment pipelines with validation-first approach
- Managing multi-environment database schemas (dev, staging, production)
- Enforcing database governance and quality gates (drift detection, code analysis)
- Detecting and preventing unauthorized schema changes
- Onboarding existing databases to Flyway management
- Implementing zero-downtime database deployments

**Input format**: Spring Boot project, database connection details, migration script requirements, CI/CD pipeline configuration
**Expected output**: Production-ready Flyway implementation following enterprise patterns, best practices applied, workarounds documented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Flyway 11.x+ (PostgreSQL 14+ and Node.js 22+ if using Flyway CLI)
- Database access with DDL privileges for migration user
- CI/CD pipeline access for deployment automation
- Secret management system for credential injection (GCP Secret Manager, AWS Secrets Manager, etc.)
- Understanding of database migration lifecycle (versioned vs repeatable)

## Execution Steps

### Step 1: Migration Script Organization

Organize migration scripts using Directory Separation Pattern and strict naming conventions.

**Directory Structure Template**:
```
src/main/resources/
├── db/
│   └── migration/
│       ├── common/              # Core DDL (all environments)
│       │   ├── V1__create_users_table.sql
│       │   ├── V2__add_user_email_index.sql
│       │   └── V3__create_orders_table.sql
│       └── test_data/           # Seed data (test/staging only)
│           └── R__seed_test_users.sql
```

**Naming Convention**: `<Prefix><Version>__<Description>.sql`
- Versioned: `V1.2.3__add_user_email_index.sql` (double underscore mandatory)
- Repeatable: `R__update_user_view.sql` (no version, alphabetical order)

**Best Practice**: Atomic Change Pattern - one script = one atomic schema change
**Anti-Pattern**: Multiple unrelated changes in single script increases blast radius

### Step 2: Security Pattern - Dedicated Migration Users

Implement Principle of Least Privilege with separate database users for migrations and application runtime.

**Spring Boot Configuration Template**:
```properties
# Application Runtime (DML only)
spring.datasource.url=${DB_URL}
spring.datasource.username=app_read_write_user
spring.datasource.password=${APP_PASSWORD}

# Flyway Configuration (DDL user)
spring.flyway.url=${DB_URL}
spring.flyway.user=flyway_migration_user
spring.flyway.password=${FLYWAY_PASSWORD}
spring.flyway.locations=classpath:db/migration/common,classpath:db/migration/${spring.profiles.active}
```

**Best Practice**: flyway_migration_user has DDL privileges (CREATE, ALTER, DROP), app user has DML only (SELECT, INSERT, UPDATE, DELETE)
**Anti-Pattern**: Application user with DDL privileges creates security risk (application can modify schema)

### Step 3: Versioned vs Repeatable Migrations

Choose migration type based on change characteristics and lifecycle requirements.

**Versioned Migration (V) Template**:
```sql
-- V1.2.3__add_user_email_index.sql
CREATE INDEX idx_users_email ON users(email);
```

**When to Use**: Atomic schema changes applied once (DDL: CREATE TABLE, ALTER TABLE, DROP INDEX)

**Repeatable Migration (R) Template**:
```sql
-- R__update_user_view.sql
CREATE OR REPLACE VIEW user_summary AS
SELECT id, email, created_at FROM users;
```

**When to Use**: Database objects subject to frequent revision (views, stored procedures, functions, triggers, configuration data)

**Best Practice**: Repeatable scripts must be idempotent (CREATE OR REPLACE, IF NOT EXISTS)
**Anti-Pattern**: Non-idempotent repeatable scripts fail on re-execution

### Step 4: Backward Compatibility Pattern

Implement zero-downtime deployments using multi-version schema evolution.

**Multi-Version Evolution Template**:
```sql
-- V1.5__add_new_column.sql
ALTER TABLE users ADD COLUMN email_new VARCHAR(255);

-- V1.6__dual_write_phase.sql
-- Application writes to both columns during this phase
-- Old application version still reads from email_old

-- V1.7__remove_old_column.sql
ALTER TABLE users DROP COLUMN email_old;
```

**Best Practice**: Add → Dual Write → Remove pattern ensures backward compatibility
**Anti-Pattern**: Direct column rename breaks running application versions

### Step 5: CI/CD Integration

Implement Validation-First Approach in CI/CD pipeline with pre-flight checks and quality gates.

**CI/CD Script Template**:
```bash
# Pre-flight: testConnection (Flyway 11.x)
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} testConnection

# Validation: validate (checksum verification)
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} validate

# Drift Check: check --drift (staging/production)
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} check --drift

# Deployment: migrate
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} migrate
```

**Best Practice**: Execute testConnection → validate → check --drift → migrate sequence
**Anti-Pattern**: Skipping validation steps allows schema drift to go undetected

### Step 6: Baseline Pattern

Onboard existing databases to Flyway management without recreating schema.

**Baseline Process**:
1. Create initial migration scripts (V1, V2, etc.) reflecting current schema state
2. Do not apply these scripts (they represent existing state)
3. Execute baseline command: `flyway baseline -baselineVersion=1.0.0`

**Best Practice**: Baseline informs Flyway that migrations up to specified version are already applied
**Anti-Pattern**: Attempting migrate on existing database without baseline causes object existence errors

### Step 7: Java-Based Migrations Pattern

Use Java migrations for complex procedural logic extending beyond standard DDL/DML capabilities.

**Selection Criteria**: Use Java migrations when migration requires:
- Conditional logic based on data state
- Programmatic interaction with data (mass anonymization, complex transformations)
- Complex procedural tasks not expressible in pure SQL

**Java Migration Template**:
```java
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

public class V3__AnonymizeUserData extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        try (var statement = context.getConnection().createStatement()) {
            // Execute JDBC operations with conditional logic
            statement.executeUpdate("UPDATE users SET email = 'anonymized' WHERE created_at < '2020-01-01'");
        }
    }
}
```

**Classpath Location**: Place in `src/main/java/db/migration/` or environment-specific paths (e.g., `app/db/migration/default/`)

**Transaction Management**: Java migrations operate outside transactional guarantees of DDL unless explicitly managed. Use explicit transaction boundaries for data operations.

**Best Practice**: Use Java migrations only when SQL is insufficient; prefer SQL for standard DDL/DML
**Anti-Pattern**: Java migrations without explicit transaction management can leave partial state

### Step 8: Callback Pattern

Implement lifecycle hooks for operational tasks (cache flushing, monitoring integration, external system notifications).

**Java Callback Template** (Multiple Events):
```java
import org.flywaydb.core.api.callback.Callback;
import org.flywaydb.core.api.callback.Context;
import org.flywaydb.core.api.callback.Event;

public class MigrationLifecycleCallback implements Callback {
    @Override
    public boolean supports(Event event, Context context) {
        return event == Event.AFTER_MIGRATE 
            || event == Event.AFTER_EACH_MIGRATE_ERROR
            || event == Event.BEFORE_BASELINE
            || event == Event.AFTER_CLEAN;
    }
    
    @Override
    public void handle(Event event, Context context) {
        if (event == Event.AFTER_MIGRATE) {
            // Flush distributed caches, trigger readiness probes
            flushApplicationCaches();
        } else if (event == Event.AFTER_EACH_MIGRATE_ERROR) {
            // Publish alerts to monitoring systems (Splunk, PagerDuty)
            publishAlert("Migration failed: " + context.getMigrationInfo());
        } else if (event == Event.BEFORE_BASELINE) {
            // Pre-baseline validation
            validateBaselinePrerequisites();
        }
    }
    
    @Override
    public String getCallbackName() {
        return "MigrationLifecycleCallback";
    }
}
```

**Configuration Options**:
- Properties: `flyway.callbacks=com.example.MigrationLifecycleCallback`
- Programmatic: Register via Flyway API configuration
- TOML: `callbacks = ["com.example.MigrationLifecycleCallback"]`

**Event Selection**:
- `AFTER_MIGRATE`: Cache flushing, readiness probes, performance optimization (rebuild indices)
- `AFTER_EACH_MIGRATE_ERROR`: Monitoring alerts, logging integration
- `BEFORE_BASELINE`: Pre-baseline validation
- `AFTER_CLEAN`: Post-cleanup operations

**Best Practice**: Use AFTER_MIGRATE for cache flushing, AFTER_EACH_MIGRATE_ERROR for monitoring alerts, BEFORE_BASELINE for validation
**Anti-Pattern**: Missing callback registration or incorrect event selection prevents operational integration

### Step 9: Code Analysis Pattern

Enforce SQL quality gates using Flyway 11.x integrated SQLFluff and Redgate code analysis.

**CI/CD Integration**: Execute code analysis in CI phase to fail builds on policy violations.

**Configuration**: Enable code analysis with scope and SQL dialect parameters:
```properties
flyway.codeAnalysis.enabled=true
flyway.codeAnalysis.scope=all
flyway.codeAnalysis.sqlDialect=postgresql
```

**CI/CD Script Enhancement**:
```bash
# Quality Gate: Code Analysis (before validation)
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} \
  -codeAnalysis.enabled=true \
  -codeAnalysis.scope=all \
  analyze
```

**Best Practice**: Shift quality gate left - fail CI build on any policy violation before merge
**Anti-Pattern**: Missing code analysis allows non-standard or risky SQL scripts to reach production

### Step 10: Snapshot Management Pattern

Capture schema snapshots after deployment and use for drift detection in subsequent deployments.

**Snapshot Capture**: Flyway 11.17.0+ stores snapshots in snapshot history table after successful migrations.

**Drift Detection Workflow**:
1. Capture snapshot after successful migration: `flyway snapshot`
2. Compare target schema against snapshot: `flyway check --drift`
3. Expected state can be stored snapshot or freshly built schema from migrations

**Phased Adoption**: Initial deployments proceed with warning (not failure) if deployed snapshot not found, facilitating gradual integration.

**Best Practice**: Capture snapshots after successful migrations, execute drift checks for staging/production
**Anti-Pattern**: Missing drift detection allows unauthorized manual changes to go undetected

### Step 11: Configuration Patterns

Use TOML configuration for multi-environment setups with environment-specific overrides.

**TOML Environment Blocks**: Define distinct environment blocks for centralized configuration:
```toml
[flyway]
default-schema = "public"
locations = ["classpath:db/migration/common"]

[environments.dev]
url = "jdbc:postgresql://dev.internal:5432/myapp_dev"
user = "dev_flyway_user"
password = "${DEV_PASS}"

[environments.staging]
url = "jdbc:postgresql://stg.internal:5432/myapp_stg"
user = "stg_flyway_user"
password = "${STG_PASS}"
locations = ["classpath:db/migration/common", "classpath:db/migration/seed_data"]
```

**Configuration Precedence**: Environment variables > TOML environment blocks > TOML global defaults > Properties defaults

**Best Practice**: Use TOML for multi-environment setups, leverage environment blocks for environment-specific overrides
**Anti-Pattern**: Hardcoding environment-specific values in application.properties reduces flexibility

## Common Patterns

### Pattern 1: Immutability Principle

Schema History Table (FSH) serves as source of truth, enforcing checksum validation to prevent retroactive script modifications.

**Mechanism**: FSH records version, timestamp, and checksum for each applied migration. Validate command compares file checksums against FSH entries.

**When to Apply**: Always - this is Flyway's core philosophy
**Anti-Pattern**: Modifying applied versioned scripts causes checksum mismatch validation failure

### Pattern 2: Atomic Change Pattern

Each migration script encapsulates single, atomic schema change to minimize operational blast radius.

**When to Apply**: All versioned migrations (V__)
**Benefits**: Small transaction boundaries, simplified debugging, easier recovery
**Anti-Pattern**: Multiple unrelated changes in single script increases failure impact

### Pattern 3: Directory Separation Pattern

Organize migrations into logical directories (common vs environment-specific) for selective application.

**Structure**:
- `/db/migration/common`: Core DDL applied to all environments
- `/db/migration/test_data`: Seed data applied only to test/staging

**Configuration**: Use `spring.flyway.locations` or TOML environment blocks to control search paths
**When to Apply**: Multi-environment deployments requiring different data sets

### Pattern 4: Validation-First CI/CD

Execute validation steps (testConnection, validate, check --drift) before migration deployment.

**Sequence**: testConnection → validate → check --drift → migrate
**When to Apply**: All CI/CD deployments (mandatory for staging/production)
**Anti-Pattern**: Deploying without validation allows drift and connectivity issues to reach production

### Pattern 5: Snapshot and Drift Detection

Capture schema snapshots after deployment and compare target schema against expected state.

**Mechanism**: Flyway 11.17.0+ stores snapshots in snapshot history table. `check --drift` performs schema diff.
**When to Apply**: Staging and production deployments (governance requirement)
**Anti-Pattern**: Missing drift detection allows unauthorized manual changes to go undetected

### Pattern 6: Java-Based Migrations

Use Java migrations for complex procedural logic requiring conditional logic, programmatic data interaction, or tasks beyond pure SQL.

**When to Apply**: Conditional logic based on data state, mass data anonymization, complex configuration updates, procedural tasks
**Benefits**: Full JDBC access, conditional execution, complex transformations
**Anti-Pattern**: Using Java migrations for simple DDL/DML that could be SQL

### Pattern 7: Callback Lifecycle Hooks

Inject custom logic at specific points in Flyway lifecycle for operational integration (cache flushing, monitoring, external system notifications).

**When to Apply**: Cache flushing after migrations, monitoring alerts on errors, performance optimization (rebuild indices), external system integration
**Events**: AFTER_MIGRATE, AFTER_EACH_MIGRATE_ERROR, BEFORE_BASELINE, AFTER_CLEAN
**Anti-Pattern**: Missing callback registration or incorrect event selection

### Pattern 8: Code Analysis Quality Gates

Enforce SQL coding standards and best practices using integrated SQLFluff and Redgate code analysis in CI phase.

**When to Apply**: All CI/CD deployments - fail build on policy violations before merge
**Benefits**: Early detection of non-standard SQL, consistent script quality, reduced production risk
**Anti-Pattern**: Missing code analysis allows risky SQL scripts to reach production

### Pattern 9: TOML Configuration

Use TOML configuration files with environment blocks for centralized, multi-environment configuration management.

**When to Apply**: Multi-environment deployments requiring different connection details, locations, or settings per environment
**Benefits**: Centralized configuration, environment-specific overrides, improved readability
**Anti-Pattern**: Hardcoding environment-specific values reduces flexibility and maintainability

## Best Practices

1. **Naming Conventions**: Strict adherence to `<Prefix><Version>__<Description>.sql` format with double underscore separator
2. **Atomic Changes**: One migration script = one atomic schema change to minimize blast radius
3. **Security Separation**: Dedicated migration user (DDL privileges) distinct from application user (DML only)
4. **Backward Compatibility**: Multi-version schema evolution (Add → Dual Write → Remove) for zero-downtime deployments
5. **Code Analysis Enforcement**: Enable code analysis (SQLFluff) in CI phase to fail builds on policy violations, shift quality gate left
6. **Drift Detection**: Execute `check --drift` for staging/production to detect unauthorized changes
7. **Snapshot Management**: Capture snapshots after successful migrations for baseline comparison, use phased adoption strategy
8. **Callback Usage**: Implement AFTER_MIGRATE callbacks for cache flushing and AFTER_EACH_MIGRATE_ERROR for monitoring alerts, select appropriate events for operational tasks
9. **Java Migration Transaction Management**: Always use explicit transaction boundaries in Java migrations, handle rollback scenarios, prefer SQL migrations when possible
10. **TOML Configuration**: Use TOML with environment blocks for multi-environment setups, leverage configuration precedence (env vars > TOML blocks > defaults)
11. **Callback Event Selection**: Map operational tasks to appropriate events (AFTER_MIGRATE for cache flush, AFTER_EACH_MIGRATE_ERROR for alerts, BEFORE_BASELINE for validation)

## Workarounds

### Workaround 1: Repair Safety Protocol

**When**: Applied versioned script was modified (checksum mismatch detected)

**Steps**:
1. Correct script file on disk to desired state
2. Manually verify and align database schema to match corrected script (if migration ran partially)
3. Execute `flyway repair` command (manual, high-privilege operation only)

**Trade-offs**: Metadata manipulation in FSH, requires DBRE approval, never automate in CI/CD pipeline

**Critical**: Repair only after file and database schema are definitively aligned

### Workaround 2: Out-of-Order Migration

**When**: Critical hotfix requires retrospective insertion (version lower than highest applied)

**Steps**: Use `-outOfOrder=true` parameter to execute resolved but unapplied migrations regardless of version sequence

**Trade-offs**: Introduces complexity into migration history, high-risk operation, reserved for specific recovery scenarios

**Note**: Repair command cannot resolve validation errors for retrospectively injected files marked as Ignored in FSH

### Workaround 3: Baseline for Legacy Systems

**When**: Onboarding existing database without migration history

**Steps**:
1. Create initial migration scripts (V1, V2, etc.) representing current schema state
2. Do not apply these scripts (they document existing state)
3. Execute `flyway baseline -baselineVersion=1.0.0` to mark migrations as applied

**Trade-offs**: Historical migrations prior to baseline are not tracked in FSH

### Workaround 4: Snapshot Phased Adoption

**When**: Gradually integrating drift detection into existing pipelines without immediate disruption

**Steps**: 
1. Configure snapshot capture after migrations
2. Initial deployments proceed with warning (not failure) if deployed snapshot not found
3. After snapshots are established, enforce drift checks as mandatory

**Trade-offs**: Phased approach allows gradual adoption but may miss drift in early stages

### Workaround 5: Java Migration Classpath Resolution

**When**: Java migration classes not discovered by Flyway due to incorrect classpath location

**Steps**:
1. Verify migration class extends BaseJavaMigration (or implements JavaMigration)
2. Ensure class follows naming convention (e.g., `V3__Anonymize.java`)
3. Place in correct classpath location: `src/main/java/db/migration/` or environment-specific paths (e.g., `app/db/migration/default/`)
4. Verify class is included in build artifact (JAR/WAR)

**Trade-offs**: Classpath issues require build configuration verification, may need explicit package scanning

### Workaround 6: Callback Event Selection

**When**: Need to determine appropriate callback events for specific operational tasks

**Steps**:
1. Identify operational task (cache flush, monitoring, validation)
2. Map task to appropriate event:
   - Cache flush after all migrations: `AFTER_MIGRATE`
   - Error alerting: `AFTER_EACH_MIGRATE_ERROR`
   - Pre-baseline validation: `BEFORE_BASELINE`
   - Post-cleanup operations: `AFTER_CLEAN`
3. Implement `supports()` method to filter events
4. Register callback in configuration

**Trade-offs**: Incorrect event selection prevents callback execution, requires understanding of Flyway lifecycle

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mutability of Applied Versioned Scripts

**Issue**: Modifying applied V__ script (even adding comment) generates new checksum, causing validation failure on next migration attempt

**Detection**: `Migration checksum mismatch` validation error when Flyway compares file checksum against FSH entry

**Resolution**: 
- Preferred: Create new V script to fix bug
- Workaround: Follow Repair Safety Protocol (manual, high-privilege only)

**Prevention**: Never modify applied versioned scripts after successful execution

### Anti-Pattern 2: Retrospective Insertion (Out-of-Order)

**Issue**: Inserting migration with version lower than highest applied version (e.g., V1.1.4 when V1.1.5 already ran)

**Detection**: Migration marked as Ignored in FSH, not applied during migrate operation

**Resolution**:
- Preferred: Re-version script to latest available version
- Workaround: Use `-outOfOrder=true` (high risk, introduces complexity)

**Prevention**: Always use sequential version numbers, never insert retrospectively

### Anti-Pattern 3: Relying on Undo for Disaster Recovery

**Issue**: Undo migrations fail with DDL changes or partial migration failures, leaving schema in indeterminate state

**Detection**: Operational risk (not validation error) - undo scripts cannot properly resolve partial failures

**Resolution**: Design for backward compatibility, use storage snapshots/tested backups for primary disaster recovery

**Prevention**: Multi-version schema evolution ensures application rollback without database restoration

### Anti-Pattern 4: Missing Privilege Separation

**Issue**: Application runtime user has DDL privileges, enabling application-level errors to cause catastrophic schema changes

**Detection**: Security audit reveals application user can execute CREATE, ALTER, DROP commands

**Resolution**: Implement Dedicated Migration Users pattern - separate flyway_migration_user (DDL) from app user (DML only)

**Prevention**: Enforce Principle of Least Privilege in database user configuration

### Anti-Pattern 5: Skipping Validation Steps

**Issue**: Deploying migrations without validate or check --drift allows schema drift and checksum mismatches to go undetected

**Detection**: Schema drift discovered in production, unauthorized manual changes not caught

**Resolution**: Enforce Validation-First CI/CD pattern - always execute testConnection → validate → check --drift → migrate

**Prevention**: Make validation steps mandatory in CI/CD pipeline configuration

### Anti-Pattern 6: Non-Idempotent Repeatable Migrations

**Issue**: Repeatable migration scripts that fail on re-execution because they lack idempotency (e.g., CREATE without OR REPLACE, INSERT without IF NOT EXISTS)

**Detection**: Repeatable migration fails with "object already exists" or "duplicate key" errors on subsequent executions

**Resolution**: Refactor repeatable scripts to be idempotent using CREATE OR REPLACE, IF NOT EXISTS, or conditional logic

**Prevention**: Always design repeatable migrations to be safe for multiple executions

### Anti-Pattern 7: Missing Quality Gates

**Issue**: Deploying migrations without code analysis in CI phase allows non-standard or potentially risky SQL scripts to merge into main development line

**Detection**: Non-standard SQL patterns discovered in production, policy violations not caught early

**Resolution**: Enable code analysis (SQLFluff) in CI phase, configure build to fail on policy violations

**Prevention**: Mandate code analysis as mandatory CI step before merge, fail builds on violations

### Anti-Pattern 8: Improper Callback Registration

**Issue**: Callbacks not registered in configuration or incorrectly configured, preventing operational integration (cache flushing, monitoring alerts)

**Detection**: Callbacks not executing during migration lifecycle, operational tasks not triggered

**Resolution**: Register callbacks via properties (`flyway.callbacks`), programmatic API, or TOML configuration

**Prevention**: Verify callback registration in configuration, test callback execution in non-production environments

### Anti-Pattern 9: Java Migration Transaction Issues

**Issue**: Java migrations without explicit transaction management can leave database in partial state if operations fail mid-execution

**Detection**: Partial data updates or schema changes after Java migration failure, inconsistent database state

**Resolution**: Use explicit transaction boundaries in Java migrations, handle rollback scenarios, test failure paths

**Prevention**: Always manage transactions explicitly in Java migrations, prefer SQL migrations when possible

## Code Templates

### Template 1: Spring Boot application.properties

```properties
# Application Runtime (DML only user for operational application)
spring.datasource.url=${DB_URL}
spring.datasource.username=app_read_write_user
spring.datasource.password=${APP_PASSWORD}

# Flyway Configuration (Dedicated DDL user, secured via secret vault)
spring.flyway.url=${DB_URL}
spring.flyway.user=flyway_migration_user
spring.flyway.password=${FLYWAY_PASSWORD}
spring.flyway.locations=classpath:db/migration/common,classpath:db/migration/${spring.profiles.active}
```

### Template 2: Flyway TOML Configuration

```toml
[flyway]
default-schema = "public"
locations = ["classpath:db/migration/common"]

[environments.dev]
url = "jdbc:postgresql://dev.internal:5432/myapp_dev"
user = "dev_flyway_user"
password = "${DEV_PASS}"

[environments.staging]
url = "jdbc:postgresql://stg.internal:5432/myapp_stg"
user = "stg_flyway_user"
password = "${STG_PASS}"
locations = ["classpath:db/migration/common", "classpath:db/migration/seed_data"]
```

### Template 3: Java Callback (AFTER_MIGRATE)

```java
import org.flywaydb.core.api.callback.Callback;
import org.flywaydb.core.api.callback.Context;
import org.flywaydb.core.api.callback.Event;

public class AfterMigrateCacheFlusher implements Callback {
    @Override
    public boolean supports(Event event, Context context) {
        return event == Event.AFTER_MIGRATE;
    }
    
    @Override
    public void handle(Event event, Context context) {
        // Implementation: Flush distributed caches, trigger readiness probes
        System.out.println(">>> Flyway Callback: Migration successful. Triggering cache flush...");
    }
    
    @Override
    public String getCallbackName() {
        return "CacheFlusher";
    }
}
```

### Template 4: CI/CD Script (Alpine CLI)

```bash
# Define Flyway CLI and environment variables
FLYWAY_CLI=/flyway/flyway
DB_URL="jdbc:postgresql://${_DB_HOST}:5432/${_DB_NAME}"
FLYWAY_USER="${DB_MIGRATION_USER}"
FLYWAY_PASS="${DB_MIGRATION_PASSWORD}"

# Pre-flight: testConnection (Flyway 11.x)
echo "Running connectivity test..."
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} testConnection

# Validation: validate (checksum verification)
echo "Running script validation..."
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} validate

# Drift Check: check --drift (staging/production)
echo "Running drift check..."
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} check --drift

# Deployment: migrate
echo "Starting migration..."
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} migrate
echo "Migration completed successfully!"
```

### Template 5: Versioned Migration (Atomic Change)

```sql
-- V1.2.3__add_user_email_index.sql
CREATE INDEX idx_users_email ON users(email);
```

### Template 6: Repeatable Migration (Idempotent)

```sql
-- R__update_user_view.sql
CREATE OR REPLACE VIEW user_summary AS
SELECT id, email, created_at FROM users;
```

### Template 7: Multi-Version Schema Evolution (Backward Compatibility)

```sql
-- V1.5__add_new_column.sql
ALTER TABLE users ADD COLUMN email_new VARCHAR(255);

-- V1.6__dual_write_phase.sql
-- Application writes to both columns during this phase
-- Old application version still reads from email_old

-- V1.7__remove_old_column.sql
ALTER TABLE users DROP COLUMN email_old;
```

### Template 8: Java Migration (BaseJavaMigration)

See `templates/java-migration.template` for complete template with transaction management.

### Template 9: Java Callback (Multiple Events)

See `templates/java-callback.template` for complete callback implementation with multiple event handlers.

### Template 10: Maven/Gradle Dependencies

See `templates/maven-dependency.template` for dependency configuration snippets.

### Template 11: Quarkus Extension Integration

See `templates/quarkus-extension.template` for Quarkus-specific Flyway integration.

## Examples

### Example 1: Spring Boot Integration with Multi-Environment

**Scenario**: Spring Boot application requiring separate migration user and environment-specific seed data.

**Configuration** (`application.properties`):
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=app_read_write_user
spring.datasource.password=${APP_PASSWORD}

spring.flyway.url=${DB_URL}
spring.flyway.user=flyway_migration_user
spring.flyway.password=${FLYWAY_PASSWORD}
spring.flyway.locations=classpath:db/migration/common,classpath:db/migration/${spring.profiles.active}
```

**Directory Structure**:
```
db/migration/
├── common/
│   ├── V1__create_users_table.sql
│   └── V2__add_user_email_index.sql
└── test_data/
    └── R__seed_test_users.sql
```

**Key Patterns Applied**: Security Pattern (dedicated users), Directory Separation (common + environment-specific)

### Example 2: CI/CD Pipeline with Validation-First

**Scenario**: CI/CD pipeline implementing validation-first approach with pre-flight checks and drift detection.

**Pipeline Script**:
```bash
FLYWAY_CLI=/flyway/flyway
DB_URL="jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}"
FLYWAY_USER="${DB_MIGRATION_USER}"
FLYWAY_PASS="${DB_MIGRATION_PASSWORD}"

# Pre-flight validation
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} testConnection

# Integrity check
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} validate

# Drift detection (staging/production)
if [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "production" ]; then
  ${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} check --drift
fi

# Deployment
${FLYWAY_CLI} -url=${DB_URL} -user=${FLYWAY_USER} -password=${FLYWAY_PASS} migrate
```

**Key Patterns Applied**: Validation-First CI/CD (testConnection → validate → check --drift → migrate), Environment-specific drift checks

### Example 3: Java Migration for Data Anonymization

**Scenario**: Mass anonymization of user data requiring conditional logic based on data state.

**Java Migration** (`V3__AnonymizeOldUsers.java`):
```java
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.PreparedStatement;

public class V3__AnonymizeOldUsers extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        try (var connection = context.getConnection();
             var stmt = connection.prepareStatement(
                 "UPDATE users SET email = 'anonymized' WHERE created_at < ?")) {
            
            connection.setAutoCommit(false);
            try {
                stmt.setDate(1, java.sql.Date.valueOf("2020-01-01"));
                int updated = stmt.executeUpdate();
                connection.commit();
                System.out.println("Anonymized " + updated + " user records");
            } catch (Exception e) {
                connection.rollback();
                throw e;
            }
        }
    }
}
```

**Key Patterns Applied**: Java-Based Migrations (conditional logic, explicit transaction management)

### Example 4: Callback for Cache Flushing and Monitoring

**Scenario**: Operational integration requiring cache flush after migrations and error alerting.

**Java Callback** (`MigrationLifecycleCallback.java`):
```java
import org.flywaydb.core.api.callback.Callback;
import org.flywaydb.core.api.callback.Context;
import org.flywaydb.core.api.callback.Event;

public class MigrationLifecycleCallback implements Callback {
    @Override
    public boolean supports(Event event, Context context) {
        return event == Event.AFTER_MIGRATE || event == Event.AFTER_EACH_MIGRATE_ERROR;
    }
    
    @Override
    public void handle(Event event, Context context) {
        if (event == Event.AFTER_MIGRATE) {
            // Flush distributed caches
            flushCaches();
        } else if (event == Event.AFTER_EACH_MIGRATE_ERROR) {
            // Alert monitoring system
            alertMonitoring("Migration failed: " + context.getMigrationInfo().getVersion());
        }
    }
    
    @Override
    public String getCallbackName() {
        return "MigrationLifecycleCallback";
    }
    
    private void flushCaches() {
        // Implementation: Flush Redis/distributed caches
    }
    
    private void alertMonitoring(String message) {
        // Implementation: Publish to Splunk/PagerDuty
    }
}
```

**Configuration** (`application.properties`):
```properties
flyway.callbacks=com.example.MigrationLifecycleCallback
```

**Key Patterns Applied**: Callback Pattern (AFTER_MIGRATE for cache flushing, AFTER_EACH_MIGRATE_ERROR for monitoring)

