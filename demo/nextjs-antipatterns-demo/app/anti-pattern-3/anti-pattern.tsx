'use client';

import { useState } from 'react';
import { getPosts } from './actions';

// ❌ ANTI-PATTERN: Using Server Action for read operation
export function AntiPattern3() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    // ❌ Server Action used for read - loses de-duping, streaming, cache optimization
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  };

  return (
    <div>
      <h4>Using Server Action for Read (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ Loses automatic de-duping, streaming, and cache optimization
      </p>
      <button onClick={handleLoad} disabled={loading}>
        {loading ? 'Loading...' : 'Load Posts'}
      </button>
      {posts.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
