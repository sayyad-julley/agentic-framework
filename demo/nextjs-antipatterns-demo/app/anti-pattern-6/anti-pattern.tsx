// ❌ ANTI-PATTERN: Heavy computation in middleware
export function AntiPattern6() {
  return (
    <div>
      <h4>Heavy Computation in Middleware (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ Heavy operations cause latency and timeouts
      </p>
      <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
        <p><strong>Problems with heavy middleware:</strong></p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Runs on every request before route matching</li>
          <li>Blocks request processing</li>
          <li>Can cause timeouts</li>
          <li>Increases latency</li>
          <li>Edge runtime limitations</li>
        </ul>
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ❌ ANTI-PATTERN: Heavy computation
export function middleware(request: NextRequest) {
  // ❌ Database query - too slow!
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { posts: true, comments: true }
  });

  // ❌ Complex computation
  const analytics = await calculateAnalytics(user);

  // ❌ External API call
  const externalData = await fetch('https://api.example.com/data');

  return NextResponse.next();
}

// Result: High latency, timeouts, poor UX`}
        </pre>
      </div>
    </div>
  );
}

