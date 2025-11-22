'use client';

import { useFormState } from 'react-dom';
import { createPostSafe } from './actions-safe';

// ✅ FIXED: Using Server Action with validation and auth
export function Fixed4() {
  const [state, formAction] = useFormState(createPostSafe, {
    message: '',
    errors: {},
  });
  const pending = false; // useFormState doesn't provide pending in React 18

  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Server Action With Validation & Auth (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Zod validation + authentication + authorization checks
      </p>
      <form action={formAction}>
        <input
          type="text"
          name="title"
          placeholder="Title (min 1, max 100 chars)"
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        {state.errors?.title && (
          <p style={{ color: '#c62828', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {state.errors.title}
          </p>
        )}
        <textarea
          name="content"
          placeholder="Content (min 1 char)"
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        {state.errors?.content && (
          <p style={{ color: '#c62828', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {state.errors.content}
          </p>
        )}
        <button type="submit" disabled={pending}>
          {pending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      {state.message && (
        <p
          style={{
            marginTop: '1rem',
            color: state.message.includes('Error') ? '#c62828' : '#2e7d32',
          }}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

