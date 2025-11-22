'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Manual data fetching
function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []); // Missing caching, refetching, error recovery
}`;

const workaroundCode = `// ✅ Good: React Query
import { useQuery } from '@tanstack/react-query';

function ProductsList() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json()),
  }); // Automatic caching, refetching, error handling
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}`;

export default function ManualFetchingPage() {
  return (
    <AntiPatternLayout
      title="9. Manual useEffect Data Fetching"
      description="Using useEffect for server state management (data fetching, caching, synchronization, error handling)."
      impact="Redundant manual management, missing features (automatic caching, stale data invalidation, error recovery), boilerplate code"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Manual data fetching with useEffect requires you to manually handle loading states, errors, caching, refetching, and synchronization. This leads to boilerplate and missing features."
      workaroundExplanation="Use specialized libraries like React Query or RTK Query for server state management. They provide automatic caching, background refetching, error recovery, and synchronization out of the box."
    />
  );
}

