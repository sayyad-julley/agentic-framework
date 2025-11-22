'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Component defined inside render
function ParentComponent() {
  const [value, setValue] = useState('');
  
  const ChildComponent = () => <div>{value}</div>; // New component on every render
  
  return <ChildComponent />; // Causes remounting
}`;

const workaroundCode = `// ✅ Good: Component defined outside
const ChildComponent = ({ value }: { value: string }) => <div>{value}</div>;

function ParentComponent() {
  const [value, setValue] = useState('');
  return <ChildComponent value={value} />; // Stable reference
}`;

export default function InlineComponentsPage() {
  return (
    <AntiPatternLayout
      title="6. Inline Component Creation"
      description="Creating components inside render function of another component causes remounting."
      impact="Forces component remounting on every render, state loss, focus loss, unnecessary side effects, performance degradation"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Defining a component inside another component's render function creates a new component type on every render. React treats this as a completely different component, causing it to unmount and remount, losing all internal state."
      workaroundExplanation="Define components outside the parent's render function to maintain stable references. React can then properly reconcile and preserve component state across renders."
    />
  );
}

