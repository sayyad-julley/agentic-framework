import { AntiPattern6 } from './anti-pattern';
import { Fixed6 } from './fixed';

import Link from 'next/link';

export default function AntiPattern6Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 6: Heavy Computation in Middleware</h1>
      <p>
        Middleware runs on edge before route matching. Complex operations
        introduce latency. Keep lightweight (auth checks, redirects, logging).
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Heavy Computation (WRONG)</h3>
        <p>
          Heavy operations in middleware cause latency and timeouts.
        </p>
        <AntiPattern6 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Lightweight Middleware (CORRECT)</h3>
        <p>
          Keep middleware lightweight with only auth checks, redirects, and
          logging.
        </p>
        <Fixed6 />
      </div>
    </div>
  );
}

