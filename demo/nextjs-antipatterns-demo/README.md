# Next.js 14 Anti-Patterns Demo

This demo showcases 8 common Next.js 14 App Router anti-patterns and their correct implementations. Each anti-pattern is demonstrated with both the **wrong** approach and the **correct** solution.

## Anti-Patterns Covered

1. **Direct SC Import into CC**: Importing a Server Component directly into a Client Component module violates RSC isolation.
2. **Non-Serializable Props Across Boundary**: Passing functions, Date objects, class instances, or Promises from SC to CC causes hydration errors.
3. **Using Server Actions for Reads**: Server Actions are designed for mutations. Use Server Components with fetch for reads.
4. **Missing Validation/Auth in Server Actions**: All Server Actions must validate input (Zod) and verify authentication/authorization.
5. **Local Cache in Multi-Replica Deployments**: Default `.next/cache` writes to local file system, causing cache misses across replicas.
6. **Heavy Computation in Middleware**: Middleware runs on edge before route matching. Complex operations introduce latency.
7. **Browser API Access in Server Components**: Accessing window, localStorage, or event handlers in SC causes runtime errors.
8. **Throwing Exceptions for Expected Errors**: Use return values for expected errors (validation failures, conflicts).

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Anti-Pattern Details

### 1. Direct SC Import into CC

**Problem**: You cannot import Server Components directly into Client Components. This violates React Server Components (RSC) isolation.

**Anti-Pattern**:
```tsx
'use client';
import { ServerComponent } from './server-component'; // ❌ Error!
```

**Solution**: Use the children prop pattern:
```tsx
// Server Component
export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent /> {/* ✅ Pass as children */}
    </ClientComponent>
  );
}
```

**Demo**: `/anti-pattern-1`

---

### 2. Non-Serializable Props Across Boundary

**Problem**: Passing functions, Date objects, class instances, or Promises from Server Components to Client Components causes hydration errors because these types cannot be serialized.

**Anti-Pattern**:
```tsx
// Server Component
export default function Page() {
  const date = new Date();
  return <ClientComponent date={date} />; // ❌ Date not serializable
}
```

**Solution**: Serialize complex types before passing:
```tsx
// Server Component
export default function Page() {
  const date = new Date();
  return <ClientComponent date={date.toISOString()} />; // ✅ Serialize
}

// Client Component
'use client';
export function ClientComponent({ date }: { date: string }) {
  const dateObj = new Date(date); // ✅ Deserialize
  return <div>{dateObj.toLocaleString()}</div>;
}
```

**Demo**: `/anti-pattern-2`

---

### 3. Using Server Actions for Reads

**Problem**: Server Actions are designed for mutations. Using them for read operations loses automatic de-duping, streaming, and cache optimization.

**Anti-Pattern**:
```tsx
'use server';
export async function getPosts() { // ❌ Server Action for read
  return await fetchPosts();
}
```

**Solution**: Use Server Components with fetch for reads:
```tsx
// Server Component
export default async function Page() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // ✅ Automatic caching
  }).then(res => res.json());
  
  return <PostList posts={posts} />;
}
```

**Demo**: `/anti-pattern-3`

---

### 4. Missing Validation/Auth in Server Actions

**Problem**: Server Actions without validation and authentication checks are vulnerable to attacks. Client-side validation alone is insufficient.

**Anti-Pattern**:
```tsx
'use server';
export async function createPost(formData: FormData) {
  // ❌ No validation, no auth check
  const title = formData.get('title');
  await savePost(title);
}
```

**Solution**: Always validate and check auth:
```tsx
'use server';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(100),
});

export async function createPost(formData: FormData) {
  // ✅ Validate input
  const validated = schema.safeParse({
    title: formData.get('title'),
  });
  
  if (!validated.success) {
    return { error: 'Validation failed' };
  }
  
  // ✅ Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }
  
  // ✅ Check authorization
  if (!user.hasPermission('create:post')) {
    return { error: 'Forbidden' };
  }
  
  await savePost(validated.data);
  return { success: true };
}
```

**Demo**: `/anti-pattern-4`

---

### 5. Local Cache in Multi-Replica Deployments

**Problem**: Default `.next/cache` writes to local file system. In multi-replica deployments, each replica has its own cache, causing cache misses and redundant generation.

**Anti-Pattern**:
```
Replica 1: .next/cache/ (local)
Replica 2: .next/cache/ (local)
Replica 3: .next/cache/ (local)
// Result: Cache misses, redundant work
```

**Solution**: Externalize cache to shared storage:
```typescript
// Use Redis or S3 for shared cache
const redis = new Redis(process.env.REDIS_URL);
// All replicas share same cache
```

**Demo**: `/anti-pattern-5`

---

### 6. Heavy Computation in Middleware

**Problem**: Middleware runs on every request before route matching. Heavy operations cause latency and timeouts.

**Anti-Pattern**:
```tsx
export function middleware(request: NextRequest) {
  // ❌ Heavy operations
  const user = await db.user.findUnique({ ... });
  const analytics = await calculateAnalytics(user);
  const data = await fetch('https://api.example.com/data');
}
```

**Solution**: Keep middleware lightweight:
```tsx
export function middleware(request: NextRequest) {
  // ✅ Lightweight: Cookie check only
  const token = request.cookies.get('auth-token')?.value;
  
  // ✅ Lightweight: Simple redirect
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // ✅ Move heavy operations to route handlers/Server Actions
  return NextResponse.next();
}
```

**Demo**: `/anti-pattern-6`

---

### 7. Browser API Access in Server Components

**Problem**: Accessing window, localStorage, or event handlers in Server Components causes runtime errors because these APIs don't exist on the server.

**Anti-Pattern**:
```tsx
// Server Component
export default function Page() {
  const width = window.innerWidth; // ❌ window is not defined
  const theme = localStorage.getItem('theme'); // ❌ localStorage is not defined
  return <button onClick={() => alert('clicked')}>Click</button>; // ❌ onClick not allowed
}
```

**Solution**: Mark component with 'use client' if browser APIs are needed:
```tsx
// Server Component
export default function Page() {
  return <ClientBrowserComponent />;
}

// Client Component
'use client';
export function ClientBrowserComponent() {
  const [width, setWidth] = useState(window.innerWidth); // ✅ Works
  const theme = localStorage.getItem('theme'); // ✅ Works
  return <button onClick={() => alert('clicked')}>Click</button>; // ✅ Works
}
```

**Demo**: `/anti-pattern-7`

---

### 8. Throwing Exceptions for Expected Errors

**Problem**: Throwing exceptions for expected errors (validation failures, conflicts) makes error handling difficult and requires try/catch blocks.

**Anti-Pattern**:
```tsx
'use server';
export async function createPost(formData: FormData) {
  if (!formData.get('title')) {
    throw new Error('Title required'); // ❌ Exception for expected error
  }
}

// Client must use try/catch
try {
  await createPost(formData);
} catch (err) {
  // Handle expected error
}
```

**Solution**: Return error objects for expected errors:
```tsx
'use server';
export async function createPost(
  prevState: { message: string; error: string | null },
  formData: FormData
) {
  if (!formData.get('title')) {
    return { message: '', error: 'Title required' }; // ✅ Return error
  }
  
  return { message: 'Post created!', error: null };
}

// Client uses useActionState - no try/catch needed
const [state, formAction] = useActionState(createPost, initialState);
```

**Demo**: `/anti-pattern-8`

## Best Practices Summary

1. **Server Components as Default**: Use Server Components for data fetching and heavy computation.
2. **Children Prop Pattern**: Pass Server Components to Client Components via children prop.
3. **Serialize Props**: Convert complex types (Date, functions) to serializable formats (strings, plain objects).
4. **Server Actions for Mutations Only**: Use Server Components with fetch for reads, Server Actions for mutations.
5. **Always Validate & Authenticate**: Use Zod for validation and check auth in every Server Action.
6. **Externalize Cache**: Use shared storage (Redis, S3) for multi-replica deployments.
7. **Lightweight Middleware**: Keep middleware fast - only auth checks, redirects, logging.
8. **Client Components for Browser APIs**: Mark components with 'use client' if browser APIs are needed.
9. **Return Values for Expected Errors**: Use return values for validation/conflicts, exceptions only for unexpected failures.

## Project Structure

```
nextjs-antipatterns-demo/
├── app/
│   ├── anti-pattern-1/     # Direct SC import into CC
│   ├── anti-pattern-2/     # Non-serializable props
│   ├── anti-pattern-3/     # Server Actions for reads
│   ├── anti-pattern-4/     # Missing validation/auth
│   ├── anti-pattern-5/     # Local cache in multi-replica
│   ├── anti-pattern-6/     # Heavy computation in middleware
│   ├── anti-pattern-7/     # Browser API in SC
│   ├── anti-pattern-8/     # Throwing exceptions for expected errors
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── middleware.ts            # Lightweight middleware example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## License

MIT

