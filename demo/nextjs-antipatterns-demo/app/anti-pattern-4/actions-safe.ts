'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// ✅ FIXED: Server Action with validation and auth

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
});

// Mock auth function
async function getCurrentUser() {
  // In real app, verify JWT token, session, etc.
  return { id: 'user-1', hasPermission: (perm: string) => perm === 'create:post' };
}

export async function createPostSafe(
  prevState: { message: string; errors?: Record<string, string> },
  formData: FormData
) {
  // ✅ Step 1: Validate input with Zod
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
  };

  const validated = createPostSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      message: 'Validation failed',
      errors: validated.error.errors.reduce(
        (acc, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        },
        {} as Record<string, string>
      ),
    };
  }

  // ✅ Step 2: Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return { message: 'Error: Unauthorized - please log in' };
  }

  // ✅ Step 3: Check authorization
  if (!user.hasPermission('create:post')) {
    return { message: 'Error: Forbidden - insufficient permissions' };
  }

  // ✅ Step 4: Perform mutation (with validated data)
  // await createPostInDatabase(validated.data);

  // ✅ Step 5: Revalidate cache
  revalidatePath('/posts');

  return { message: 'Post created successfully!' };
}

