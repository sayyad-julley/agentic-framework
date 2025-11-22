'use server';

import { revalidatePath } from 'next/cache';

// ✅ FIXED: Return values for expected errors
export async function createPostWithReturnValues(
  prevState: { message: string; error: string | null },
  formData: FormData
) {
  const title = formData.get('title') as string;

  // ✅ Return error object for validation (expected error)
  if (!title) {
    return { message: '', error: 'Title is required' };
  }

  // ✅ Return error object for conflict (expected error)
  // if (await postExists(title)) {
  //   return { message: '', error: 'Post already exists' };
  // }

  // ✅ Only throw for unexpected system failures
  try {
    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    // await createPostInDatabase(title);
  } catch (err) {
    // Unexpected failure - return error (or throw if truly unexpected)
    return { message: '', error: 'Failed to create post' };
  }

  revalidatePath('/posts');
  return { message: 'Post created successfully!', error: null };
}

