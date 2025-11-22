import { AntiPattern8 } from './anti-pattern';
import { Fixed8 } from './fixed';

import Link from 'next/link';

export default function AntiPattern8Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 8: Throwing Exceptions for Expected Errors</h1>
      <p>
        Use return values for expected errors (validation failures, conflicts).
        Reserve exceptions for unexpected system failures.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Throwing for Expected Errors (WRONG)</h3>
        <p>
          Throwing exceptions for expected errors makes error handling
          difficult.
        </p>
        <AntiPattern8 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Return Values for Expected Errors (CORRECT)</h3>
        <p>
          Return error objects for expected errors, use exceptions only for
          unexpected failures.
        </p>
        <Fixed8 />
      </div>
    </div>
  );
}

