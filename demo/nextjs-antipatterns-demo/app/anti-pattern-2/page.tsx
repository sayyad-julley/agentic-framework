import { AntiPattern2 } from './anti-pattern';
import { Fixed2 } from './fixed';

import Link from 'next/link';

export default function AntiPattern2Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 2: Non-Serializable Props Across Boundary</h1>
      <p>
        Passing functions, Date objects, class instances, or Promises from SC
        to CC causes hydration errors.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Non-Serializable Props (WRONG)</h3>
        <p>
          Passing Date objects, functions, or class instances directly will cause
          serialization errors.
        </p>
        <div style={{ padding: '1rem', background: '#ffebee', borderRadius: '4px' }}>
          <p style={{ color: '#c62828' }}>
            ❌ This component would require non-serializable props (Date, function) which cannot be passed from Server Component to Client Component
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Example: <code>{'<AntiPattern2 date={new Date()} callback={() => {}} />'}</code> would cause serialization errors
          </p>
        </div>
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Serialized Props (CORRECT)</h3>
        <p>
          Serialize complex types (Date → ISO string) before passing across the
          boundary.
        </p>
        <Fixed2 />
      </div>
    </div>
  );
}

