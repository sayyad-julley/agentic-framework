'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Stale closure
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Uses stale count value
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Missing count in dependencies
}`;

const workaroundCode = `// ✅ Good: Functional update
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // Always uses latest state
    }, 1000);
    return () => clearInterval(interval);
  }, []); // No dependency needed with functional update
}`;

export default function StaleClosuresPage() {
  return (
    <AntiPatternLayout
      title="5. Stale Closures in useEffect"
      description="Functions capturing outdated state/props from previous render cycles in useEffect or async callbacks."
      impact="Asynchronous bugs, logic operating on outdated values, incorrect behavior, race conditions"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="When useEffect captures state in its closure, it uses the value from when the effect was created. If the state changes but the effect doesn't re-run, it operates on stale data."
      workaroundExplanation="Use functional state updates (setState(prev => ...)) which always receive the latest state value. This eliminates the need to include state in the dependency array for simple updates."
    />
  );
}

