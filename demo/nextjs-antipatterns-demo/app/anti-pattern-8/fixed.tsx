'use client';

import { useFormState } from 'react-dom';
import { createPostWithReturnValues } from './actions-return-values';

// ✅ FIXED: Using return values for expected errors
export function Fixed8() {
  const [state, formAction] = useFormState(
    createPostWithReturnValues,
    { message: '', error: null }
  );
  const pending = false; // useFormState doesn't provide pending in React 18

  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Return Values for Expected Errors (CORRECT)</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Return error objects for expected errors, exceptions only for
        unexpected failures
      </p>
      <form action={formAction}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit" disabled={pending}>
          {pending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      {state.error && (
        <p style={{ marginTop: '1rem', color: '#c62828' }}>{state.error}</p>
      )}
      {state.message && !state.error && (
        <p style={{ marginTop: '1rem', color: '#2e7d32' }}>{state.message}</p>
      )}
      <pre style={{ marginTop: '1rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// ✅ FIXED: Return values for expected errors
export async function createPost(
  prevState: { message: string; error: string | null },
  formData: FormData
) {
  const title = formData.get('title') as string;

  // ✅ Return error object for validation (expected)
  if (!title) {
    return { message: '', error: 'Title is required' };
  }

  // ✅ Return error object for conflict (expected)
  if (await postExists(title)) {
    return { message: '', error: 'Post already exists' };
  }

  // ✅ Only throw for unexpected system failures
  try {
    await createPostInDatabase(title);
  } catch (err) {
    // Unexpected failure - can throw or return error
    return { message: '', error: 'Failed to create post' };
  }

  return { message: 'Post created!', error: null };
}

// Client uses useActionState - no try/catch needed
const [state, formAction] = useActionState(createPost, initialState);`}
      </pre>
    </div>
  );
}

