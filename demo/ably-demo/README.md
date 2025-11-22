# Ably Realtime Demo

A production-ready real-world demonstration of Ably realtime messaging with Next.js 14 App Router, featuring:

- **Real-time Chat**: Multi-user chat with message history
- **Presence Management**: See who's online in real-time
- **Connection Resilience**: Automatic reconnection with state recovery
- **Token Authentication**: Secure client-side authentication via backend
- **History API Recovery**: Recover missed messages after disconnection
- **Connection State Monitoring**: Visual connection status indicators

## Features

### ✅ Best Practices Implemented

- **Singleton SDK Instance**: Ably client reused throughout application lifecycle
- **Token Authentication**: Secure token-based auth for client-side (mandatory)
- **Ephemeral Channels**: Logical channel grouping (no pre-provisioning)
- **History API Recovery**: Automatic message recovery on reconnection
- **Connection State Monitoring**: Real-time connection status tracking
- **Presence Management**: Live user presence tracking

### ✅ Anti-Patterns Avoided

- ❌ No channel proliferation (logical grouping used)
- ❌ No basic auth on client-side (token auth only)
- ❌ No improper instantiation (singleton pattern)
- ❌ No ignored state loss (History API recovery implemented)
- ❌ No retry storms (exponential backoff in SDK)

## Prerequisites

1. **Ably Account**: Sign up at [ably.com](https://ably.com) (free tier available)
2. **API Key**: Get your API key from [Ably Dashboard](https://ably.com/accounts/any/dashboard)
3. **Node.js**: Version 18+ required

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Ably API key:
   ```
   ABLY_API_KEY=your-ably-api-key-here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**:
   Navigate to [http://localhost:4002](http://localhost:4002)

## Architecture

### Backend (Server-Side)

- **Token Generation** (`app/api/ably-token/route.ts`): Generates short-lived tokens for client authentication
- **API Key Usage**: Server-side only, never exposed to client

### Frontend (Client-Side)

- **Ably Provider** (`app/providers/ably-provider.tsx`): Singleton SDK instance with connection management
- **Chat Component** (`app/components/chat.tsx`): Real-time chat with history recovery
- **Presence Component** (`app/components/presence.tsx`): User presence tracking
- **Connection Status** (`app/components/connection-status.tsx`): Visual connection state

### Channel Architecture

- **Chat Channel**: `chat:general` - Main chat room
- **Presence Channel**: Same channel used for presence tracking
- **Logical Grouping**: Channels structured around features, not per-user

## Security

⚠️ **CRITICAL**: Never expose API keys to client-side code.

- ✅ Token authentication used for all client connections
- ✅ API keys only used server-side for token generation
- ✅ Environment variables for sensitive data
- ✅ Short-lived tokens (1 hour TTL) with automatic renewal

## Connection Resilience

The demo implements automatic reconnection with state recovery:

1. **2-Minute Window**: Ably retains connection state for 2 minutes
2. **History Recovery**: If disconnected longer, History API recovers missed messages
3. **Resume Detection**: Checks `resumed: false` flag on channel attachment
4. **Automatic Reconnection**: SDK handles reconnection automatically

## Usage Examples

### Basic Chat

```typescript
// Messages are automatically received via useChannel hook
// Publishing is handled through the chat component
```

### Presence Tracking

```typescript
// Presence is automatically managed via usePresence hook
// Users enter/leave presence set automatically
```

### Connection Monitoring

```typescript
// Connection state is monitored via connection state events
// Visual indicators show current connection status
```

## Error Handling

The demo handles common Ably errors:

- **40170**: Token callback failure - Check token server availability
- **42910, 42922**: Rate limit exceeded - Implemented exponential backoff
- **80008**: Connection suspended - History API recovery implemented
- **80021**: Max connections exceeded - Singleton pattern prevents this
- **90021**: Max channel creation rate - Logical channel grouping prevents this

## Performance Considerations

- **Singleton SDK**: One Ably instance per application
- **Channel Efficiency**: Logical grouping, not excessive granularity
- **Message Batching**: Automatic batching for high-throughput scenarios
- **Connection Pooling**: SDK manages connections efficiently

## Related Resources

- [Ably Documentation](https://ably.com/documentation)
- [Ably JavaScript SDK](https://github.com/ably/ably-js)
- [Ably React Hooks](https://github.com/ably/ably-js/tree/main/docs/react.md)
- [Ably Error Codes](https://ably.com/documentation/general/errors)

## License

MIT

