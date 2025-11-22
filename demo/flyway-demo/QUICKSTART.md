# Flyway Demo Quick Start Guide

Quick start guide for running the Flyway Enterprise Best Practices Demo.

## Prerequisites

1. **Java 21+**
   ```bash
   java -version
   ```

2. **Maven 3.6+**
   ```bash
   mvn -version
   ```

**No database installation required!** This demo uses H2, an embedded database that runs automatically.

## Quick Setup

### 1. Set Environment Variables

**Option 1: Using .env file (Recommended)**

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

# Migration Locations
MIGRATION_LOCATIONS=filesystem:src/main/resources/db/migration/common
```

The `flyway-deploy.sh` script will automatically load these variables.

**Option 2: Export in shell**

```bash
export DB_URL="jdbc:h2:file:./data/flyway_demo"
export FLYWAY_USER="sa"
export FLYWAY_PASSWORD=""
export APP_USER="sa"
export APP_PASSWORD=""
```

### 3. Run Application

```bash
cd flyway-demo
mvn spring-boot:run
```

The application will:
1. Connect to the database using the migration user
2. Execute all pending migrations automatically
3. Display migration status and callback execution

## Verify Migrations

### Check Migration History

Using H2 Console (if enabled) or SQL:

```bash
# Using H2 SQL (via Spring Boot or H2 console)
# The database file is located at: ./data/flyway_demo.mv.db
```

Or check via application logs - Flyway will display migration status on startup.

### Verify Tables Created

The database file is created automatically at `./data/flyway_demo.mv.db`. You can:

1. **Check via application logs** - Flyway logs show all applied migrations
2. **Use H2 Console** - If enabled in Spring Boot, access at `http://localhost:8080/h2-console`
3. **Query via SQL** - Connect using any H2 client

Expected tables:
- `users` - User accounts table
- `orders` - Customer orders table
- `flyway_schema_history` - Flyway migration history
- `user_summary` - View with user statistics

## Test Repeatable Migration

Repeatable migrations re-execute when their checksum changes. To test:

1. Modify `R__update_user_summary_view.sql` (add a comment)
2. Run the application again
3. The view will be recreated with the new definition

## Test Java Migration

The Java migration `V6__AnonymizeOldUsers` demonstrates:
- Explicit transaction management
- Conditional logic based on data state
- Proper rollback handling

To test:
1. Insert some test users with old dates
2. Run the application
3. Check that old users are anonymized

## Test Callback Integration

The `MigrationLifecycleCallback` will:
- Log cache flushing after successful migrations
- Log monitoring alerts on errors
- Execute operational tasks

Check application logs for callback execution messages.

## Next Steps

- Review the [README.md](README.md) for detailed patterns and best practices
- Explore the migration scripts in `src/main/resources/db/migration/`
- Review the CI/CD script in `scripts/flyway-deploy.sh`
- Check the [Implementing Flyway DB Enterprise Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-flyway-db-enterprise/SKILL.md) for comprehensive patterns

