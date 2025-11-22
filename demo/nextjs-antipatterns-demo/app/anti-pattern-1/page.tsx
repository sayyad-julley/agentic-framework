import { AntiPattern1 } from './anti-pattern';
import { Fixed1 } from './fixed';
import { ServerDataComponent } from './server-component';

import Link from 'next/link';

export default function AntiPattern1Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 1: Direct SC Import into CC</h1>
      <p>
        Importing a Server Component directly into a Client Component module
        violates RSC isolation.
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Direct Import (WRONG)</h3>
        <p>
          This will cause an error because you cannot import Server Components
          directly into Client Components.
        </p>
        <AntiPattern1 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>Children Prop Pattern (CORRECT)</h3>
        <p>
          Use the children prop pattern to pass Server Components to Client
          Components.
        </p>
        <Fixed1>
          <ServerDataComponent />
        </Fixed1>
      </div>
    </div>
  );
}
