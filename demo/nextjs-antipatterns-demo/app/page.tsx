import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container">
      <h1>Next.js 14 Anti-Patterns Demo</h1>
      <p>
        This demo showcases 8 common Next.js 14 App Router anti-patterns and
        their correct implementations.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Anti-Patterns Covered</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-1" style={{ color: '#0070f3' }}>
              1. Direct SC Import into CC
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-2" style={{ color: '#0070f3' }}>
              2. Non-Serializable Props Across Boundary
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-3" style={{ color: '#0070f3' }}>
              3. Using Server Actions for Reads
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-4" style={{ color: '#0070f3' }}>
              4. Missing Validation/Auth in Server Actions
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-5" style={{ color: '#0070f3' }}>
              5. Local Cache in Multi-Replica Deployments
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-6" style={{ color: '#0070f3' }}>
              6. Heavy Computation in Middleware
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-7" style={{ color: '#0070f3' }}>
              7. Browser API Access in Server Components
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/anti-pattern-8" style={{ color: '#0070f3' }}>
              8. Throwing Exceptions for Expected Errors
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

