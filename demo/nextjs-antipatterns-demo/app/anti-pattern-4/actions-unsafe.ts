'use server';

// ❌ ANTI-PATTERN: Server Action without validation or auth
export async function createPostUnsafe(formData: FormData) {
  // ❌ No validation - accepts any input
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // ❌ No authentication check - anyone can call this
  // ❌ No authorization check - no permission verification

  // Directly save to database without checks
  // This is vulnerable to:
  // - SQL injection (if not using parameterized queries)
  // - XSS attacks (if not sanitizing)
  // - Unauthorized access
  // - Invalid data

  return { message: 'Post created (unsafe!)' };
}

