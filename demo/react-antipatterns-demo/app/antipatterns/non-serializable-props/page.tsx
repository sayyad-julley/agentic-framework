'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Non-serializable props
function ServerComponent({ onClick, date }: { onClick: () => void; date: Date }) {
  return <button onClick={onClick}>{date.toISOString()}</button>; // Error
}`;

const workaroundCode = `// ✅ Good: Serializable props
function ServerComponent({ dateString }: { dateString: string }) {
  const date = new Date(dateString); // Deserialize in component
  return <div>{date.toISOString()}</div>;
}

// Pass serialized data
<ServerComponent dateString={date.toISOString()} />`;

export default function NonSerializablePropsPage() {
  return (
    <AntiPatternLayout
      title="11. Non-Serializable Props"
      description="Passing non-serializable data (functions, class instances, Date objects) to Server Components."
      impact="Serialization errors, hydration mismatches, runtime failures"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Server Components run on the server and their props must be serialized to be sent over the network. Functions, class instances, and Date objects cannot be serialized, causing errors."
      workaroundExplanation="Pass only serializable data (primitives, plain objects, arrays). Serialize complex types (like Date) to strings and deserialize them in the component. Use Server Actions for mutations instead of passing functions."
    />
  );
}

