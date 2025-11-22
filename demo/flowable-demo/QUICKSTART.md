# Flowable Demo Quick Start

Quick start guide for running Flowable best practices examples.

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher

## Quick Start

### 1. Build the Project

```bash
cd flowable-demo
mvn clean compile
```

### 2. Run Examples

#### Asynchronous Continuation for Parallel Joins

```bash
mvn exec:java -Dexec.mainClass="com.example.flowable.examples.ParallelJoinAsyncExample"
```

**What it demonstrates:**
- Async markers before parallel join gateways
- Prevents `FlowableOptimisticLockingException`
- Industry-standard workaround for concurrent transactions

#### Transient Variable Doctrine

```bash
mvn exec:java -Dexec.mainClass="com.example.flowable.examples.TransientVariablesExample"
```

**What it demonstrates:**
- Using transient variables for temporary data
- Persisting only audit-critical business data
- Automatic garbage collection at wait states

#### Job Executor Monitoring

```bash
mvn exec:java -Dexec.mainClass="com.example.flowable.examples.JobExecutorMonitorExample"
```

**What it demonstrates:**
- Monitoring `act_ru_job` table for backlogs
- Detecting Job Executor pool exhaustion early
- Proper pool sizing configuration

#### Explicit Script Variable Assignment

```bash
mvn exec:java -Dexec.mainClass="com.example.flowable.examples.ExplicitScriptVariablesExample"
```

**What it demonstrates:**
- Using `flowable:autoStoreVariables="false"`
- Explicit `execution.setVariable()` calls
- Consistent behavior across JDK versions

## Expected Output

All examples should:
- ✅ Start process instances successfully
- ✅ Execute without errors
- ✅ Demonstrate best practices in action
- ✅ Show proper variable handling
- ✅ Complete without exceptions

## Troubleshooting

### Process Engine Not Starting

- Check Java version: `java -version` (should be 21+)
- Verify Maven: `mvn -version`
- Check H2 database dependency in `pom.xml`

### Process Not Completing

- Wait longer for async jobs (increase sleep time in examples)
- Check Job Executor configuration
- Monitor job queue using `JobExecutorMonitor`

### Variable Issues

- Verify transient variables are used for temporary data
- Check that persistent variables contain only audit-critical data
- Ensure script tasks use explicit variable assignment

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review BPMN process definitions in `src/main/resources/processes/`
- Examine Java delegates in `src/main/java/com/example/flowable/delegates/`
- Study monitoring patterns in `src/main/java/com/example/flowable/monitoring/`

## Related Documentation

- [Flowable Orchestration Skill](../agent-framework/agents/agent-skills/skills-hms/implementing-flowable-orchestration/SKILL.md)
- [Flowable Official Documentation](https://www.flowable.com/open-source/docs/)

