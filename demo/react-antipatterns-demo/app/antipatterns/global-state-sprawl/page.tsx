'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Global state sprawl
const useStore = create((set) => ({
  count: 0,
  name: '',
  theme: 'light',
  cart: [],
  notifications: [],
  user: null,
  // ... everything in global store
}));`;

const workaroundCode = `// ✅ Good: Local state with selective global
function Counter() {
  const [count, setCount] = useState(0); // Local state
  return <div>{count}</div>;
}

// Only truly shared state in global store
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));`;

export default function GlobalStateSprawlPage() {
  return (
    <AntiPatternLayout
      title="14. Global State Sprawl"
      description="Moving too much state to global stores unnecessarily."
      impact="Reduced performance, increased complexity, harder to reason about state flow, unnecessary re-renders"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Putting all state in a global store makes it harder to reason about state flow, increases complexity, and can cause unnecessary re-renders when unrelated state changes."
      workaroundExplanation="Keep state local (useState, useReducer) by default. Only elevate to global when state is truly shared across distant components. This keeps state management simple and performant."
    />
  );
}

