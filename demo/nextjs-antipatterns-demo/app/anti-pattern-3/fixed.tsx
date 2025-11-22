// ✅ FIXED: Server Component with fetch for reads
export async function Fixed3() {
  // ✅ Use fetch in Server Component for reads
  // This provides automatic de-duping, streaming, and cache optimization
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts', {
    next: { revalidate: 3600 }, // Cache for 1 hour
  }).then((res) => res.json());

  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Server Component with Fetch (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Automatic de-duping, streaming, and cache optimization
      </p>
      <ul style={{ marginTop: '1rem' }}>
        {posts.slice(0, 5).map((post: any) => (
          <li key={post.id} style={{ marginBottom: '0.5rem' }}>
            {post.title}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
        This data is fetched on the server, cached, and streamed to the client.
      </p>
    </div>
  );
}

