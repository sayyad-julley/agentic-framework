# Flyway Enterprise Best Practices Demo

Production-ready Flyway implementation demonstrating enterprise patterns, best practices, and proper migration management following Flyway DB 11.x guidelines.

## Overview

This project demonstrates production-ready Flyway implementations including:

- **Dedicated Migration Users Pattern**: Separate DDL user (flyway_migration_user) from application runtime user (DML only)
- **Directory Separation Pattern**: Organized migrations into common and environment-specific directories
- **Atomic Change Pattern**: One migration script = one atomic schema change
- **Validation-First CI/CD**: Pre-flight checks, validation, drift detection before migration
- **Idempotent Repeatable Migrations**: Safe re-execution using CREATE OR REPLACE, IF NOT EXISTS
- **Java Migrations with Transaction Management**: Explicit transaction boundaries for data operations
- **Callback Lifecycle Hooks**: Operational integration (cache flushing, monitoring alerts)
- **Code Analysis Quality Gates**: SQLFluff integration for CI/CD enforcement
- **TOML Configuration**: Multi-environment setup with environment-specific overrides

## Patterns Implemented

### 1. Dedicated Migration Users Pattern

**Principle of Least Privilege:**
- **Migration User**: `flyway_migration_user` with DDL privileges (CREATE, ALTER, DROP)
- **Application User**: `app_read_write_user` with DML only (SELECT, INSERT, UPDATE, DELETE)

**Configuration** (`application.properties`):
```properties
# Application Runtime (DML only)
spring.datasource.username=app_read_write_user
spring.datasource.password=${APP_PASSWORD}

# Flyway Configuration (DDL user)
spring.flyway.user=flyway_migration_user
spring.flyway.password=${FLYWAY_PASSWORD}
```

**Benefits:**
- Prevents application-level errors from causing catastrophic schema changes
- Enforces security separation between runtime and migration operations
- Enables audit trail for schema changes

### 2. Directory Separation Pattern

**Organized Migration Structure:**
```
src/main/resources/db/migration/
├── common/              # Core DDL (all environments)
│   ├── V1__create_users_table.sql
│   ├── V2__add_user_email_index.sql
│   ├── V3__create_orders_table.sql
│   └── R__update_user_summary_view.sql
└── test_data/           # Seed data (test/staging only)
    └── R__seed_test_users.sql
```

**Configuration:**
```properties
spring.flyway.locations=classpath:db/migration/common,classpath:db/migration/${spring.profiles.active}
```

**Benefits:**
- Selective application of migrations per environment
- Clear separation between schema changes and test data
- Environment-specific seed data without affecting production

### 3. Atomic Change Pattern

**One Script = One Atomic Change:**
- `V1__create_users_table.sql`: Creates users table only
- `V2__add_user_email_index.sql`: Adds index separately
- `V3__create_orders_table.sql`: Creates orders table only

**Benefits:**
- Small transaction boundaries
- Simplified debugging
- Easier recovery from failures
- Reduced operational blast radius

### 4. Validation-First CI/CD Pattern

**Deployment Sequence:**
1. **testConnection**: Verify database connectivity
2. **analyze**: Code analysis (SQLFluff) quality gates
3. **validate**: Checksum verification
4. **check --drift**: Schema drift detection (staging/production)
5. **migrate**: Execute migrations
6. **snapshot**: Capture schema snapshot

**CI/CD Script** (`scripts/flyway-deploy.sh`):
```bash
# Pre-flight: testConnection
flyway testConnection

# Quality Gate: Code Analysis
flyway analyze -codeAnalysis.enabled=true

# Validation: validate
flyway validate

# Drift Check: check --drift
flyway check --drift

# Deployment: migrate
flyway migrate
```

**Benefits:**
- Early detection of connectivity issues
- Policy violations caught before deployment
- Checksum mismatches detected early
- Unauthorized schema changes identified

### 5. Idempotent Repeatable Migrations

**Pattern: CREATE OR REPLACE, IF NOT EXISTS**

**Example** (`R__update_user_summary_view.sql`):
```sql
CREATE OR REPLACE VIEW user_summary AS
SELECT ... FROM users ...
```

**Example** (`R__seed_test_users.sql`):
```sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.user@example.com') THEN
        INSERT INTO users ...
    END IF;
END $$;
```

**Benefits:**
- Safe re-execution without errors
- Automatic updates when checksum changes
- No manual intervention required

### 6. Java Migrations with Transaction Management

**Pattern: Explicit Transaction Boundaries**

**Example** (`V6__AnonymizeOldUsers.java`):
```java
Connection connection = context.getConnection();
connection.setAutoCommit(false);

try {
    // Data operations
    int updated = anonymizeOldUsers(connection);
    connection.commit();
} catch (Exception e) {
    connection.rollback();
    throw e;
}
```

**Benefits:**
- Prevents partial state on failures
- Explicit rollback handling
- Conditional logic based on data state

### 7. Callback Lifecycle Hooks

**Pattern: Operational Integration**

**Events Handled:**
- `AFTER_MIGRATE`: Cache flushing, readiness probes
- `AFTER_EACH_MIGRATE_ERROR`: Monitoring alerts
- `BEFORE_BASELINE`: Pre-baseline validation
- `AFTER_CLEAN`: Post-cleanup operations

**Configuration:**
```properties
spring.flyway.callbacks=com.example.flyway.callbacks.MigrationLifecycleCallback
```

**Benefits:**
- Automatic cache flushing after migrations
- Real-time monitoring alerts on errors
- Operational integration without code changes

### 8. TOML Configuration

**Multi-Environment Setup:**

```toml
[flyway]
default-schema = "public"
locations = ["classpath:db/migration/common"]

[environments.dev]
url = "jdbc:postgresql://localhost:5432/flyway_demo_dev"
user = "dev_flyway_user"
locations = ["classpath:db/migration/common", "classpath:db/migration/test_data"]

[environments.production]
url = "jdbc:postgresql://localhost:5432/flyway_demo_prod"
user = "prod_flyway_user"
locations = ["classpath:db/migration/common"]
```

**Benefits:**
- Centralized configuration
- Environment-specific overrides
- Improved readability and maintainability

## Project Structure

```
flyway-demo/
├── src/main/
│   ├── java/com/example/flyway/
│   │   ├── FlywayDemoApplication.java          # Spring Boot application
│   │   ├── migrations/
│   │   │   └── V6__AnonymizeOldUsers.java     # Java migration with transaction management
│   │   └── callbacks/
│   │       └── MigrationLifecycleCallback.java # Callback lifecycle hooks
│   └── resources/
│       ├── application.properties              # Spring Boot configuration
│       ├── flyway.toml                         # TOML multi-environment configuration
│       └── db/migration/
│           ├── common/                         # Core DDL (all environments)
│           │   ├── V1__create_users_table.sql
│           │   ├── V2__add_user_email_index.sql
│           │   ├── V3__create_orders_table.sql
│           │   ├── V4__add_user_phone_column.sql
│           │   ├── V5__add_user_phone_index.sql
│           │   └── R__update_user_summary_view.sql
│           └── test_data/                      # Seed data (test/staging only)
│               └── R__seed_test_users.sql
├── scripts/
│   └── flyway-deploy.sh                        # CI/CD deployment script
├── pom.xml                                      # Maven dependencies
└── README.md                                    # This file
```

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- H2 Database (embedded, no installation required)
- Flyway CLI 11.x (optional, for standalone migration execution)

## Dependencies

- `org.springframework.boot:spring-boot-starter-jdbc:3.2.0` - Spring Boot JDBC
- `org.flywaydb:flyway-core:11.0.0` - Flyway Core
- `org.flywaydb:flyway-database-h2:11.0.0` - Flyway H2 support
- `com.h2database:h2:2.2.224` - H2 Database JDBC driver

## Database Setup

**No database setup required!** H2 is an embedded database that runs automatically.

### H2 Database Modes

The demo uses H2 in **file-based mode** (persistent) by default:
- **File-based**: `jdbc:h2:file:./data/flyway_demo` - Data persists in `./data/` directory
- **In-memory**: `jdbc:h2:mem:flyway_demo` - Data is lost when application stops

### Default Configuration

- **User**: `sa` (default H2 user)
- **Password**: (empty, default H2 password)
- **Database**: Created automatically in `./data/flyway_demo.mv.db`

**Note**: For production-like demonstrations, you can still use PostgreSQL by changing the JDBC URL in your `.env` file.

## Configuration

### Environment Variables

You can configure Flyway using environment variables in a `.env` file or by exporting them in your shell.

#### Using .env File (Recommended)

Create a `.env` file in the `flyway-demo` directory:

```bash
# Database Connection (H2)
# File-based (persistent): jdbc:h2:file:./data/flyway_demo
# In-memory: jdbc:h2:mem:flyway_demo
DB_NAME=flyway_demo
DB_URL=jdbc:h2:file:./data/flyway_demo

# Flyway Migration User (H2 default: sa)
FLYWAY_USER=sa
FLYWAY_PASSWORD=

# Application User (H2 default: sa)
APP_USER=sa
APP_PASSWORD=

# Flyway CLI Configuration
FLYWAY_CLI=flyway

# Migration Locations
MIGRATION_LOCATIONS=filesystem:src/main/resources/db/migration/common
```

The `flyway-deploy.sh` script will automatically load variables from the `.env` file if it exists.

#### Using Shell Environment Variables

Alternatively, export environment variables in your shell:

```bash
export DB_URL="jdbc:h2:file:./data/flyway_demo"
export FLYWAY_USER="sa"
export FLYWAY_PASSWORD=""
export APP_USER="sa"
export APP_PASSWORD=""
```

### Spring Profiles

Use Spring profiles to control migration locations:

```bash
# Development (includes test data)
export SPRING_PROFILES_ACTIVE=dev

# Production (common migrations only)
export SPRING_PROFILES_ACTIVE=production
```

## Usage Examples

### 1. Run Spring Boot Application

The application will automatically run Flyway migrations on startup:

```bash
mvn spring-boot:run
```

### 2. Execute Migrations Manually (Flyway CLI)

Using environment variables from `.env`:

```bash
# Load .env file (if not already loaded)
source .env

# Run migrations
flyway -url="${DB_URL}" \
       -user="${FLYWAY_USER}" \
       -password="${FLYWAY_PASSWORD}" \
       -locations="${MIGRATION_LOCATIONS:-filesystem:src/main/resources/db/migration/common}" \
       migrate
```

Or with explicit H2 values:

```bash
flyway -url="jdbc:h2:file:./data/flyway_demo" \
       -user=sa \
       -password= \
       -locations=filesystem:src/main/resources/db/migration/common \
       migrate
```

### 3. Validate Migrations

```bash
# Using .env variables
source .env
flyway -url="${DB_URL}" \
       -user="${FLYWAY_USER}" \
       -password="${FLYWAY_PASSWORD}" \
       -locations="${MIGRATION_LOCATIONS:-filesystem:src/main/resources/db/migration/common}" \
       validate
```

### 4. Check Schema Drift

```bash
# Using .env variables
source .env
flyway -url="${DB_URL}" \
       -user="${FLYWAY_USER}" \
       -password="${FLYWAY_PASSWORD}" \
       -locations="${MIGRATION_LOCATIONS:-filesystem:src/main/resources/db/migration/common}" \
       check --drift
```

### 5. Run CI/CD Deployment Script

The deployment script automatically loads variables from `.env` if it exists:

```bash
# Script will automatically source .env file
./scripts/flyway-deploy.sh staging
```

The script supports the following environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME` or `DB_URL` - Database connection
- `FLYWAY_USER` or `DB_MIGRATION_USER` - Migration user
- `FLYWAY_PASSWORD` or `DB_MIGRATION_PASSWORD` - Migration password
- `MIGRATION_LOCATIONS` - Migration script locations (defaults to common directory)
- `FLYWAY_CLI` - Flyway CLI command (defaults to `flyway`)

## Best Practices Checklist

### Migration Script Organization

- ✅ Strict naming convention: `<Prefix><Version>__<Description>.sql`
- ✅ Atomic changes: One script = one atomic schema change
- ✅ Directory separation: Common vs environment-specific
- ✅ Sequential versioning: Never insert retrospectively

### Security

- ✅ Dedicated migration user with DDL privileges
- ✅ Application user with DML only
- ✅ Principle of Least Privilege enforced
- ✅ Credentials stored in environment variables or secret vaults

### Migration Types

- ✅ Versioned migrations for atomic schema changes
- ✅ Repeatable migrations for idempotent updates (views, procedures)
- ✅ Idempotent repeatable scripts (CREATE OR REPLACE, IF NOT EXISTS)

### Transaction Management

- ✅ Explicit transaction boundaries in Java migrations
- ✅ Rollback handling for error scenarios
- ✅ Prefer SQL migrations when possible

### CI/CD Integration

- ✅ Validation-first approach (testConnection → validate → check --drift → migrate)
- ✅ Code analysis quality gates (SQLFluff)
- ✅ Drift detection for staging/production
- ✅ Snapshot capture after successful migrations

### Callback Integration

- ✅ AFTER_MIGRATE for cache flushing and readiness probes
- ✅ AFTER_EACH_MIGRATE_ERROR for monitoring alerts
- ✅ Proper callback registration in configuration

### Configuration

- ✅ TOML configuration for multi-environment setups
- ✅ Environment-specific location overrides
- ✅ Configuration precedence (env vars > TOML blocks > defaults)

## Migration Lifecycle

### Versioned Migrations (V)

- **Applied once**: Executed in version order
- **Immutable**: Never modify after successful execution
- **Use case**: Atomic schema changes (CREATE TABLE, ALTER TABLE, DROP INDEX)

### Repeatable Migrations (R)

- **Re-executed**: Runs when checksum changes
- **Idempotent**: Safe for multiple executions
- **Use case**: Views, stored procedures, functions, configuration data

## Monitoring and Observability

### Key Metrics

- **Migration Status**: Track applied migrations in `flyway_schema_history` table
- **Execution Time**: Monitor migration duration
- **Error Rate**: Track failed migrations
- **Drift Detection**: Monitor unauthorized schema changes

### Callback Integration

The `MigrationLifecycleCallback` provides:
- Cache flushing after successful migrations
- Monitoring alerts on migration errors
- Pre-baseline validation
- Post-cleanup operations

## Related Resources

- [Flyway Official Documentation](https://flywaydb.org/documentation/)
- [Flyway Best Practices](https://flywaydb.org/documentation/usage/best-practices)
- [Implementing Flyway DB Enterprise Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-flyway-db-enterprise/SKILL.md)

## Notes

- **Immutability Principle**: Applied versioned scripts must never be modified after successful execution. Create new V scripts to fix bugs.
- **Sequential Versioning**: Always use sequential version numbers. Never insert migrations retrospectively.
- **Backward Compatibility**: Use multi-version schema evolution (Add → Dual Write → Remove) for zero-downtime deployments.
- **Validation-First**: Always execute validation steps before migration deployment in CI/CD pipelines.
- **Drift Detection**: Use `check --drift` for staging/production to detect unauthorized schema changes.
- **Transaction Management**: Always use explicit transaction boundaries in Java migrations with proper rollback handling.

