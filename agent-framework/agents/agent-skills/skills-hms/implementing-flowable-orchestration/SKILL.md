---
name: implementing-flowable-orchestration
description: Implements Flowable 2025.1 Intelligent Orchestration by applying proven patterns (Saga Orchestration for microservices consistency, External Agent Bridge for AI integration, External Worker for long-running tasks, Event Registry for EDA), following best practices (Transient Variable Doctrine, History/Runtime separation, thread-safe delegates, secure configuration), implementing workarounds (asynchronous continuation for parallel joins, Job Executor pool sizing, process versioning with migration tools), and avoiding anti-patterns (synchronous parallel gateway joins causing optimistic locking, data hoarding with persistent variables, Job Executor pool exhaustion, implicit script variable assignment). Use when implementing BPMN/CMMN/DMN processes, integrating with microservices, orchestrating AI agents, setting up event-driven architectures, or managing long-running workflows.
version: 1.0.0
dependencies:
  - org.flowable:flowable-engine>=7.0.0
---

# Implementing Flowable Orchestration

## Overview

Implements Flowable 2025.1 Intelligent Orchestration for unified process and case management. Flowable provides unified modeling across BPMN (structured processes), CMMN (adaptive case management), and DMN (decision rules) within a single platform. The engine's stateless architecture enables horizontal scalability through multi-node deployment. Flowable AI Studio integrates specialized AI agents (Orchestrator, External, Document, Utility) with RAG support for domain-specific knowledge. This skill provides procedural knowledge for implementing production-ready orchestration following proven patterns, best practices, workarounds, and anti-pattern avoidance.

## When to Use

Use this skill when:
- Implementing BPMN/CMMN/DMN processes for business automation
- Integrating with microservices using Saga orchestration patterns
- Orchestrating AI agents from third-party platforms (Azure AI Foundry, AWS Bedrock, Salesforce Agentforce)
- Setting up event-driven architectures with JMS/Kafka integration
- Managing long-running workflows requiring compensation and error handling
- Building adaptive case management systems with human-in-the-loop workflows

**Input format**: Flowable 2025.1+ deployment, database access, process/case model requirements, integration endpoints
**Expected output**: Production-ready Flowable implementation following enterprise patterns, best practices applied, workarounds documented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Flowable 2025.1+ engine deployed (BPMN, CMMN, DMN engines)
- Database access with DDL privileges for Flowable schema
- Understanding of BPMN 2.0, CMMN 1.1, DMN 1.3 standards
- Java runtime environment (JDK 11+) for delegate implementations
- Access to external systems (microservices, AI platforms, messaging infrastructure)

## Execution Steps

### Step 1: Saga Orchestration Pattern

Implement Flowable as Saga Orchestrator for maintaining data consistency across microservices in distributed transactions.

**Pattern**: Flowable process instance acts as dedicated Saga Orchestrator, dictating sequence, sending commands via Service Tasks, and handling replies. Centralized control preferred over Choreography for complex, long-running workflows.

**Template**: See `templates/saga-orchestration.template`

**Implementation**:
1. Model Service Tasks connecting to microservices (payment, inventory, shipping)
2. Attach Boundary Error Event to each Service Task requiring compensation
3. Model compensation sequence flow with compensating Service Tasks
4. Use HistoryService for Saga Log (tracks status via HistoricActivityInstances)

**Best Practice**: Every Service Task modifying state must have explicit compensation mechanism. Boundary Error Event captures failures and initiates rollback sequence. Compensation flows must be idempotent and reversible.

**Anti-Pattern**: ❌ Missing compensation handlers (cannot rollback on failure). ❌ No error boundaries (failures propagate without recovery). ❌ Relying on undo scripts instead of modeled compensation.

### Step 2: External Agent Bridge Pattern

Integrate third-party AI platforms through External Agent interface, maintaining Flowable as authoritative workflow controller.

**Pattern**: External Agent acts as AI Service Bus, delegating specialized cognitive work (risk assessment, document classification) to best-of-breed platforms while Flowable maintains centralized control and accountability.

**Template**: See `templates/external-agent-bridge.template`

**Implementation**:
1. Configure External Agent in Flowable Control/Design
2. Define connection to third-party AI platform (Azure AI Foundry, AWS Bedrock, Salesforce Agentforce)
3. Model Service Task invoking External Agent
4. Map AI platform response to process variables

**Best Practice**: Centralize automation control in Flowable, delegate cognitive analysis to external platforms. Use External Agent interface instead of direct API calls to prevent AI capability silos.

**Anti-Pattern**: ❌ Direct API calls to AI platforms (bypasses External Agent, creates silos). ❌ Scattered AI capabilities without coordination (manual handoffs, data copying).

### Step 3: Transient Variable Doctrine

Apply Transient Variable Doctrine to prevent data hoarding and maintain database performance.

**Pattern**: Use transient variables (`execution.setTransientVariable()`) for temporary data required only within tight sequence of steps. Persist only audit-critical business data as process variables.

**Template**: See `templates/transient-variable-delegate.template`

**Implementation**:
1. Identify temporary data (API response status codes, intermediate calculations)
2. Set as transient: `execution.setTransientVariable("status", 200)`
3. Use transient in immediate conditional routing: `${status == 200}`
4. Persist only essential business data: `execution.setVariable("orderId", orderId)`

**Best Practice**: Transient variables automatically discarded at next wait state (User Task, Receive Task, async boundary). For large documents, store only reference (document ID) as process variable, use Content Item Types for structured handling.

**Anti-Pattern**: ❌ Storing large JSON API responses as persistent variables (bloats ACT_RU_VARIABLE table). ❌ Storing binary documents as process variables (causes database lock contention). ❌ Persisting intermediate status codes (unnecessary history bloat).

### Step 4: Asynchronous Continuation Workaround

Prevent optimistic locking exceptions at parallel join gateways using asynchronous continuation.

**Pattern**: Introduce asynchronous continuation immediately before join gateway to delegate join operation to Job Executor, processing in new distinct transaction.

**Template**: See `templates/async-join-marker.template`

**Implementation**:
1. Identify parallel gateway join point
2. Add Service Task immediately before join with `flowable:async="true"`
3. Use simple logging delegate (e.g., `AsyncLoggerDelegate`)
4. Connect async marker to join gateway

**Best Practice**: Asynchronous continuation separates join operation from parallel branch execution, significantly reducing transaction collision likelihood. This is industry-standard workaround for optimistic locking at joins.

**Anti-Pattern**: ❌ Synchronous parallel gateway joins (concurrent transactions update same execution record, causing FlowableOptimisticLockingException). ❌ Ignoring process stalls under load (symptom of optimistic locking conflicts).

### Step 5: Event Registry for EDA

Integrate Flowable with Event-Driven Architecture using Event Registry for native messaging infrastructure participation.

**Pattern**: Event Registry enables Flowable to interface directly with external messaging infrastructure (JMS queues, Kafka topics) through Event and Channel definitions.

**Template**: See `templates/event-registry-channel.template`

**Implementation**:
1. Define Event definition (event type, payload structure)
2. Define Channel definition (JMS queue or Kafka topic, serializer type)
3. Configure Start Event to listen for event type (process initiation)
4. Configure Boundary Event for in-flight correlation (trigger running process instance)

**Best Practice**: Use process initiation pattern for new instances, in-flight correlation for updating running instances. Correlation mechanism matches event payload to process variables (process instance context).

**Anti-Pattern**: ❌ Polling external systems instead of event-driven integration (inefficient, introduces latency). ❌ Missing correlation mechanism (events cannot match to process instances).

### Step 6: Job Executor Configuration

Configure Job Executor pool sizing to prevent throughput degradation from asynchronous task backlogs.

**Pattern**: Monitor `act_ru_job` table for queued jobs, size Job Executor thread pool based on workload to prevent resource starvation.

**Configuration Template**:
```properties
# application.properties
flowable.async-executor-activate=true
flowable.async-executor-core-pool-size=10
flowable.async-executor-max-pool-size=20
flowable.async-executor-queue-capacity=100
flowable.async-executor-keep-alive=60
```

**Best Practice**: Monitor `act_ru_job` table for job backlogs. Size pool to handle peak workload. Increase thread count if tasks experience increasing delays. Configure lock time parameters appropriately.

**Anti-Pattern**: ❌ Insufficient Job Executor pool size (tasks appear stuck, exponentially increasing delays). ❌ Not monitoring `act_ru_job` table (missing early warning signs of exhaustion).

### Step 7: Script Task Best Practices

Enforce explicit variable assignment in Script Tasks to prevent unpredictable behavior across environments.

**Pattern**: Configure `flowable:autoStoreVariables="false"` and mandate explicit `execution.setVariable()` calls for consistent behavior.

**BPMN XML Template**:
```xml
<scriptTask id="processData" 
            name="Process Data"
            flowable:autoStoreVariables="false"
            scriptFormat="javascript">
  <script>
    var input = execution.getVariable("inputData");
    var result = process(input);
    execution.setVariable("outputData", result);
  </script>
</scriptTask>
```

**Best Practice**: Always set `flowable:autoStoreVariables="false"` and use explicit `execution.setVariable()` calls. This guarantees consistent behavior regardless of JDK version or scripting engine internal mechanisms.

**Anti-Pattern**: ❌ Relying on implicit auto-storing (compatibility issues across JDK versions, unpredictable variable assignment). ❌ Environment-dependent behavior (works in dev, fails in production).

### Step 8: Secure Configuration

Use Secret Values in Flowable Control/Design for externalized credential management.

**Pattern**: Define Secret Values centrally in Flowable Control/Design, reference secrets in Service Model configurations (OAuth clients, standard credentials).

**Best Practice**: Never embed credentials or connection strings directly in BPMN XML models. Use centralized Secret Values for authentication configuration. Externalize all sensitive data from deployment artifacts.

**Anti-Pattern**: ❌ Hardcoded credentials in BPMN XML (security risk, credential exposure). ❌ Connection strings in process models (maintenance burden, security vulnerability).

## Anti-Patterns to Avoid

### 1. Synchronous Parallel Gateway Joins

**Symptom**: Frequent `FlowableOptimisticLockingException`, unpredictable process stalls under load

**Root Cause**: Multiple parallel execution branches complete simultaneously, attempting to update same process instance execution record. Concurrent database transactions collide due to optimistic locking.

**Mitigation**: Introduce asynchronous continuation (`flowable:async="true"`) immediately before join gateway. Join operation delegated to Job Executor, processed in new distinct transaction, reducing collision likelihood.

### 2. Data Hoarding / Variable Bloat

**Symptom**: Slow transaction commits, large `ACT_RU_VARIABLE` table, inefficient history queries, prolonged database lock times

**Root Cause**: Storing large, non-essential data payloads (full JSON API responses, large lists, binary documents) as persistent process variables. Treating process variables like general application memory.

**Mitigation**: Apply Transient Variable Doctrine. Use `execution.setTransientVariable()` for temporary data (API responses, status codes). Persist only audit-critical business data. For large documents, store only reference (document ID).

### 3. Job Executor Pool Exhaustion

**Symptom**: Asynchronous tasks experience exponentially increasing delays (1-2 seconds initially, up to 7-10 minutes), tasks appear "stuck", low CPU/memory utilization

**Root Cause**: Job Executor thread pool is too small to handle queued jobs in `act_ru_job` table. Shortage of free (unlocked) jobs available to execute waiting tasks.

**Mitigation**: Monitor `act_ru_job` table for backlogs. Increase Job Executor pool configuration (thread count, lock time parameters). Size pool to handle peak workload.

### 4. Implicit Script Variable Assignment

**Symptom**: Unpredictable process state, difficulty debugging, environment-dependent behavior, state corruption

**Root Cause**: Relying on implicit auto-storing functionality in Script Tasks (`flowable:autoStoreVariables` default behavior). Compatibility issues across different JDK versions and scripting languages.

**Mitigation**: Explicitly configure `flowable:autoStoreVariables="false"` and use mandatory `execution.setVariable()` calls. Guarantees consistent behavior regardless of underlying scripting engine.

## Best Practices

### 1. Transient Variable Doctrine

Use transient variables for all intermediate data, status codes, and API responses required only within tight sequence of steps. Transient variables automatically discarded at next wait state. Only persist audit-critical variables required for human interaction or long-term auditing.

### 2. History/Runtime Separation

For analytical or audit purposes concerning in-flight processes, utilize HistoryService queries (`createHistoricProcessInstanceQuery()`) instead of runtime execution tables. Direct heavy query loads to historical tables (`ACT_HI_*`) to preserve transactional performance of live runtime engine (`ACT_RU_*`).

### 3. Thread-Safe Delegates

Java Delegates used as ExecutionListener or TaskListener must be thread-safe. Due to historical architectural characteristics, DelegateHelper cannot always be used. Recommended approach: use simple expression language resolution (`delegateExpression`) or ensure implementation is stateless, or instantiate fresh delegate instance every time expression is resolved.

### 4. Secure Configuration

Never embed credentials or sensitive connection strings directly within BPMN XML models. Use dedicated Secret Values feature in Flowable Control/Design for centralized credential management. Externalize all sensitive data from deployment artifacts.

## Workarounds

### 1. Asynchronous Continuation for Parallel Joins

**When**: Parallel gateway joins experience optimistic locking exceptions under load

**Implementation**: Add Service Task with `flowable:async="true"` immediately before join gateway. Use simple logging delegate. This delegates join operation to Job Executor, processing in new distinct transaction.

**Trade-off**: Slight latency increase, but eliminates optimistic locking failures. Industry-standard workaround.

### 2. Job Executor Pool Sizing

**When**: Asynchronous tasks experience increasing delays, `act_ru_job` table shows backlog

**Implementation**: Monitor `act_ru_job` table for queued jobs. Increase `flowable.async-executor-core-pool-size` and `flowable.async-executor-max-pool-size` configuration properties. Size based on peak workload.

**Trade-off**: Increased resource consumption, but restores throughput and prevents process execution stalls.

### 3. Process Versioning with Migration Tools

**When**: Managing upgrades for complex, long-running case and process instances

**Implementation**: Utilize visual migration tools within Flowable Control. These features provide control and options necessary to manage in-flight upgrades with minimal disruption and lower downtime.

**Trade-off**: Requires planning and coordination, but prevents data inconsistencies and process disruption.

## Examples

### Example 1: E-Commerce Order Processing Saga

**Scenario**: Order processing workflow coordinating payment, inventory, and shipping microservices with compensation on failure.

**Pattern Applied**: Saga Orchestration with explicit compensation flows

**BPMN Structure**:
```xml
<process id="orderProcessingSaga">
  <startEvent id="start"/>
  
  <!-- Payment Service Task -->
  <serviceTask id="processPayment" 
               name="Process Payment"
               flowable:class="com.example.PaymentServiceDelegate"/>
  <boundaryEvent id="paymentError" attachedToRef="processPayment">
    <errorEventDefinition errorRef="paymentFailed"/>
  </boundaryEvent>
  
  <!-- Inventory Service Task -->
  <serviceTask id="reserveInventory" 
               name="Reserve Inventory"
               flowable:class="com.example.InventoryServiceDelegate"/>
  <boundaryEvent id="inventoryError" attachedToRef="reserveInventory">
    <errorEventDefinition errorRef="inventoryFailed"/>
  </boundaryEvent>
  
  <!-- Compensation Flow -->
  <serviceTask id="compensatePayment" 
               name="Refund Payment"
               flowable:isForCompensation="true"
               flowable:class="com.example.RefundPaymentDelegate"/>
  
  <endEvent id="end"/>
</process>
```

**Key Points**: Each Service Task has Boundary Error Event. Compensation handler (`compensatePayment`) marked with `flowable:isForCompensation="true"`. On payment failure, compensation automatically triggered to refund.

### Example 2: Document Classification with External AI Agent

**Scenario**: Document classification workflow using Azure AI Foundry via External Agent for intelligent content analysis.

**Pattern Applied**: External Agent Bridge for AI integration

**External Agent Configuration**:
```json
{
  "agentType": "external",
  "name": "AzureAIClassifier",
  "platform": "azure-ai-foundry",
  "endpoint": "${AZURE_AI_ENDPOINT}",
  "authentication": {
    "type": "oauth2",
    "clientId": "${SECRET:azure-ai-client-id}",
    "clientSecret": "${SECRET:azure-ai-client-secret}"
  }
}
```

**BPMN Service Task Integration**:
```xml
<serviceTask id="classifyDocument" 
             name="Classify Document"
             flowable:type="external-agent"
             flowable:agentRef="AzureAIClassifier">
  <extensionElements>
    <flowable:field name="documentId">
      <flowable:expression>${documentId}</flowable:expression>
    </flowable:field>
  </extensionElements>
</serviceTask>
```

**Key Points**: External Agent configured in Flowable Control with OAuth credentials from Secret Values. Service Task references agent, passes document ID. AI platform response mapped to process variables for downstream routing.

## Related Resources

For extensive reference materials, see:
- Flowable 2025.1 Documentation: Process and Case Management
- BPMN 2.0 Specification
- CMMN 1.1 Specification
- DMN 1.3 Specification

## Notes

- Flowable engines are stateless by design, enabling horizontal scalability through multi-node deployment
- AI Studio capabilities require Flowable 2025.1+ with AI Studio license
- External Agent integration supports major AI platforms: Azure AI Foundry, AWS Bedrock, Salesforce Agentforce
- Event Registry supports JMS and Kafka messaging infrastructure
- Process versioning tools available in Flowable Control for managing in-flight upgrades

