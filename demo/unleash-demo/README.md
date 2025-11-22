# Unleash Feature Flags Demo

A production-ready demonstration of Unleash v9.2.0 feature flag management using Next.js 16, TypeScript, and Ant Design.

## Features

- **SPOE Pattern**: Single Point of Evaluation - flags evaluated once at request entry point
- **Abstraction Layer**: Feature service decouples application from Unleash SDK
- **Multi-Strategy Evaluation**: Inclusive OR logic (Gradual Rollout OR User IDs)
- **Constraint-Based Targeting**: Standard strategies with constraints (email domain, tenantId)
- **A/B Testing**: userId-based stickiness for consistent variant assignment
- **Server-Side Evaluation**: API tokens never exposed to client
- **Error Handling**: Fallback to disabled state on errors (fail-safe)
- **Telemetry**: appName and instanceId for governance metrics

## Best Practices Implemented

1. **SDK Initialization**: Early initialization with appName and instanceId for telemetry
2. **Complete Context**: All required fields (userId, email, tenantId, remoteAddress)
3. **Standard Strategies**: Prefer standard strategies with constraints over custom strategies
4. **Stickiness Configuration**: userId for A/B testing consistency across devices
5. **Abstraction Layer**: Centralized feature flag logic for maintainability
6. **SPOE Pattern**: Single evaluation per request ensures consistency

## Anti-Patterns Avoided

- ❌ **Flag Sprawl**: Flags centralized in abstraction layer for easy cleanup
- ❌ **Long-Lived Flags**: Proper lifecycle management (flags archived after feature delivery)
- ❌ **Fragmented Evaluation**: SPOE pattern ensures single evaluation per request
- ❌ **Custom Strategy Overload**: Using standard strategies with constraints instead
- ❌ **Incomplete Context**: Complete context building with all required fields
- ❌ **Missing Telemetry**: appName and instanceId provided for governance metrics

## Prerequisites

- Node.js 22+ (Unleash v7+ requires Node.js v22+ due to ESM migration)
- Unleash server v9.2.0+ (or v7+ compatible)
- PostgreSQL v14+ (required for Unleash server)
- Unleash API token (client-side or server-side)

## Setup

### 1. Install Dependencies

```bash
cd unleash-demo
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `unleash-demo` directory:

```env
# Unleash Server URL (without /api/ suffix)
UNLEASH_SERVER_URL=http://localhost:4242

# Unleash API Token (get from Unleash Admin UI: Settings → API Access)
UNLEASH_API_TOKEN=your_api_token_here

# Optional: Pod/Instance name for telemetry
# POD_NAME=pod-123
```

**Getting Your API Token:**

1. Log in to Unleash Admin UI (default: http://localhost:4242)
2. Go to **Settings** → **API Access**
3. Create a new **Client** token
4. Copy the token (starts with `*:*.`)

**Note**: Next.js automatically loads `.env` files. You can also use `.env.local` (which takes precedence and is gitignored by default).

### 3. Set Up Unleash Server

You need a running Unleash server. Options:

**Option A: Self-Hosted (Recommended for Production)**

Follow the [Unleash Server Setup Guide](https://docs.getunleash.io/reference/requirements) to set up your own Unleash server with PostgreSQL v14+.

**Option B: Unleash Cloud (Quick Start)**

1. Sign up for [Unleash Cloud](https://www.getunleash.io/)
2. Create a new project
3. Get your API URL and token from the project settings

**Option C: Docker Compose (Local Development)**

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: unleash_user
      POSTGRES_PASSWORD: unleash_password
      POSTGRES_DB: unleash
    volumes:
      - postgres_data:/var/lib/postgresql/data

  unleash:
    image: unleashorg/unleash-server:9.2.0
    ports:
      - "4242:4242"
    environment:
      DATABASE_URL: postgres://unleash_user:unleash_password@postgres:5432/unleash
      DATABASE_SSL: "false"
    depends_on:
      - postgres

volumes:
  postgres_data:
EOF

# Start services
docker-compose up -d
```

Unleash will be available at `http://localhost:4242`

### 4. Create Feature Flags in Unleash

Log in to Unleash Admin UI and create the following feature flags:

#### Flag 1: `feature-new-recommendations`

- **Type**: Release toggle
- **Strategies**:
  - Strategy 1: **Gradual Rollout** (50% of users)
  - Strategy 2: **User IDs** (whitelist: `demo@example.com`, `qa-team@company.com`)
- **Variants**: 
  - `control` (default)
  - `variant-a`
  - `variant-b`
- **Stickiness**: `userId`

#### Flag 2: `feature-new-ui`

- **Type**: Release toggle
- **Strategies**:
  - Strategy 1: **Gradual Rollout** (25% of users)
  - Strategy 2: **User IDs** (whitelist: `demo@example.com`)
- **Variants**:
  - `control` (default)
  - `variant-a`

#### Flag 3: `feature-premium`

- **Type**: Release toggle
- **Strategies**:
  - Strategy 1: **Gradual Rollout** (100% of users)
  - **Constraints**:
    - `email` STR_ENDS_WITH `@company.com`
    - `tenantId` EQUALS `premium-tenant`
- **Stickiness**: `userId`

#### Flag 4: `feature-experimental`

- **Type**: Kill switch
- **Strategies**:
  - Strategy 1: **Default** (disabled by default)
- **Purpose**: Emergency disable capability

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:4005](http://localhost:4005) to see the demo.

## Project Structure

```
unleash-demo/
├── app/
│   ├── api/
│   │   └── features/
│   │       └── route.ts          # SPOE pattern: evaluate flags once
│   ├── components/
│   │   ├── context-form.tsx      # User context input form
│   │   ├── feature-flag-card.tsx # Feature flag display card
│   │   └── feature-flags-list.tsx # Feature flags list component
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main demo page
│   ├── types.ts                  # TypeScript type definitions
│   └── globals.css               # Global styles
├── lib/
│   ├── unleash.ts                # Unleash SDK initialization
│   └── feature-service.ts       # Abstraction layer
├── package.json
├── tsconfig.json
└── README.md
```

## Key Components

### Feature Service (Abstraction Layer)

The `FeatureService` class centralizes all feature flag logic, decoupling the application from the Unleash SDK:

```typescript
import { getFeatureService } from '@/lib/feature-service';

const featureService = getFeatureService();
const enabled = featureService.isNewRecommendationEngineEnabled({
  userId: 'user-123',
  email: 'user@example.com',
  tenantId: 'tenant-premium',
});
```

### API Route (SPOE Pattern)

The `/api/features` route implements the SPOE pattern by evaluating all flags once at the request entry point:

```typescript
// Evaluate all flags once
const flags = {
  'feature-new-recommendations': {
    enabled: featureService.isNewRecommendationEngineEnabled(context),
    variant: featureService.getRecommendationVariant(context),
  },
  // ... other flags
};

// Pass results through system (don't re-evaluate)
return NextResponse.json({ flags });
```

## Architectural Patterns

### 1. Single Point of Evaluation (SPOE)

Feature flags are evaluated once at the request entry point (API route), and results are passed through the system. This ensures consistency and simplifies cleanup.

**Benefits:**
- Guarantees consistent user experience
- Simplifies code cleanup
- Localizes control logic

### 2. Abstraction Layer

The `FeatureService` class decouples the application from the Unleash SDK, enabling:
- Easy mocking for tests
- Faster cleanup (flags in one place)
- Architectural clarity

### 3. Multi-Strategy Evaluation

Multiple strategies can be applied to a single toggle using inclusive OR logic. For example:
- Gradual Rollout (50% of users) OR
- User IDs (whitelist: internal team)

**Result**: Internal team always enabled + 50% of general population

### 4. Constraint-Based Targeting

Instead of custom strategies, use standard strategies (Gradual Rollout) augmented with constraints:
- Email domain: `email STR_ENDS_WITH @company.com`
- Tenant ID: `tenantId EQUALS premium-tenant`

**Benefits:**
- Centralized complexity in Admin UI
- No custom SDK code
- Easier maintenance

### 5. A/B Testing with Stickiness

Use `userId` (persistent identifier) for stickiness to ensure consistent variant assignment across sessions and devices.

## Error Handling

The implementation includes comprehensive error handling:

- **Connection Failure**: SDK uses cached configuration, returns disabled state
- **Invalid API Token**: Returns disabled state, logs error
- **Missing Context Fields**: Uses default values, logs warning
- **Server Unavailable**: Continues with cached flags, alerts when server returns

**Fallback Strategy**: Default to disabled state on errors to prevent feature exposure during failures.

## Security

**CRITICAL**: Never hardcode sensitive information:

- ❌ No API tokens in code, configuration files, or version control
- ❌ No server URLs hardcoded
- ✅ Use environment variables for all sensitive configuration
- ✅ Use server-side token generation for client SDKs (never expose tokens to browser)
- ✅ Self-host Unleash for compliance (FedRAMP, SOC2, ISO27001)

## Performance Considerations

- **Local Evaluation**: Flag checks use in-memory repository (no network round-trip), sub-millisecond latency
- **Periodic Server Sync**: SDK polls server for configuration updates (default: 15 seconds)
- **Edge Caching**: Edge instances cache configuration, reduce latency for regional SDKs
- **Telemetry Overhead**: Minimal impact (usage metrics reported asynchronously, batched)

## Testing

The abstraction layer enables easy mocking for unit tests:

```typescript
// Mock feature service
const mockFeatureService = {
  isNewRecommendationEngineEnabled: jest.fn().mockReturnValue(true),
  getRecommendationVariant: jest.fn().mockReturnValue({ name: 'variant-a', enabled: true }),
};

// Test both enabled and disabled code paths
```

## Related Resources

- [Unleash Documentation](https://docs.getunleash.io/)
- [Unleash Server Requirements](https://docs.getunleash.io/reference/requirements)
- [SDK Documentation](https://docs.getunleash.io/reference/sdks)
- [Edge Deployment](https://docs.getunleash.io/reference/unleash-edge)
- [Feature Flag Lifecycle](https://docs.getunleash.io/reference/feature-lifecycle)

## Troubleshooting

### Flags Showing as Disabled When Enabled in Unleash

**Root Cause**: The SDK initializes asynchronously and may not be ready when the first request comes in.

**Solutions**:

1. **Wait for SDK to Sync**:
   - After starting the dev server (`npm run dev`), wait 15-20 seconds
   - Look for "Unleash client synchronized" in server logs
   - Then try evaluating flags again

2. **Ensure userId is Present**:
   - The "default" stickiness option requires `userId` in the context
   - If `userId` is not provided, it will be derived from email or generated
   - Always provide a consistent `userId` in the context form for best results

3. **Check SDK Readiness**:
   - The UI will show a warning if the SDK is not ready
   - Check server logs for "Unleash client synchronized" message
   - Verify connection to Unleash server is working

4. **Verify Strategy Configuration**:
   - In Unleash UI, ensure the flag is enabled in the correct environment (e.g., "development")
   - Check that the strategy (Gradual Rollout) is active
   - Verify stickiness is set to "default" (which uses userId if available)

### SDK Not Initializing

- Check that `UNLEASH_SERVER_URL` and `UNLEASH_API_TOKEN` are set in `.env` (or `.env.local`)
- Verify Unleash server is running and accessible
- Check API token permissions in Unleash Admin UI
- Look for error messages in server logs: "Unleash client error"

### Flags Not Evaluating Correctly

- Verify context includes all required fields (userId, email, tenantId)
- Check strategy configuration in Unleash Admin UI
- Verify constraints are correctly configured
- Ensure SDK is ready (wait 15-20 seconds after server start)
- Check server logs for diagnostic information

### Connection Errors

- Check network connectivity to Unleash server
- Verify server URL is correct (should NOT include `/api/` suffix - SDK adds it)
- Check firewall rules if self-hosting
- Verify API token format (should start with `*:*.`)
- Test connection: `curl -H "Authorization: YOUR_TOKEN" https://your-instance.com/api/health`

## License

This demo is provided as-is for educational purposes.

