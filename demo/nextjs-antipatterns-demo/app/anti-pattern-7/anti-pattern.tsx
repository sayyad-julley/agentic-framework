// ❌ ANTI-PATTERN: Browser API access in Server Component
export function AntiPattern7() {
  return (
    <div>
      <h4>Browser API in Server Component (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ Accessing browser APIs causes runtime errors
      </p>
      <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
        <p><strong>Common mistakes:</strong></p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Accessing window object</li>
          <li>Using localStorage</li>
          <li>Using sessionStorage</li>
          <li>Adding event handlers (onClick, onChange, etc.)</li>
          <li>Using browser-only APIs</li>
        </ul>
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ❌ ANTI-PATTERN: Server Component with browser APIs
export default function Page() {
  // ❌ Runtime error: window is not defined
  const width = window.innerWidth;

  // ❌ Runtime error: localStorage is not defined
  const theme = localStorage.getItem('theme');

  // ❌ Runtime error: onClick handler not allowed
  return (
    <button onClick={() => alert('clicked')}>
      Click me
    </button>
  );
}

// Error: ReferenceError: window is not defined`}
        </pre>
      </div>
    </div>
  );
}

