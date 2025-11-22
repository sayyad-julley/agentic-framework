import { AntiPattern4 } from './anti-pattern';
import { Fixed4 } from './fixed';

import Link from 'next/link';

export default function AntiPattern4Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 4: Missing Validation/Auth in Server Actions</h1>
      <p>
        All Server Actions must validate input (Zod) and verify
        authentication/authorization. Client-side validation alone is
        insufficient.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>No Validation/Auth (WRONG)</h3>
        <p>
          Server Action without validation or authentication checks is
          vulnerable to attacks.
        </p>
        <AntiPattern4 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>With Validation & Auth (CORRECT)</h3>
        <p>
          Server Action with Zod validation and authentication/authorization
          checks.
        </p>
        <Fixed4 />
      </div>
    </div>
  );
}

