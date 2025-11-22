import { AntiPattern7 } from './anti-pattern';
import { Fixed7 } from './fixed';

import Link from 'next/link';

export default function AntiPattern7Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 7: Browser API Access in Server Components</h1>
      <p>
        Accessing window, localStorage, or event handlers in SC causes runtime
        errors. Mark component with 'use client' if browser APIs are needed.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Browser API in SC (WRONG)</h3>
        <p>
          Accessing browser APIs in Server Components causes runtime errors.
        </p>
        <AntiPattern7 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Client Component for Browser APIs (CORRECT)</h3>
        <p>
          Mark component with 'use client' if browser APIs are needed.
        </p>
        <Fixed7 />
      </div>
    </div>
  );
}

