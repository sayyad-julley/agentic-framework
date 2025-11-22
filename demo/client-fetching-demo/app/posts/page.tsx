'use client'

import { useQuery } from '@tanstack/react-query'
import { getPosts } from '@/lib/api'

export default function PostsPage() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    // Intentionally NOT using initialData or any server-side pre-fetching
    // This causes the "Flash of Loading State" issue
  })

  if (isLoading) {
    return (
      <div className="text-red-500 text-xl">
        Loading... (Issue: Flash of Loading State)
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-xl">
        Error: {error instanceof Error ? error.message : 'Failed to fetch posts'}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Posts</h1>
      <div className="space-y-4">
        {posts?.map((post) => (
          <article
            key={post.id}
            className="border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.body}</p>
            <div className="mt-4 text-sm text-gray-500">
              Post ID: {post.id} | User ID: {post.userId}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

