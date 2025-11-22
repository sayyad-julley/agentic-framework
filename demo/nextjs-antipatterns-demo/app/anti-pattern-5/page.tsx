import { AntiPattern5 } from './anti-pattern';
import { Fixed5 } from './fixed';

import Link from 'next/link';

export default function AntiPattern5Page() {
  return (
    <div className="container">
      <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
        ← Back to Home
      </Link>
      <h1>Anti-Pattern 5: Local Cache in Multi-Replica Deployments</h1>
      <p>
        Default .next/cache writes to local file system, causing cache misses
        and redundant generation across replicas. Externalize to shared storage
        (S3, Redis).
      </p>

      <div className="anti-pattern-section">
        <span className="badge badge-anti-pattern">❌ ANTI-PATTERN</span>
        <h3>Local File System Cache (WRONG)</h3>
        <p>
          Using default local cache in multi-replica deployments causes cache
          misses and redundant generation.
        </p>
        <AntiPattern5 />
      </div>

      <div className="fixed-section">
        <span className="badge badge-fixed">✅ FIXED</span>
        <h3>External Cache (CORRECT)</h3>
        <p>
          Externalize cache to shared storage (S3, Redis) for multi-replica
          deployments.
        </p>
        <Fixed5 />
      </div>
    </div>
  );
}

