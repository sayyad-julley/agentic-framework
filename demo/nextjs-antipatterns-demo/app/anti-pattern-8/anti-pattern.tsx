'use client';

import { useState } from 'react';
import { createPostWithExceptions } from './actions-exceptions';

// ❌ ANTI-PATTERN: Throwing exceptions for expected errors
export function AntiPattern8() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ❌ Server Action throws exceptions for expected errors
      await createPostWithExceptions(new FormData(e.currentTarget));
      setError('Success!');
    } catch (err: any) {
      // ❌ Must use try/catch for expected errors (validation, conflicts)
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Throwing Exceptions for Expected Errors (WRONG)</h4>
      <p style={{ color: '#c62828' }}>
        ❌ Exceptions for expected errors make error handling difficult
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      {error && (
        <p
          style={{
            marginTop: '1rem',
            color: error.includes('Success') ? '#2e7d32' : '#c62828',
          }}
        >
          {error}
        </p>
      )}
      <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ❌ ANTI-PATTERN: Throwing for expected errors
export async function createPost(data: FormData) {
  if (!data.get('title')) {
    throw new Error('Title required'); // ❌ Exception for validation
  }

  if (await postExists(data.get('title'))) {
    throw new Error('Post already exists'); // ❌ Exception for conflict
  }

  // Client must use try/catch for expected errors
  try {
    await createPost(data);
  } catch (err) {
    // Handle expected errors with try/catch
  }
}`}
      </pre>
    </div>
  );
}

