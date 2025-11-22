'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Premature memoization
function SimpleComponent({ name }: { name: string }) {
  const memoizedName = useMemo(() => name.toUpperCase(), [name]); // Unnecessary
  const handleClick = useCallback(() => console.log(name), [name]); // Unnecessary
  
  return <button onClick={handleClick}>{memoizedName}</button>;
}`;

const workaroundCode = `// ✅ Good: Memoize only expensive operations
function ExpensiveComponent({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.price - b.price); // Expensive operation
  }, [items]);
  
  return <div>{sortedItems.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}`;

export default function PrematureMemoizationPage() {
  return (
    <AntiPatternLayout
      title="8. Premature/Excessive Memoization"
      description="Overusing useMemo/useCallback on cheap components or frequently changing props."
      impact="Overhead cost of dependency comparison negates minimal rendering savings, unnecessary complexity, harder to maintain"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Memoization has overhead: React must compare dependencies on every render. For cheap operations like string.toUpperCase(), the comparison cost often exceeds the computation cost, making memoization counterproductive."
      workaroundExplanation="Only memoize expensive computations (complex filtering, sorting, transformations) and stable function references passed to memoized components. Profile first to identify actual bottlenecks."
    />
  );
}

