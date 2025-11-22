// ✅ FIXED: External cache configuration
export function Fixed5() {
  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>External Cache (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Externalize cache to shared storage (S3, Redis)
      </p>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Solutions for multi-replica deployments:</strong></p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Use Redis for shared cache</li>
          <li>Use S3 for persistent cache storage</li>
          <li>All replicas share same cache</li>
          <li>Consistent cache state</li>
          <li>Efficient resource usage</li>
        </ul>
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// External cache configuration
// Option 1: Redis
const redis = new Redis(process.env.REDIS_URL);

// Option 2: S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

// All replicas share same cache
Replica 1 ──┐
Replica 2 ──┼──> Shared Cache (Redis/S3)
Replica 3 ──┘

// Result: Cache hits, efficient work`}
        </pre>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.875rem', color: '#856404' }}>
            <strong>Note:</strong> Next.js doesn't provide built-in cache
            externalization. You'll need to implement a custom cache adapter
            or use a third-party solution. For Vercel deployments, this is
            handled automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

