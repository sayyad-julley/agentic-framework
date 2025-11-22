'use server';

// ❌ ANTI-PATTERN: Server Action used for read operation
export async function getPosts() {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return [
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
    { id: '3', title: 'Post 3' },
  ];
}

