// ❌ ANTI-PATTERN: Local file system cache
export function AntiPattern5() {
  return (
    <div>
      <h4>Local File System Cache (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ Default .next/cache writes to local file system
      </p>
      <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
        <p><strong>Problems in multi-replica deployments:</strong></p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Each replica has its own cache</li>
          <li>Cache misses across replicas</li>
          <li>Redundant generation of same content</li>
          <li>Inconsistent cache state</li>
          <li>Wasted compute resources</li>
        </ul>
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Default Next.js cache location
.next/cache/
  ├── fetch-cache/
  ├── router-cache/
  └── ...

// Each replica has separate cache
Replica 1: .next/cache/ (local)
Replica 2: .next/cache/ (local)
Replica 3: .next/cache/ (local)

// Result: Cache misses, redundant work`}
        </pre>
      </div>
    </div>
  );
}

