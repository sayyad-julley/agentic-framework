export interface Post {
  id: number
  title: string
  body: string
  userId: number
}

/**
 * Mock API function that simulates fetching posts with a 2-second delay
 * This delay is intentional to demonstrate the "Flash of Loading" issue
 */
export async function getPosts(): Promise<Post[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock data
  return [
    {
      id: 1,
      title: 'Understanding Client-Side Fetching',
      body: 'This post demonstrates the flash of loading state when data is fetched entirely on the client.',
      userId: 1,
    },
    {
      id: 2,
      title: 'Next.js App Router Best Practices',
      body: 'Learn how to optimize data fetching in Next.js App Router applications.',
      userId: 1,
    },
    {
      id: 3,
      title: 'TanStack Query Integration',
      body: 'Explore how to integrate TanStack Query with Next.js for efficient data management.',
      userId: 2,
    },
  ]
}

