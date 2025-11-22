// Server Component - fetches data on server
export async function ServerDataComponent() {
  // Simulate server-side data fetching
  const data = await new Promise<{ message: string }>((resolve) => {
    setTimeout(() => resolve({ message: 'Data fetched on server!' }), 100);
  });

  return (
    <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
      <p>
        <strong>Server Component:</strong> {data.message}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        This component runs on the server and can access databases, APIs, etc.
      </p>
    </div>
  );
}

