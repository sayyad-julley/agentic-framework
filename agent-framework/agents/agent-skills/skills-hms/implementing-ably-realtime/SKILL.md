---
name: implementing-ably-realtime
description: Implements Ably realtime messaging by applying proven patterns (Pub/Sub with global elasticity, ephemeral channels, token authentication, automatic reconnection, LiveObjects with CRDTs, presence management), following best practices (singleton SDK instance, History API recovery, exponential backoff, batched webhooks, channel scoping), implementing workarounds (REST batching for ordering, rate limiting, webhook batching), and avoiding anti-patterns (channel proliferation, retry storms, improper instantiation, chatty I/O, basic auth on client-side, ignored state loss). Use when implementing realtime features, building collaborative applications, integrating with backend systems, or handling presence and state synchronization.
version: 1.0.0
dependencies:
  - ably>=2.0.0
---

# Implementing Ably Realtime

## Overview

Implements Ably realtime messaging using globally distributed Pub/Sub patterns designed for reliability and elasticity. Ably provides exactly-once delivery semantics, guaranteed message ordering, and automatic multi-region failover, delegating infrastructure complexity to the service provider. This skill focuses on production-ready patterns, critical anti-patterns, essential best practices, and necessary workarounds for mission-critical deployments.

## When to Use

Use this skill when:
- Implementing realtime features (chat, notifications, live updates)
- Building collaborative applications requiring state synchronization
- Integrating with backend systems via Ably Reactor
- Handling presence and occupancy tracking
- Managing shared state across distributed clients
- Implementing event-driven architectures with global scale requirements

**Input format**: Ably account with API keys, understanding of channel architecture, client-side framework requirements, backend access for token generation (if needed)
**Expected output**: Fully configured Ably implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Ably account with API keys (Admin key for server-side, token generation capability for client-side)
- Understanding of channel-based messaging architecture
- Client-side framework (React, Vue, vanilla JS) or backend requirements
- Access to application backend for token generation service (for client-side authentication)
- Network connectivity for WebSocket connections

## Execution Steps

### Step 1: Core Pub/Sub Pattern

Ably's primary architectural pattern is globally distributed Publish/Subscribe, ensuring predictable latencies and strong data integrity across uncertain operating conditions.

**Pattern**: Global Pub/Sub with channel-based messaging
**Best Practice**: Ephemeral channel usage (no pre-provisioning required)
**Anti-Pattern**: Channel Proliferation (excessive granular channels causing error 90021)

**Channel Publish/Subscribe Template**:
```javascript
import Ably from 'ably';

// Singleton SDK instance (reuse throughout application lifecycle)
const ably = new Ably.Realtime({ authUrl: '/api/ably-token' });

// Channel is ephemeral - exists only when referenced
const channel = ably.channels.get('room:general');

// Subscribe to messages
channel.subscribe((message) => {
  console.log('Received:', message.data);
});

// Publish message
channel.publish('message', { text: 'Hello', user: 'alice' });
```

**Best Practice**: Channels are virtual and ephemeral. No administrative overhead for pre-provisioning. Structure channels around logical groups or high-fan-out events, not per-user or per-session granularity.

### Step 2: Channel Design Strategy

Channels serve as the primary building blocks, separating messages into different topics. Proper scoping is critical for scalability.

**Pattern**: Logical grouping over granular channels
**Best Practice**: Structure channels around high-fan-out events
**Anti-Pattern**: Channel Proliferation leading to error 90021 (Max Channel Creation Rate Exceeded)

**Channel Scoping Template**:
```javascript
// ✅ Good: Logical grouping
const channels = {
  notifications: ably.channels.get('notifications:user_123'),
  chat: ably.channels.get('chat:room_general'),
  liveData: ably.channels.get('live:sports_football')
};

// ❌ Anti-Pattern: Excessive granularity
// Don't create channels like: 'chat:user_123:session_456:message_789'
```

**Best Practice**: Channels should reflect sustainable communication patterns. Use channel parameters or message metadata for fine-grained routing within a channel rather than creating new channels.

### Step 3: Authentication Strategy

Security model rests on rights-based access policies. Token authentication is mandatory for client-side; basic authentication for trusted server-side.

**Pattern**: Token Authentication for client-side (mandatory)
**Pattern**: Basic Authentication for server-side (trusted backend)
**Best Practice**: Short-lived tokens with automatic renewal
**Anti-Pattern**: Basic Auth on Client-Side (Golden Key vulnerability)

**Client-Side Token Authentication Template**:
```javascript
// Frontend: Use token authentication (mandatory)
const ably = new Ably.Realtime({
  authUrl: '/api/ably-token',  // Backend endpoint generates token
  authMethod: 'GET'
});

// Backend: Generate short-lived token
app.get('/api/ably-token', authenticate, (req, res) => {
  const tokenRequest = {
    clientId: req.user.id,
    capability: { 'chat:*': ['subscribe', 'publish'] },
    ttl: 3600000  // 1 hour
  };
  const token = ably.auth.requestToken(tokenRequest);
  res.json(token);
});
```

**Server-Side Basic Authentication Template**:
```javascript
// Backend: Use API key (persistent, low-latency)
const ably = new Ably.Rest({
  key: process.env.ABLY_API_KEY
});

// No token renewal overhead for server-side
```

**Best Practice**: Tokens are short-lived, revocable, and fine-grained. API keys are persistent and suitable for trusted server environments. Never expose API keys to client-side code.

### Step 4: Client Connection Resilience

Client-side resilience is paramount in realtime applications where unreliable network conditions are common. Ably SDKs handle connection lifecycle automatically.

**Pattern**: Automatic reconnection with state retention (2-minute window)
**Best Practice**: Exponential backoff for custom retry logic
**Anti-Pattern**: Retry Storm (errors 42910, 42922)
**Workaround**: History API recovery for suspended state (resumed: false)

**Connection State Management Template**:
```javascript
const ably = new Ably.Realtime({ authUrl: '/api/ably-token' });
const channel = ably.channels.get('chat:room1');

// Monitor connection state
ably.connection.on((stateChange) => {
  if (stateChange.current === 'suspended') {
    // Connection lost for >2 minutes - state is lost
    console.warn('Connection suspended - state lost');
  }
});

// Handle channel attachment with resume flag
channel.on('attached', (stateChange) => {
  if (stateChange.resumed === false) {
    // State continuity lost - recover missing messages
    recoverChannelHistory(channel);
  }
});

// History API recovery workaround
async function recoverChannelHistory(channel) {
  const history = await channel.history({ limit: 100 });
  history.items.forEach(message => {
    // Process missed messages
    handleMessage(message);
  });
}
```

**Best Practice**: Ably retains connection state for 2 minutes. If disconnected longer, implement History API recovery immediately upon reattachment with `resumed: false`. Use exponential backoff for any custom retry logic to prevent retry storms.

### Step 5: LiveObjects & CRDT Pattern

LiveObjects provides high-level pattern for managing shared data with automatic conflict resolution using CRDTs.

**Pattern**: Push Operations (delta updates) over Push State
**Best Practice**: Echo-based consistency (wait for authoritative echo)
**Anti-Pattern**: Monolithic Persistence (using LiveObjects as sole data store)

**LiveObjects Setup Template**:
```javascript
import { Realtime } from 'ably';
import { LiveObject } from '@ably/liveobjects';

const ably = new Realtime({ authUrl: '/api/ably-token' });
const liveObject = new LiveObject('shared:document_123', ably);

// Subscribe to operations (delta updates, not full state)
liveObject.subscribe((operation) => {
  // Apply operation to local object
  liveObject.applyOperation(operation);
});

// Publish operation (not full state)
liveObject.publishOperation({
  type: 'update',
  path: 'title',
  value: 'New Title'
});

// Wait for authoritative echo before applying locally
// LiveObjects handles this automatically
```

**Best Practice**: LiveObjects broadcasts only operations (deltas), not full state. This is bandwidth-efficient. Operations are echoed back from Ably's authoritative state before local application, ensuring consistency. Treat LiveObjects as distributed cache/state store, not primary data store.

### Step 6: Presence Management

Presence allows applications to track which clients or devices are present on a channel in realtime.

**Pattern**: Realtime presence subscriptions for live awareness
**Workaround**: REST API for historical occupancy snapshots

**Presence Management Template**:
```javascript
const channel = ably.channels.get('chat:room1');

// Enter presence set (requires ClientId and presence capability)
channel.presence.enter({ name: 'Alice', status: 'available' });

// Subscribe to presence events
channel.presence.subscribe((presenceMessage) => {
  if (presenceMessage.action === 'enter') {
    console.log(`${presenceMessage.data.name} joined`);
  } else if (presenceMessage.action === 'leave') {
    console.log(`${presenceMessage.data.name} left`);
  }
});

// Update presence
channel.presence.update({ status: 'away' });

// Leave presence set
channel.presence.leave();
```

**REST Workaround for Historical Occupancy**:
```javascript
// Server-side: Get occupancy snapshot without persistent connection
const rest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
const presence = await rest.channels.get('chat:room1').presence.get();
console.log(`Current occupants: ${presence.length}`);
```

**Best Practice**: Use realtime presence for live awareness. Use REST API for one-time occupancy checks or historical snapshots without maintaining persistent connections.

### Step 7: Backend Integration (Reactor)

Ably Reactor enables asynchronous integration between Ably channels and external services.

**Pattern**: Outbound Streaming for data pipelines
**Pattern**: Outbound Webhooks for reactive processing
**Best Practice**: Batched Webhooks (prevents Chatty I/O)
**Anti-Pattern**: Unbatched webhooks causing endpoint overload

**Webhook Batching Configuration Template**:
```javascript
// Ably Dashboard Configuration (or API)
// Webhook Rule Configuration:
{
  "channelFilter": "events:*",
  "ruleType": "http",
  "requestMode": "batch",  // Critical: Use batch mode
  "batch": {
    "maxBatchSize": 100,
    "maxBatchInterval": 1000  // Max once per second
  },
  "targetUrl": "https://api.example.com/webhooks/ably"
}

// Backend endpoint handles batched payload
app.post('/webhooks/ably', (req, res) => {
  // req.body is array of events
  const events = req.body;
  events.forEach(event => {
    processEvent(event);
  });
  res.status(200).send();
});
```

**Outbound Streaming Template** (for Kafka, Kinesis, etc.):
```javascript
// Configured via Ably Dashboard
// Streams constant flows to external services
// Suitable for high-throughput, queueing, or broadcast scenarios
```

**Best Practice**: Always use batched webhooks in high-throughput environments. Single-request mode can overwhelm endpoints and hit concurrency limits. Batching reduces request volume and provides resilience against traffic spikes.

### Step 8: REST Publishing Workarounds

Ably guarantees message ordering for REST API, but high-rate publishing via separate HTTP requests may arrive out of order due to network factors.

**Workaround**: Message batching for strict ordering requirements
**Workaround**: Rate limiting to prevent out-of-order delivery

**REST Batch Publishing Template**:
```javascript
const rest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
const channel = rest.channels.get('events:stream');

// Batch multiple order-dependent messages in single request
async function publishOrderedBatch(messages) {
  // Package sequential messages into single REST request
  const batch = messages.map(msg => ({
    name: msg.name,
    data: msg.data
  }));
  
  // Single request ensures ordering within batch
  await channel.publish(batch);
}

// Application-level rate limiting
let lastPublishTime = 0;
const MIN_INTERVAL = 100; // 100ms between publishes

async function rateLimitedPublish(channel, message) {
  const now = Date.now();
  const elapsed = now - lastPublishTime;
  
  if (elapsed < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - elapsed));
  }
  
  await channel.publish(message.name, message.data);
  lastPublishTime = Date.now();
}
```

**Best Practice**: For strict ordering requirements, batch order-dependent messages into single REST requests. Implement application-level rate limiting to reduce concurrency risk of requests crossing paths.

## Anti-Patterns

1. **Channel Proliferation**: Creating excessively granular channels (e.g., per-user, per-session) results in constant metadata management overhead and triggers error 90021 (Max Channel Creation Rate Exceeded). Structure channels around logical groups or high-fan-out events.

2. **Retry Storm**: Clients retry failed requests too frequently without sufficient delay, overwhelming connection endpoints and triggering errors 42910, 42922 (Rate limit exceeded). Implement exponential backoff and rely on SDK's built-in reconnection attempts.

3. **Improper Instantiation**: Repeatedly creating and destroying Ably SDK objects leads to high connection overhead and triggers error 80021 (Max New Connections Rate Exceeded). Treat SDK instance as Singleton throughout application lifecycle.

4. **Chatty I/O / Unbatched REST**: Continually sending many small network requests via HTTP REST results in low throughput, variable latency, and risk of message reordering. Use Realtime SDK for ordered, high-throughput publishing. If REST must be used, implement batching.

5. **Basic Auth on Client-Side**: Exposing persistent API keys on client-side provides indefinite, full configured access rights, rendering system vulnerable to exploitation. Mandatory: Use token authentication for all client-side applications.

6. **Ignored State Loss**: Failing to implement History API recovery when channel reattachment has `resumed: false` leads to permanent data loss (messages published during suspension are not queued). Always check resume flag and recover history immediately.

7. **Monolithic Persistence**: Using Ably's message persistence or LiveObjects storage as the sole data store for data with vastly different usage patterns. Treat LiveObjects as distributed, synchronized cache/state store. Durable, complex, or infrequently accessed data should reside in external data store.

8. **Ignored Outbound Backpressure**: Failing to account for subscriber connection capacity limitations. When outbound message rate exceeds connection capacity, Ably forcibly detaches channels (error 80020). Reduce message volume per client or implement fan-in aggregation service.

## Best Practices

1. **Mandatory Token Authentication for Clients**: Enforce token authentication strictly on all client-side applications. Tokens are short-lived, revocable, and fine-grained. Never expose persistent API keys to untrusted environments.

2. **Singleton SDK Instance**: Reuse Ably SDK instance throughout application lifecycle. Creating multiple instances wastes connection resources and can trigger rate limits.

3. **History API Recovery for Suspended State**: Implement immediate History API retrieval when channel reattachment has `resumed: false`. This recovers messages published during extended disconnection (beyond 2-minute retention window).

4. **Exponential Backoff for Retries**: Use exponential backoff with jitter for any custom retry logic (token acquisition, bootstrapping). Prevents retry storms and respects rate limits.

5. **Batched Webhooks for High-Throughput**: Always configure webhooks with batching enabled (max once per second) for backend reactive processing. Protects external endpoints from overload and provides resilience against traffic spikes.

6. **Channel Scoping Around Logical Groups**: Structure channels to reflect sustainable communication patterns. Use channel parameters or message metadata for fine-grained routing rather than creating excessive channels.

7. **LiveObjects as Distributed Cache**: Treat LiveObjects as distributed, synchronized cache/state store for collaborative or live data synchronization. Durable, complex, or infrequently accessed data should reside in dedicated external data store, often integrated via LiveSync.

8. **Monitor Connection State Transitions**: Implement connection state monitoring to detect suspended state and trigger recovery workflows. Subscribe to connection and channel state change events.

## Workarounds

1. **History API Recovery**: When channel reattachment has `resumed: false` (indicating state continuity loss), immediately retrieve missing message backlog using History API. This recovers messages published during extended disconnection beyond the 2-minute retention window.

```javascript
channel.on('attached', async (stateChange) => {
  if (stateChange.resumed === false) {
    const history = await channel.history({ limit: 100 });
    history.items.reverse().forEach(message => {
      processMessage(message);
    });
  }
});
```

2. **REST Batching for Strict Ordering**: Package multiple sequential, order-dependent messages into single REST request payload. Ably guarantees ordering within single received request, ensuring entire batch is processed sequentially.

```javascript
const batch = [
  { name: 'step1', data: 'data1' },
  { name: 'step2', data: 'data2' },
  { name: 'step3', data: 'data3' }
];
await channel.publish(batch);
```

3. **Rate Limiting for REST Publishers**: Implement strict application-level rate limiting on HTTP publisher to reduce concurrency risk of requests crossing paths and arriving out of order.

```javascript
const MIN_INTERVAL = 100;
let lastPublish = 0;
async function rateLimitedPublish(channel, message) {
  const delay = Math.max(0, MIN_INTERVAL - (Date.now() - lastPublish));
  if (delay > 0) await new Promise(r => setTimeout(r, delay));
  await channel.publish(message.name, message.data);
  lastPublish = Date.now();
}
```

4. **Webhook Batching Configuration**: Configure webhooks with batching enabled (max once per second, configurable batch size) to reduce request volume to backend and enable efficient event processing.

```javascript
// Dashboard/API configuration
{
  "requestMode": "batch",
  "batch": {
    "maxBatchSize": 100,
    "maxBatchInterval": 1000
  }
}
```

## Error Handling

**401xx - Authentication & Security**:
- **40170** (Error from client token callback): Indicates failure or latency in application's external token issuance service. Verify token server availability and response time.

**429xx - Rate Limits / Throttling**:
- **42910, 42922** (Rate limit exceeded; request rejected): Application publisher or subscriber has exceeded defined account rate limits. Implement exponential backoff and reduce request frequency.

**800xx - Connection Resilience**:
- **80008** (Unable to recover connection): Client remained disconnected longer than 2-minute retention window (Suspended State). Requires History API intervention to recover missed messages.
- **80020** (Continuity loss due to maximum subscribe message rate exceeded): Outbound message rate exceeded connection capacity. Reduce message volume per client or implement fan-in aggregation.
- **80021** (Max New Connections Rate Exceeded): Too many new connections created. Reuse SDK instance (Singleton pattern) instead of creating multiple instances.

**900xx - Channel Management**:
- **90021** (Max Channel Creation Rate Exceeded): Symptom of Channel Proliferation anti-pattern. Review channel scoping strategy and consolidate granular channels.
- **90003** (Unable to recover channel - messages expired): Messages expired during extended disconnection. Implement History API recovery with appropriate limit before messages expire.

**720xx - Reactor / Ingress Failure**:
- **72003** (Ingress cannot connect to database): External database connectivity failure related to LiveSync or Reactor configuration. Check database credentials, connection requirements, and network accessibility.

## Examples

### Example 1: Basic Realtime Chat with Resilience

**Scenario**: Implementing resilient chat with token authentication, connection state handling, and History API recovery.

```javascript
import Ably from 'ably';

// Singleton SDK instance
const ably = new Ably.Realtime({
  authUrl: '/api/ably-token',
  authMethod: 'GET'
});

const channel = ably.channels.get('chat:room1');

// Connection state monitoring
ably.connection.on((stateChange) => {
  if (stateChange.current === 'suspended') {
    console.warn('Connection suspended - implementing recovery');
  }
});

// Channel attachment with resume check
channel.on('attached', async (stateChange) => {
  if (stateChange.resumed === false) {
    // Recover missed messages
    const history = await channel.history({ limit: 50 });
    history.items.reverse().forEach(msg => {
      displayMessage(msg.data);
    });
  }
});

// Subscribe and publish
channel.subscribe((message) => {
  displayMessage(message.data);
});

function sendMessage(text) {
  channel.publish('message', { text, user: currentUser });
}
```

### Example 2: Backend Integration with Batched Webhooks

**Scenario**: Configuring webhook integration with batching for high-throughput event processing.

```javascript
// Ably Dashboard/API Webhook Configuration
const webhookConfig = {
  channelFilter: 'events:*',
  ruleType: 'http',
  requestMode: 'batch',
  batch: {
    maxBatchSize: 100,
    maxBatchInterval: 1000
  },
  targetUrl: 'https://api.example.com/webhooks/ably'
};

// Backend webhook handler
app.post('/webhooks/ably', async (req, res) => {
  const events = req.body; // Array of batched events
  
  for (const event of events) {
    await processEvent(event);
  }
  
  res.status(200).send();
});

async function processEvent(event) {
  // Process individual event from batch
  console.log(`Processing: ${event.name} from ${event.channel}`);
}
```

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys in client-side code
- ❌ No API keys in SKILL.md or example code
- ❌ No credentials in version control
- ✅ Use environment variables for all API keys
- ✅ Use token authentication for all client-side applications
- ✅ Generate tokens on backend with appropriate capabilities and TTL
- ✅ Route sensitive operations through secure backend channels

**Operational Constraints**:
- Token authentication is mandatory for client-side (browsers, mobile devices)
- Basic authentication (API keys) is suitable for trusted server-side only
- Tokens should have appropriate TTL (typically 1 hour) and be renewed before expiration
- Monitor token generation service availability (dependency for client connectivity)
- Use Search-Only API keys for read-only operations when available

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `ably>=2.0.0`: Core Ably JavaScript/TypeScript client for realtime and REST operations

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

**Additional Framework-Specific Libraries** (as needed):
- `@ably/liveobjects`: For LiveObjects functionality (if using LiveObjects feature)
- Framework-specific Ably integrations may be available for React, Vue, etc.

## Performance Considerations

**Connection Management**:
- Reuse SDK instance throughout application lifecycle (Singleton pattern)
- Monitor connection state to detect and recover from suspended state
- Implement exponential backoff for custom retry logic

**Channel Efficiency**:
- Structure channels around logical groups, not excessive granularity
- Use channel parameters or message metadata for fine-grained routing
- Monitor channel creation rate to avoid error 90021

**Message Publishing**:
- Use Realtime SDK for high-throughput, ordered publishing
- If REST must be used, implement batching for order-dependent messages
- Apply rate limiting to prevent out-of-order delivery

**Webhook Processing**:
- Always enable batching for high-throughput webhook scenarios
- Configure appropriate batch size and interval based on endpoint capacity
- Monitor webhook endpoint health and implement retry logic

## Related Resources

For extensive reference materials, see:
- Ably Documentation: https://ably.com/documentation
- Ably API Reference: https://ably.com/documentation/rest-api
- Ably Reactor Documentation: https://ably.com/documentation/general/reactor
- Ably Error Codes: https://ably.com/documentation/general/errors

## Notes

- Ably provides exactly-once delivery semantics with 99.999999% (eight nines) message survivability guarantee
- Strong message ordering is guaranteed for persistently connected subscribers using Realtime client libraries
- Connection state is retained for maximum 2 minutes during disconnection. Beyond this, state is lost (suspended) and requires History API recovery
- Channels are ephemeral and virtual - no pre-provisioning required. They exist only when referenced in publisher or subscriber operations
- LiveObjects uses Push Operations (delta updates) pattern, not Push State (full object), for bandwidth efficiency
- Presence requires ClientId and appropriate presence capability in authentication token
- Webhook batching is critical for high-throughput scenarios to prevent endpoint overload and concurrency limit issues

