import { AntiPattern3 } from './anti-pattern';
import { Fixed3 } from './fixed';

import Link from 'next/link';

export default function AntiPattern3Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 3: Using Server Actions for Reads</h1>
      <p>
        Server Actions are designed for mutations. Use Server Components with
        fetch for reads to leverage automatic de-duping, streaming, and cache
        optimization.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Server Action for Read (WRONG)</h3>
        <p>
          Using Server Actions for read operations loses automatic de-duping,
          streaming, and cache optimization.
        </p>
        <AntiPattern3 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Server Component with Fetch (CORRECT)</h3>
        <p>
          Use Server Components with fetch for reads to get automatic
          de-duping, streaming, and cache optimization.
        </p>
        <Fixed3 />
      </div>
    </div>
  );
}

