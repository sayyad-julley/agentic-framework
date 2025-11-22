'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Legacy API
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));`;

const workaroundCode = `// ✅ Good: Modern API
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`;

export default function LegacyRenderPage() {
  return (
    <AntiPatternLayout
      title="1. Legacy ReactDOM.render Usage"
      description="Using ReactDOM.render instead of createRoot API prevents concurrent rendering benefits."
      impact="Blocks React 18 scheduler, prevents useTransition/useDeferredValue from working, no concurrent rendering benefits"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="The legacy ReactDOM.render API doesn't support React 18's concurrent features. This prevents the scheduler from managing update priorities and blocks concurrent rendering optimizations."
      workaroundExplanation="The createRoot API is the modern way to initialize React 18 applications. It enables concurrent rendering, allowing React to interrupt and resume rendering tasks for better UX and responsiveness."
    />
  );
}

