---
name: implementing-nextjs-14-production
description: Implements Next.js 14 App Router production patterns by applying proven architectural strategies (Server Components as default, Server Actions for mutations, comprehensive caching with revalidatePath/revalidateTag, Parallel/Intercepting Routes, middleware optimization), following best practices (component interleaving, serialization constraints, mandatory validation/auth, useActionState error handling), implementing workarounds (Date serialization, cache externalization for multi-replica, REST batching), and avoiding anti-patterns (direct SC import into CC, non-serializable props, Server Actions for reads, missing validation, local cache in multi-replica). Use when building Next.js 14 applications, implementing Server Components, setting up caching strategies, configuring advanced routing, or deploying to production environments.
version: 1.0.0
dependencies:
  - next>=14.0.0
  - react>=18.0.0
  - typescript>=5.0.0
---

# Implementing Next.js 14 Production

## Overview

Implements Next.js 14 App Router architecture using React Server Components (RSC) as the default execution environment, positioning server-side computation and secure data fetching as foundational patterns. The framework leverages Server Components for performance optimization, minimizing JavaScript bundle size while ensuring security through server-side execution. This skill focuses on production-ready patterns, critical anti-patterns, essential best practices, and necessary workarounds for enterprise-grade deployments.

## When to Use

Use this skill when:
- Building Next.js 14 applications with App Router architecture
- Implementing Server Components and Server Actions
- Setting up comprehensive caching and revalidation strategies
- Configuring advanced routing patterns (Parallel Routes, Intercepting Routes)
- Deploying to production environments (Vercel or self-hosted)
- Avoiding common anti-patterns that cause runtime errors or performance degradation
- Implementing secure data mutations with proper validation and authorization
- Optimizing for high-performance rendering (Turbopack, Partial Prerendering)

**Input format**: Next.js 14+ project, understanding of React Server Components, TypeScript configuration, deployment environment requirements
**Expected output**: Production-ready Next.js 14 implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Next.js 14+ project setup with App Router
- Understanding of React Server Components architecture
- TypeScript configuration for type safety
- Deployment environment considerations (Vercel vs self-hosted)
- Access to database/API for data fetching operations
- Authentication/authorization system for secure operations

## Execution Steps

### Step 1: Server Component Patterns

Server Components constitute the primary location for computationally heavy logic and all secure data fetching operations, executing entirely on the server to guarantee enhanced security and minimal JavaScript delivery to the browser.

**Pattern**: Strategic Server Component Usage
**Best Practice**: Server Components for heavy logic and secure data fetching
**Anti-Pattern**: Browser API access in Server Components (window, localStorage, event handlers)

**Server Component with Data Fetching Template**:
```typescript
// app/products/page.tsx (Server Component - default)
async function ProductsPage() {
  // Direct database/API access (secure, server-side only)
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  }).then(res => res.json());

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Pattern**: Component Interleaving (Children Composition)
**Best Practice**: Pass Server Components as children prop to Client Components
**Anti-Pattern**: Direct SC import into CC module

**Children Interleaving Template**:
```typescript
// app/components/Modal.tsx (Client Component)
'use client';
import { useState } from 'react';

export function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isOpen) return <button onClick={() => setIsOpen(true)}>Open</button>;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children} {/* Server Component passed as children */}
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>
    </div>
  );
}

// app/page.tsx (Server Component)
import { Modal } from './components/Modal';
import { CartSummary } from './components/CartSummary'; // Server Component

export default function Page() {
  return (
    <Modal>
      <CartSummary /> {/* SC passed as children to CC */}
    </Modal>
  );
}
```

**Pattern**: Serialization Constraints
**Best Practice**: Serialize complex types (Date → ISO string) before passing across boundary
**Anti-Pattern**: Non-serializable props (functions, Date objects, class instances, Promises)

**Date Serialization/Deserialization Template**:
```typescript
// app/components/ServerDate.tsx (Server Component)
export async function ServerDate() {
  const date = new Date();
  return <ClientDateDisplay date={date.toISOString()} />; // Serialize to string
}

// app/components/ClientDateDisplay.tsx (Client Component)
'use client';
export function ClientDateDisplay({ date }: { date: string }) {
  const dateObj = new Date(date); // Deserialize in client
  return <div>{dateObj.toLocaleDateString()}</div>;
}
```

### Step 2: Server Actions Implementation

Server Actions represent the definitive pattern for handling asynchronous data mutations and form submissions, operating as asynchronous functions executed entirely on the server with deep integration into Next.js caching and revalidation.

**Pattern**: Server Action Definition
**Best Practice**: Server Actions for mutations only (not reads)
**Anti-Pattern**: Using Server Actions for read operations

**Basic Server Action with Validation Template**:
```typescript
// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  // Mandatory: Server-side validation
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
  };
  
  const validated = createPostSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: 'Validation failed', details: validated.error.errors };
  }

  // Mandatory: Authentication/Authorization check
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }
  if (!user.hasPermission('create:post')) {
    return { error: 'Forbidden' };
  }

  // Perform mutation
  await createPostInDatabase(validated.data);

  // Revalidate cache
  revalidatePath('/posts');
  return { success: true };
}
```

**Pattern**: Error Handling with useActionState
**Best Practice**: Expected errors as return values (not exceptions)
**Anti-Pattern**: Throwing exceptions for expected errors

**Server Action with useActionState Template**:
```typescript
// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(
  prevState: { message: string },
  formData: FormData
) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Expected error as return value
  if (!title || !content) {
    return { message: 'Title and content are required' };
  }

  const res = await fetch('https://api.example.com/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    return { message: 'Failed to create post' };
  }

  revalidatePath('/posts');
  return { message: 'Post created successfully' };
}

// app/components/CreatePostForm.tsx (Client Component)
'use client';
import { useActionState } from 'react';
import { createPost } from '@/app/actions';

const initialState = { message: '' };

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      {state?.message && (
        <p className={state.message.includes('Failed') ? 'error' : 'success'}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### Step 3: Caching and Revalidation

Next.js 14 caching system leverages complementary primitives for achieving data consistency across server components and pages, enabling precise cache invalidation following mutations.

**Pattern**: Comprehensive Cache Revalidation
**Best Practice**: Combine revalidatePath + updateTag for comprehensive consistency
**Anti-Pattern**: Incomplete cache invalidation leading to stale data

**Comprehensive Cache Revalidation Utility Template**:
```typescript
// app/lib/cache-utils.ts
'use server';
import { revalidatePath, updateTag } from 'next/cache';

export async function updatePostAndRevalidate(
  postId: string,
  newContent: FormData
) {
  // 1. Perform mutation
  await updatePostInDatabase(postId, newContent);

  // 2. Invalidate specific detail page
  revalidatePath(`/posts/${postId}`);

  // 3. Invalidate aggregate list using tag (immediate expiration)
  updateTag('posts');

  // 4. Optionally revalidate layout
  revalidatePath('/posts', 'layout');
}
```

**Pattern**: Tagged Fetch for Aggregate Data
**Best Practice**: Use tags for aggregate data dependencies

**Tagged Fetch Pattern Template**:
```typescript
// app/components/PostList.tsx (Server Component)
async function PostList() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] } // Tag for revalidation
  }).then(res => res.json());

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Pattern**: Stale-While-Revalidate (SWR)
**Best Practice**: revalidateTag uses SWR semantics by default

**SWR Pattern Template**:
```typescript
// app/actions.ts
'use server';
import { revalidateTag } from 'next/cache';

export async function refreshPosts() {
  // SWR: Serves stale content immediately, fetches fresh in background
  revalidateTag('posts');
  // For immediate expiration, use updateTag('posts') instead
}
```

### Step 4: Routing Patterns

Next.js App Router provides specialized conventions for managing advanced, concurrent, and state-preserving UI interactions through dedicated routing mechanisms.

**Pattern**: Parallel Routes
**Best Practice**: Parallel routes for independent layouts with separate loading/error states

**Parallel Route Layout Composition Template**:
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout(props: {
  children: React.ReactNode;
  analytics: React.ReactNode; // @analytics slot
  team: React.ReactNode;      // @team slot
}) {
  return (
    <div className="dashboard-grid">
      <main>{props.children}</main>
      <aside>
        {props.analytics}
        {props.team}
      </aside>
    </div>
  );
}

// Directory structure:
// app/dashboard/
//   ├── layout.tsx
//   ├── page.tsx
//   ├── @analytics/
//   │   └── page.tsx
//   └── @team/
//       └── page.tsx
```

**Pattern**: Intercepting Routes
**Best Practice**: Intercepting routes for persistent modals with shareable URLs

**Intercepting Route Modal Pattern Template**:
```typescript
// app/photos/[id]/page.tsx (Full page)
export default function PhotoPage({ params }: { params: { id: string } }) {
  return <PhotoDetail id={params.id} />;
}

// app/photos/@modal/(.)photos/[id]/page.tsx (Intercepted modal)
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <PhotoDetail id={params.id} />
    </Modal>
  );
}

// (.) = same level, (..) = one level up, (...) = root level
```

**Pattern**: Route Handlers
**Best Practice**: Route Handlers for public-facing APIs or complex HTTP contracts

**Route Handler Template**:
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const posts = await fetchPostsFromDatabase();
  return NextResponse.json(posts, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newPost = await createPostInDatabase(data);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Step 5: Middleware and Edge Functions

Middleware executes on the edge before request completion, running prior to caching layers and route matching, making it ideal for lightweight, high-priority tasks.

**Pattern**: Authentication Middleware
**Best Practice**: Lightweight operations only, authentication checks before route matching
**Anti-Pattern**: Heavy computation, direct data fetching, complex session management

**Authentication Middleware Template**:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('currentUser')?.value;

  // Redirect authenticated users away from login
  if (currentUser && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

**Pattern**: Path Rewriting and Feature Flags
**Best Practice**: Dynamic path rewriting for A/B testing or feature rollouts

**Path Rewriting Template**:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Feature flag: Rewrite /new-feature to /feature-v2
  if (request.nextUrl.pathname === '/new-feature') {
    const user = request.cookies.get('userType')?.value;
    if (user === 'beta') {
      return NextResponse.rewrite(new URL('/feature-v2', request.url));
    }
  }

  return NextResponse.next();
}
```

### Step 6: Deployment Considerations

Scaling Next.js 14 requires careful consideration of infrastructure dependencies, revealing trade-offs between architectural ergonomics and deployment portability.

**Pattern**: Vercel Deployment (Managed)
**Best Practice**: Automatic global cache distribution and fast propagation (300ms)

**next.config.js with PPR Template**:
```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true, // Partial Prerendering (experimental)
    serverActions: true,
  },
  output: 'standalone',
};

export default nextConfig;
```

**Pattern**: Self-Hosting with External Cache
**Best Practice**: External durable storage (S3, Redis) for multi-replica deployments
**Anti-Pattern**: Local file-system cache in multi-replica environments

**Cache Externalization Configuration Template**:
```typescript
// For self-hosted deployments with multiple replicas
// Externalize cache to shared storage (S3, Redis, etc.)

// Example: Using Redis for cache storage
// Configure in next.config.ts or environment variables
// Requires custom cache implementation or adapter
```

**Workaround**: Multi-replica cache consistency requires externalizing `.next/cache` to shared, persistent storage accessible to all replicas. Default local file-system caching causes inconsistent performance and redundant generation across replicas.

## Anti-Patterns

1. **Direct SC Import into CC**: Importing a Server Component directly into a Client Component module violates RSC isolation. Use children prop pattern instead.

2. **Non-Serializable Props Across Boundary**: Passing functions, Date objects, class instances, or Promises from SC to CC causes hydration errors. Serialize to plain objects/strings first.

3. **Using Server Actions for Reads**: Server Actions are designed for mutations. Use Server Components with fetch for reads to leverage automatic de-duping, streaming, and cache optimization.

4. **Missing Validation/Auth in Server Actions**: All Server Actions must validate input (Zod) and verify authentication/authorization. Client-side validation alone is insufficient.

5. **Local Cache in Multi-Replica Deployments**: Default `.next/cache` writes to local file system, causing cache misses and redundant generation across replicas. Externalize to shared storage (S3, Redis).

6. **Heavy Computation in Middleware**: Middleware runs on edge before route matching. Complex operations introduce latency. Keep lightweight (auth checks, redirects, logging).

7. **Browser API Access in Server Components**: Accessing window, localStorage, or event handlers in SC causes runtime errors. Mark component with 'use client' if browser APIs are needed.

8. **Throwing Exceptions for Expected Errors**: Use return values for expected errors (validation failures, conflicts). Reserve exceptions for unexpected system failures.

## Examples

### Example 1: E-commerce Product Update Flow

**Scenario**: Update product details, invalidate both detail page and product listing page.

**Implementation**:
```typescript
// app/actions/products.ts
'use server';
import { revalidatePath, updateTag } from 'next/cache';

export async function updateProduct(
  productId: string,
  formData: FormData
) {
  await updateProductInDatabase(productId, formData);
  
  // Invalidate specific product page
  revalidatePath(`/products/${productId}`);
  
  // Invalidate product listing (tagged fetch)
  updateTag('products');
  
  return { success: true };
}
```

### Example 2: Dashboard with Parallel Routes

**Scenario**: Admin dashboard with independent analytics and team sections that load separately.

**Implementation**:
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout(props: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3">
      <main className="col-span-2">{props.children}</main>
      <aside>
        {props.analytics}
        {props.team}
      </aside>
    </div>
  );
}
```

## Error Handling

**Common Errors and Resolutions**:

- **Hydration Mismatch**: Caused by non-serializable props or server/client state differences. Ensure all props are serializable and state is consistent.

- **"use client" Directive Missing**: Browser APIs accessed in Server Component. Add 'use client' directive to component file.

- **Cache Not Invalidating**: Verify revalidatePath uses correct path format. For dynamic routes, consider revalidating layout. Check tag names match between fetch and revalidateTag.

- **Server Action Validation Errors**: Ensure Zod schema matches form data structure. Return validation errors as objects, not thrown exceptions.

- **Middleware Timeout**: Middleware execution too slow. Move heavy operations to route handlers or Server Actions.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or component files
- ✅ Use environment variables (NEXT_PUBLIC_* for client, regular env vars for server)
- ✅ Implement mandatory server-side validation (Zod)
- ✅ Verify authentication and authorization in every Server Action
- ✅ Use token authentication for client-side (never basic auth)

**Operational Constraints**:
- Server Components execute only on server (no browser APIs)
- Server Actions require 'use server' directive
- Middleware must be lightweight (edge runtime limitations)
- Cache externalization required for multi-replica deployments

## Performance Considerations

- **Turbopack**: Default bundler in Next.js 14, provides 700x faster cold starts than Webpack
- **Partial Prerendering (PPR)**: Experimental feature for mixed static/dynamic routes. Wrap dynamic components in Suspense boundaries
- **Server Components**: Zero JavaScript bundle for SC, reducing initial load
- **Automatic Request De-duping**: Multiple components fetching same data share single request
- **Streaming**: Server Components stream HTML as they render, improving perceived performance
- **Image Optimization**: Use next/image for automatic optimization and lazy loading

## Related Resources

- Next.js 14 Documentation: https://nextjs.org/docs
- React Server Components: https://react.dev/reference/rsc/server-components
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
- Caching: https://nextjs.org/docs/app/building-your-application/caching
- Deployment: https://nextjs.org/docs/deployment

