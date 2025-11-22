import { ClientBrowserComponent } from './client-component';

// ✅ FIXED: Server Component delegates browser APIs to Client Component
export function Fixed7() {
  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Client Component for Browser APIs (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Mark component with 'use client' if browser APIs are needed
      </p>
      <div style={{ marginTop: '1rem' }}>
        <ClientBrowserComponent />
        <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ✅ FIXED: Server Component (no browser APIs)
export default function Page() {
  // ✅ Server-side data fetching
  const data = await fetchData();

  // ✅ Delegate browser APIs to Client Component
  return (
    <div>
      <ServerData data={data} />
      <ClientBrowserComponent />
    </div>
  );
}

// ✅ Client Component (browser APIs allowed)
'use client';
export function ClientBrowserComponent() {
  const [width, setWidth] = useState(window.innerWidth);
  const theme = localStorage.getItem('theme');

  return <div>Window width: {width}</div>;
}`}
        </pre>
      </div>
    </div>
  );
}

