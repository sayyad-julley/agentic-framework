# Polyglot Context Propagation Guide

This document describes how to implement context propagation in non-Java services (Python, Node.js) to maintain compatibility with the HMS platform's context protocol.

## Context Protocol (Wire Format)

All services must honor these standard HTTP/Kafka headers:

- **`x-hms-trace-id`**: Correlation ID for observability (required)
- **`x-hms-tenant-id`**: Tenant context (required for multi-tenancy)
- **`x-hms-user-id`**: User identity (optional, for audit)
- **`x-hms-org-id`**: Organization context (optional)
- **`Authorization`**: Bearer JWT token (existing, for authentication)

### Header Rules

1. **Ingress (Reading)**: Every service must read these headers on incoming requests
2. **Egress (Writing)**: Every service must write these headers on outgoing requests
3. **Trace ID**: If not present, generate a new UUID
4. **Propagation**: Always forward existing headers to downstream services

### ⚠️ CRITICAL: Header Case Sensitivity

**HTTP vs Kafka Header Case Handling:**

- **HTTP Headers**: Case-insensitive (RFC 7230). `X-Hms-Tenant-Id` == `x-hms-tenant-id` == `X-HMS-TENANT-ID`
- **Kafka Headers**: **Case-sensitive**. `x-hms-tenant-id` ≠ `X-Hms-Tenant-Id` ≠ `X-HMS-TENANT-ID`

**Standard:** Always use **lowercase** `x-hms-*` headers everywhere for maximum compatibility.

- When writing to **Kafka**, always use lowercase: `x-hms-tenant-id`
- When reading from **HTTP**, accept any case but prefer lowercase
- When writing to **HTTP**, use lowercase for consistency

**Why this matters:** If a Python service reads HTTP headers (which may be auto-lowercased by the framework) and forwards them to Kafka as lowercase, but your Java consumer expects `X-Hms-Tenant-Id`, the context will be lost.

---

## Python (FastAPI) Implementation

### Requirements

```bash
pip install fastapi uvicorn contextvars
```

### Middleware Implementation

Create `hms_middleware.py`:

```python
from fastapi import Request
from contextvars import ContextVar
import uuid
import logging

# Define Python Context Vars (Thread-Safe for async)
tenant_id_ctx = ContextVar("tenant_id", default=None)
user_id_ctx = ContextVar("user_id", default=None)
org_id_ctx = ContextVar("org_id", default=None)
trace_id_ctx = ContextVar("trace_id", default=None)

# Configure logging to include context
logger = logging.getLogger(__name__)

async def hms_context_middleware(request: Request, call_next):
    """
    FastAPI middleware that extracts context from headers and sets it in ContextVars.
    Also propagates context in response headers.
    """
    # 1. Ingress: Read Headers (HTTP is case-insensitive, but use lowercase for consistency)
    tenant_id = request.headers.get("x-hms-tenant-id") or request.headers.get("X-Hms-Tenant-Id")
    user_id = request.headers.get("x-hms-user-id") or request.headers.get("X-Hms-User-Id")
    org_id = request.headers.get("x-hms-org-id") or request.headers.get("X-Hms-Org-Id")
    trace_id = request.headers.get("x-hms-trace-id") or request.headers.get("X-Hms-Trace-Id") or request.headers.get("X-Trace-Id")
    
    # Generate trace ID if not present
    if not trace_id:
        trace_id = str(uuid.uuid4())
    
    # 2. Set Context Variables (available in async context)
    tenant_id_ctx.set(tenant_id)
    user_id_ctx.set(user_id)
    org_id_ctx.set(org_id)
    trace_id_ctx.set(trace_id)
    
    # 3. Add to logging context
    logging_context = {
        "traceId": trace_id,
        "tenantId": tenant_id,
        "userId": user_id,
        "orgId": org_id
    }
    
    # 4. Process Request
    response = await call_next(request)
    
    # 5. Egress: Write Headers (for downstream services)
    # Use lowercase for consistency (HTTP is case-insensitive, but lowercase is standard)
    response.headers["x-hms-trace-id"] = trace_id
    if tenant_id:
        response.headers["x-hms-tenant-id"] = tenant_id
    if user_id:
        response.headers["x-hms-user-id"] = user_id
    if org_id:
        response.headers["x-hms-org-id"] = org_id
    
    return response

# Helper function to get current context
def get_current_tenant_id():
    """Get the current tenant ID from context."""
    return tenant_id_ctx.get()

def get_current_user_id():
    """Get the current user ID from context."""
    return user_id_ctx.get()

def get_current_trace_id():
    """Get the current trace ID from context."""
    return trace_id_ctx.get()
```

### Usage in FastAPI App

```python
from fastapi import FastAPI
from hms_middleware import hms_context_middleware, get_current_tenant_id

app = FastAPI()

# Add middleware
app.middleware("http")(hms_context_middleware)

@app.get("/api/data")
async def get_data():
    # Access context in your route handlers
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    
    # Your business logic here
    return {"tenantId": tenant_id, "data": "..."}
```

### Making Outgoing HTTP Requests

When calling other services, propagate context:

```python
import httpx
from hms_middleware import get_current_tenant_id, get_current_user_id, get_current_trace_id

async def call_downstream_service():
    headers = {
        "x-hms-trace-id": get_current_trace_id(),
        "x-hms-tenant-id": get_current_tenant_id(),
        "x-hms-user-id": get_current_user_id(),
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://other-service/api/data",
            headers=headers
        )
        return response.json()
```

### Kafka Producer (Python)

When producing Kafka messages, inject context into headers:

```python
from kafka import KafkaProducer
from hms_middleware import get_current_tenant_id, get_current_user_id, get_current_trace_id
import json

producer = KafkaProducer(
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def send_message(topic, message):
    # CRITICAL: Use lowercase for Kafka headers (case-sensitive)
    headers = [
        ("x-hms-tenant-id", get_current_tenant_id().encode('utf-8')),
        ("x-hms-user-id", get_current_user_id().encode('utf-8')),
        ("x-hms-trace-id", get_current_trace_id().encode('utf-8')),
    ]
    
    producer.send(topic, message, headers=headers)
    producer.flush()
```

### Kafka Consumer (Python)

When consuming Kafka messages, extract context from headers:

```python
from kafka import KafkaConsumer
from hms_middleware import tenant_id_ctx, user_id_ctx, trace_id_ctx
import json

consumer = KafkaConsumer(
    'my-topic',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    # Extract context from Kafka headers
    # CRITICAL: Kafka headers are case-sensitive, use lowercase
    headers = dict(message.headers)
    
    tenant_id = headers.get(b'x-hms-tenant-id', [None])[0]
    if tenant_id:
        tenant_id_ctx.set(tenant_id.decode('utf-8'))
    
    user_id = headers.get(b'x-hms-user-id', [None])[0]
    if user_id:
        user_id_ctx.set(user_id.decode('utf-8'))
    
    trace_id = headers.get(b'x-hms-trace-id', [None])[0]
    if trace_id:
        trace_id_ctx.set(trace_id.decode('utf-8'))
    
    # Process message with context available
    process_message(message.value)
```

---

## Node.js (Express) Implementation

### Requirements

```bash
npm install express uuid
```

### Middleware Implementation

Create `hms-middleware.js`:

```javascript
const { v4: uuidv4 } = require('uuid');

// Context storage using AsyncLocalStorage (Node.js 13.10+)
const { AsyncLocalStorage } = require('async_hooks');
const contextStorage = new AsyncLocalStorage();

/**
 * Express middleware that extracts context from headers and stores it in AsyncLocalStorage.
 */
function hmsContextMiddleware(req, res, next) {
    // 1. Ingress: Read Headers
    // HTTP headers are case-insensitive, but Express lowercases them automatically
    // Check both lowercase and original case for compatibility
    const tenantId = req.headers['x-hms-tenant-id'] || req.headers['X-Hms-Tenant-Id'];
    const userId = req.headers['x-hms-user-id'] || req.headers['X-Hms-User-Id'];
    const orgId = req.headers['x-hms-org-id'] || req.headers['X-Hms-Org-Id'];
    let traceId = req.headers['x-hms-trace-id'] || req.headers['X-Hms-Trace-Id'] || req.headers['x-trace-id'] || req.headers['X-Trace-Id'];
    
    // Generate trace ID if not present
    if (!traceId) {
        traceId = uuidv4();
    }
    
    // 2. Store context in AsyncLocalStorage
    const context = {
        tenantId,
        userId,
        orgId,
        traceId
    };
    
    // 3. Run request handler with context
    contextStorage.run(context, () => {
        // 4. Egress: Write Headers in response
        // Use lowercase for consistency (HTTP is case-insensitive, but lowercase is standard)
        res.setHeader('x-hms-trace-id', traceId);
        if (tenantId) {
            res.setHeader('x-hms-tenant-id', tenantId);
        }
        if (userId) {
            res.setHeader('x-hms-user-id', userId);
        }
        if (orgId) {
            res.setHeader('x-hms-org-id', orgId);
        }
        
        next();
    });
}

// Helper functions to get current context
function getCurrentTenantId() {
    const context = contextStorage.getStore();
    return context?.tenantId;
}

function getCurrentUserId() {
    const context = contextStorage.getStore();
    return context?.userId;
}

function getCurrentTraceId() {
    const context = contextStorage.getStore();
    return context?.traceId;
}

module.exports = {
    hmsContextMiddleware,
    getCurrentTenantId,
    getCurrentUserId,
    getCurrentTraceId,
    contextStorage
};
```

### Usage in Express App

```javascript
const express = require('express');
const { hmsContextMiddleware, getCurrentTenantId } = require('./hms-middleware');

const app = express();

// Add middleware (must be early in the middleware chain)
app.use(hmsContextMiddleware);

app.get('/api/data', (req, res) => {
    // Access context in your route handlers
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
        return res.status(400).json({ error: 'Missing tenant context' });
    }
    
    // Your business logic here
    res.json({ tenantId, data: '...' });
});

app.listen(3000);
```

### Making Outgoing HTTP Requests

When calling other services, propagate context:

```javascript
const axios = require('axios');
const { getCurrentTenantId, getCurrentUserId, getCurrentTraceId } = require('./hms-middleware');

async function callDownstreamService() {
    const headers = {
        'x-hms-trace-id': getCurrentTraceId(),
        'x-hms-tenant-id': getCurrentTenantId(),
        'x-hms-user-id': getCurrentUserId(),
    };
    
    const response = await axios.get('http://other-service/api/data', { headers });
    return response.data;
}
```

### Kafka Producer (Node.js)

When producing Kafka messages, inject context into headers:

```javascript
const { Kafka } = require('kafkajs');
const { getCurrentTenantId, getCurrentUserId, getCurrentTraceId } = require('./hms-middleware');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function sendMessage(topic, message) {
    await producer.connect();
    
    // CRITICAL: Use lowercase for Kafka headers (case-sensitive)
    const headers = {
        'x-hms-tenant-id': getCurrentTenantId(),
        'x-hms-user-id': getCurrentUserId(),
        'x-hms-trace-id': getCurrentTraceId(),
    };
    
    await producer.send({
        topic,
        messages: [{
            value: JSON.stringify(message),
            headers: headers
        }]
    });
    
    await producer.disconnect();
}
```

### Kafka Consumer (Node.js)

When consuming Kafka messages, extract context from headers:

```javascript
const { Kafka } = require('kafkajs');
const { contextStorage } = require('./hms-middleware');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'my-group' });

async function consumeMessages() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'my-topic' });
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            // Extract context from Kafka headers
            // CRITICAL: Kafka headers are case-sensitive, use lowercase
            const headers = message.headers;
            const context = {
                tenantId: headers['x-hms-tenant-id']?.toString(),
                userId: headers['x-hms-user-id']?.toString(),
                orgId: headers['x-hms-org-id']?.toString(),
                traceId: headers['x-hms-trace-id']?.toString(),
            };
            
            // Process message with context available
            contextStorage.run(context, () => {
                const value = JSON.parse(message.value.toString());
                processMessage(value);
            });
        }
    });
}
```

---

## Integration Checklist

For each service (regardless of language), ensure:

- [ ] **Ingress**: Read `X-Hms-*` headers from incoming HTTP requests
- [ ] **Context Storage**: Store context in language-appropriate mechanism (ContextVar, AsyncLocalStorage, etc.)
- [ ] **Egress**: Write `X-Hms-*` headers to outgoing HTTP requests
- [ ] **Kafka Producer**: Inject context into Kafka message headers
- [ ] **Kafka Consumer**: Extract context from Kafka message headers
- [ ] **Logging**: Include trace ID in all log statements
- [ ] **Error Handling**: Preserve context in error responses

---

## Testing Context Propagation

### Test Scenario

1. **HTTP Request** → Java Service (sets context from JWT)
2. **Async Method** → Java Service (context survives via TaskDecorator)
3. **Kafka Message** → Java Service (context in headers)
4. **Kafka Consumer** → Python Service (extracts context from headers)
5. **HTTP Request** → Python Service (propagates context to Node.js)
6. **HTTP Response** → All services include `X-Hms-Trace-Id` in response

### Verification

- Check logs: All services should log the same `traceId`
- Check database: All audit records should have the same `tenantId`
- Check headers: All HTTP responses should include `X-Hms-Trace-Id`

---

## Troubleshooting

### Context is Lost

- **Check middleware order**: Context middleware must be early in the chain
- **Check async boundaries**: Use appropriate context propagation (ContextVar, AsyncLocalStorage)
- **Check headers**: Verify headers are being read/written correctly

### Trace ID Not Propagating

- **Check header names**: Use lowercase `x-hms-trace-id` for Kafka (case-sensitive)
- **Check HTTP vs Kafka**: HTTP accepts any case, but Kafka requires exact match
- **Check response headers**: Ensure middleware writes to response
- **Check Kafka headers**: Verify headers are byte arrays in Kafka and use lowercase keys

### Multi-Tenancy Issues

- **Check tenant resolution**: Verify `X-Hms-Tenant-Id` is present in all requests
- **Check database queries**: Ensure tenant ID is used in WHERE clauses
- **Check logging**: Verify tenant ID is in all log statements

---

## References

- **Java Implementation**: See `hms-common-lib` for reference implementation
- **OpenTelemetry**: Consider integrating with OpenTelemetry for distributed tracing
- **W3C Trace Context**: Future consideration for W3C Trace Context standard

