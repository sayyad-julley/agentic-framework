# Flowable Best Practices Demo

Production-ready Flowable implementation demonstrating best practices and patterns from the `implementing-flowable-orchestration` skill document.

## Overview

This project demonstrates production-ready Flowable implementations following best practices:

- **Asynchronous Continuation for Parallel Joins**: Prevents `FlowableOptimisticLockingException` by using async markers before join gateways
- **Transient Variable Doctrine**: Uses transient variables for temporary data to avoid data hoarding and maintain database performance
- **Job Executor Pool Configuration**: Proper pool sizing and monitoring to prevent pool exhaustion
- **Explicit Script Variable Assignment**: Uses `flowable:autoStoreVariables="false"` for consistent behavior across environments

## Patterns Implemented

### 1. Asynchronous Continuation for Parallel Joins

**Best Practice**: Introduce asynchronous continuation immediately before join gateway to delegate join operation to Job Executor, processing in new distinct transaction.

**Key Features**:
- Service Task with `flowable:async="true"` before each parallel branch joins
- Simple logging delegate (`AsyncJoinMarkerDelegate`) as async marker
- Prevents concurrent transactions from updating same execution record

**Anti-Patterns Avoided**:
- ❌ Synchronous parallel gateway joins (causes `FlowableOptimisticLockingException`)
- ❌ Ignoring process stalls under load

**BPMN Example**:
```xml
<!-- Parallel Branch 1 -->
<serviceTask id="task1" name="Parallel Task 1" 
             flowable:class="com.example.flowable.delegates.ParallelTask1Delegate"/>
<sequenceFlow sourceRef="task1" targetRef="asyncJoinMarker1"/>

<!-- ✅ Async Marker Before Join -->
<serviceTask id="asyncJoinMarker1" 
             name="Async Join Boundary Trigger"
             flowable:async="true"
             flowable:class="com.example.flowable.delegates.AsyncJoinMarkerDelegate"/>
<sequenceFlow sourceRef="asyncJoinMarker1" targetRef="parallelJoin"/>

<parallelGateway id="parallelJoin" name="Join Results"/>
```

### 2. Transient Variable Doctrine

**Best Practice**: Use transient variables (`execution.setTransientVariable()`) for temporary data required only within tight sequence of steps. Persist only audit-critical business data as process variables.

**Key Features**:
- Transient variables for API response status codes and intermediate calculations
- Persistent variables only for essential business data (orderId, customerId)
- Automatic garbage collection at next wait state

**Anti-Patterns Avoided**:
- ❌ Storing large JSON API responses as persistent variables (bloats `ACT_RU_VARIABLE` table)
- ❌ Storing binary documents as process variables (causes database lock contention)
- ❌ Persisting intermediate status codes (unnecessary history bloat)

**Java Delegate Example**:
```java
// ✅ BEST PRACTICE: Set status as transient
execution.setTransientVariable("status", restResponse.getStatus());
execution.setTransientVariable("responseTime", restResponse.getResponseTime());

// ✅ BEST PRACTICE: Persist only essential business data
if (restResponse.getStatus() == 200) {
    execution.setVariable("orderId", parsedData.get("orderId")); // Persistent
    execution.setVariable("customerId", parsedData.get("customerId")); // Persistent
}
```

### 3. Job Executor Pool Configuration

**Best Practice**: Monitor `act_ru_job` table for queued jobs, size Job Executor thread pool based on workload to prevent resource starvation.

**Configuration**:
```properties
flowable.async-executor-activate=true
flowable.async-executor-core-pool-size=10
flowable.async-executor-max-pool-size=20
flowable.async-executor-queue-capacity=100
flowable.async-executor-keep-alive=60
```

**Monitoring**:
- Use `JobExecutorMonitor` to track job queue status
- Monitor unlocked jobs (available for execution)
- Alert when backlog exceeds threshold (>50 jobs)

**Anti-Patterns Avoided**:
- ❌ Insufficient Job Executor pool size (tasks appear stuck, exponentially increasing delays)
- ❌ Not monitoring `act_ru_job` table (missing early warning signs)

### 4. Explicit Script Variable Assignment

**Best Practice**: Configure `flowable:autoStoreVariables="false"` and mandate explicit `execution.setVariable()` calls for consistent behavior.

**BPMN XML Template**:
```xml
<scriptTask id="processData" 
            name="Process Data"
            flowable:autoStoreVariables="false"
            scriptFormat="juel">
  <script>
    var input = execution.getVariable("inputData");
    var result = input * 2;
    // ✅ Explicit variable assignment
    execution.setVariable("outputData", result);
  </script>
</scriptTask>
```

**Note**: Using JUEL (Java Unified Expression Language) which is natively supported by Flowable. This provides the same explicit variable assignment benefits and works across all JDK versions.

**Anti-Patterns Avoided**:
- ❌ Relying on implicit auto-storing (compatibility issues across JDK versions)
- ❌ Environment-dependent behavior (works in dev, fails in production)

## Project Structure

```
flowable-demo/
├── src/main/java/com/example/flowable/
│   ├── delegates/
│   │   ├── AsyncJoinMarkerDelegate.java      # Async marker for parallel joins
│   │   ├── ParallelTask1Delegate.java        # Parallel branch 1
│   │   ├── ParallelTask2Delegate.java        # Parallel branch 2
│   │   └── TransientVariableDelegate.java     # Transient variable usage
│   ├── examples/
│   │   ├── ParallelJoinAsyncExample.java      # Async join example
│   │   ├── TransientVariablesExample.java     # Transient variables example
│   │   ├── JobExecutorMonitorExample.java     # Job executor monitoring
│   │   └── ExplicitScriptVariablesExample.java # Explicit script variables
│   └── monitoring/
│       └── JobExecutorMonitor.java            # Job queue monitoring
├── src/main/resources/
│   ├── processes/
│   │   ├── parallel-join-async.bpmn20.xml    # Parallel join with async
│   │   ├── transient-variables.bpmn20.xml     # Transient variables process
│   │   └── explicit-script-variables.bpmn20.xml # Explicit script variables
│   ├── flowable.cfg.xml                       # Flowable configuration
│   └── application.properties                # Application properties
└── pom.xml                                    # Maven dependencies
```

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- H2 Database (included, in-memory for demo)

## Dependencies

- `org.flowable:flowable-engine:7.0.0` - Flowable BPMN engine
- `org.flowable:flowable-spring:7.0.0` - Flowable Spring integration
- `com.h2database:h2:2.2.224` - H2 database (for demo)
- `org.slf4j:slf4j-api:2.0.9` - Logging API
- `ch.qos.logback:logback-classic:1.4.11` - Logging implementation
- `org.yaml:snakeyaml:2.2` - SnakeYAML (required by Liquibase)

## Usage Examples

### 1. Parallel Join with Async Continuation

Demonstrates asynchronous continuation before parallel join to prevent optimistic locking:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.flowable.examples.ParallelJoinAsyncExample"
```

**Expected Output**:
- Process instance starts successfully
- Parallel branches execute concurrently
- Async markers prevent optimistic locking exceptions
- Process completes without errors

### 2. Transient Variables Example

Demonstrates transient variable doctrine for temporary data:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.flowable.examples.TransientVariablesExample"
```

**Expected Output**:
- API status code stored as transient variable
- Only essential business data (orderId, customerId) persisted
- Transient variables automatically discarded at wait state

### 3. Job Executor Monitoring

Demonstrates monitoring job queue to detect pool exhaustion:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.flowable.examples.JobExecutorMonitorExample"
```

**Expected Output**:
- Job queue status displayed
- Statistics for total, unlocked, locked, and failed jobs
- Warnings if backlog detected

### 4. Explicit Script Variables

Demonstrates explicit variable assignment in script tasks:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.flowable.examples.ExplicitScriptVariablesExample"
```

**Expected Output**:
- Script task executes with `autoStoreVariables="false"`
- Variables explicitly set using `execution.setVariable()`
- Consistent behavior regardless of JDK version

## Best Practices Checklist

### Asynchronous Continuation

- ✅ Service Task with `flowable:async="true"` before each parallel branch joins
- ✅ Simple logging delegate as async marker
- ✅ Join operation delegated to Job Executor
- ✅ Prevents optimistic locking exceptions

### Transient Variables

- ✅ Use `execution.setTransientVariable()` for temporary data
- ✅ Persist only audit-critical business data
- ✅ Transient variables automatically discarded at wait state
- ✅ Store document references, not binary data

### Job Executor Configuration

- ✅ Monitor `act_ru_job` table regularly
- ✅ Size pool based on workload
- ✅ Configure core pool size, max pool size, queue capacity
- ✅ Alert when backlog exceeds threshold

### Script Tasks

- ✅ Always set `flowable:autoStoreVariables="false"`
- ✅ Use explicit `execution.setVariable()` calls
- ✅ Use JUEL script format (natively supported by Flowable)
- ✅ Guarantees consistent behavior across environments
- ✅ Avoids JDK version compatibility issues

## Anti-Patterns to Avoid

See the comprehensive [Anti-Patterns section](../agent-framework/agents/agent-skills/skills-hms/implementing-flowable-orchestration/SKILL.md#anti-patterns-to-avoid) in the skill document:

1. **Synchronous Parallel Gateway Joins**: Causes `FlowableOptimisticLockingException` under load
2. **Data Hoarding / Variable Bloat**: Slow commits, large `ACT_RU_VARIABLE` table
3. **Job Executor Pool Exhaustion**: Increasing task delays, tasks appear stuck
4. **Implicit Script Variable Assignment**: Unpredictable state, environment-dependent behavior

## Monitoring

### Key Metrics to Monitor

- **Job Queue**: Total jobs, unlocked jobs, locked jobs, failed jobs
- **Process Instances**: Active instances, completed instances, failed instances
- **Variables**: Persistent variable count, transient variable usage
- **Performance**: Process execution time, job processing time

### Job Executor Monitoring

Use `JobExecutorMonitor` to track job queue status:

```java
JobExecutorMonitor monitor = new JobExecutorMonitor(processEngine);
monitor.monitorJobQueue();

JobExecutorMonitor.JobStatistics stats = monitor.getJobStatistics();
if (stats.getUnlockedJobs() > 50) {
    // Alert: Consider increasing pool size
}
```

## Configuration

### Job Executor Pool Sizing

Adjust pool size based on workload:

```properties
# For light workload
flowable.async-executor-core-pool-size=5
flowable.async-executor-max-pool-size=10

# For medium workload
flowable.async-executor-core-pool-size=10
flowable.async-executor-max-pool-size=20

# For heavy workload
flowable.async-executor-core-pool-size=20
flowable.async-executor-max-pool-size=40
```

### Database Configuration

For production, use a proper database (PostgreSQL, MySQL, etc.):

```properties
flowable.jdbc-url=jdbc:postgresql://localhost:5432/flowable
flowable.jdbc-driver=org.postgresql.Driver
flowable.jdbc-username=flowable
flowable.jdbc-password=flowable
```

## Related Resources

- [Flowable 2025.1 Documentation](https://www.flowable.com/open-source/docs/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [Implementing Flowable Orchestration Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-flowable-orchestration/SKILL.md)

## Notes

- **Asynchronous Continuation**: Industry-standard workaround for optimistic locking at parallel joins. Slight latency increase, but eliminates failures.
- **Transient Variables**: Automatically discarded at next wait state (User Task, Receive Task, async boundary). Use for temporary data only.
- **Job Executor Pool**: Size based on peak workload. Monitor `act_ru_job` table for early warning signs of exhaustion.
- **Explicit Variable Assignment**: Guarantees consistent behavior regardless of JDK version or scripting engine internal mechanisms.
- **Script Format**: Using JUEL (Java Unified Expression Language) which is natively supported by Flowable and works across all JDK versions. This provides the same explicit variable assignment benefits.

