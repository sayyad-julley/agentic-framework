'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: No validation
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title }); // No validation, no auth check
}`;

const workaroundCode = `// ✅ Good: Validation and authorization
'use server';
import { z } from 'zod';

const postSchema = z.object({ title: z.string().min(1).max(100) });

export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const validated = postSchema.safeParse({ title: formData.get('title') });
  if (!validated.success) throw new Error('Validation failed');
  
  await db.posts.create({ title: validated.data.title, userId: user.id });
}`;

export default function MissingValidationPage() {
  return (
    <AntiPatternLayout
      title="12. Missing Validation in Server Actions"
      description="Server Actions without input validation and authorization checks."
      impact="Security vulnerabilities, data corruption, unauthorized access, injection attacks"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Server Actions are exposed endpoints that can be called from the client. Without validation and authorization, they're vulnerable to malicious input, unauthorized access, and data corruption."
      workaroundExplanation="Always validate input using schema validation libraries (like Zod) and check authorization before performing mutations. This prevents security vulnerabilities and ensures data integrity."
    />
  );
}

