// ✅ FIXED: Lightweight middleware
export function Fixed6() {
  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Lightweight Middleware (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Keep lightweight: auth checks, redirects, logging only
      </p>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Best practices for middleware:</strong></p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Lightweight auth checks (cookie/token validation)</li>
          <li>Simple redirects based on auth state</li>
          <li>Request logging</li>
          <li>Header manipulation</li>
          <li>Move heavy operations to route handlers or Server Actions</li>
        </ul>
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ✅ FIXED: Lightweight middleware
export function middleware(request: NextRequest) {
  // ✅ Lightweight: Cookie check only
  const token = request.cookies.get('auth-token')?.value;

  // ✅ Lightweight: Simple redirect
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Lightweight: Logging
  console.log(\`\${request.method} \${request.nextUrl.pathname}\`);

  // ✅ Heavy operations moved to route handlers/Server Actions
  // - Database queries → Server Components/Route Handlers
  // - Complex computation → Server Actions
  // - External API calls → Server Components

  return NextResponse.next();
}

// Result: Fast, efficient, no timeouts`}
        </pre>
      </div>
    </div>
  );
}

