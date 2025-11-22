import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">
        Client-Side Fetching Demo
      </h1>
      <p className="text-lg mb-4">
        This demo demonstrates the &quot;Flash of Loading State&quot; issue when
        data is fetched entirely on the client side without server-side
        pre-fetching.
      </p>
      <div className="mt-8">
        <Link
          href="/posts"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          View Posts (See Loading Flash)
        </Link>
      </div>
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">What to Observe:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            When you navigate to /posts, you will see a red &quot;Loading...&quot;
            message
          </li>
          <li>
            This loading state appears because the data is fetched entirely on
            the client
          </li>
          <li>
            No server-side pre-fetching is used (no initialData in useQuery)
          </li>
          <li>
            The 2-second delay makes the loading state clearly visible
          </li>
        </ul>
      </div>
    </div>
  )
}

