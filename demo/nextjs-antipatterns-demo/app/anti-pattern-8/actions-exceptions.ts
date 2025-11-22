'use server';

// ❌ ANTI-PATTERN: Throwing exceptions for expected errors
export async function createPostWithExceptions(formData: FormData) {
  const title = formData.get('title') as string;

  // ❌ Throwing exception for validation error (expected)
  if (!title) {
    throw new Error('Title is required');
  }

  // ❌ Throwing exception for conflict (expected)
  // if (await postExists(title)) {
  //   throw new Error('Post already exists');
  // }

  // ✅ Only throw for unexpected system failures
  // throw new Error('Database connection failed');

  return { success: true };
}

