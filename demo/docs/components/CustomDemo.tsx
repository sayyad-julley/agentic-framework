import { useMemo, useCallback, useState } from 'react';

interface CustomDemoProps {
  initialCount?: number;
}

export function CustomDemo({ initialCount = 0 }: CustomDemoProps) {
  const [count, setCount] = useState(initialCount);
  const [items, setItems] = useState<string[]>([]);

  // Pattern 3: Performance-Optimized Custom Components
  // Apply: Memoize expensive computations with useMemo
  const expensiveComputation = useMemo(() => {
    // Simulate expensive computation
    let result = 0;
    for (let i = 0; i < count * 1000; i++) {
      result += i;
    }
    return result;
  }, [count]);

  // Pattern 3: Performance-Optimized Custom Components
  // Apply: Use useCallback for event handlers
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, `Item ${prev.length + 1}`]);
  }, []);

  // Pattern 3: Performance-Optimized Custom Components
  // Apply: Modular structure prevents cascading re-renders
  return (
    <div className="w-full p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <h3 className="text-xl font-bold mb-4">Interactive Counter Demo</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-lg">Count: <strong>{count}</strong></p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Computed Value: {expensiveComputation}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleIncrement}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment
          </button>
          <button
            onClick={handleDecrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Decrement
          </button>
        </div>

        <div>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
          >
            Add Item
          </button>
          {items.length > 0 && (
            <ul className="list-disc list-inside">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

