'use client';

import { useState } from 'react';
import { createPostUnsafe } from './actions-unsafe';

// ❌ ANTI-PATTERN: Using Server Action without validation/auth
export function AntiPattern4() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // ❌ No validation, no auth check - vulnerable!
    const result = await createPostUnsafe(formData);
    setMessage(result.message || '');
  };

  return (
    <div>
      <h4>Server Action Without Validation/Auth (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ No input validation, no authentication check - vulnerable to attacks
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <textarea
          name="content"
          placeholder="Content"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit">Create Post</button>
      </form>
      {message && (
        <p style={{ marginTop: '1rem', color: message.includes('Error') ? '#c62828' : '#2e7d32' }}>
          {message}
        </p>
      )}
    </div>
  );
}

