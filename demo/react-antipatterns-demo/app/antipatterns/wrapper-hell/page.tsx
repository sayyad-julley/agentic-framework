'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Wrapper hell
const EnhancedComponent = withTheme(
  withAuth(
    withRouter(
      withAnalytics(Component) // Deep nesting
    )
  )
);`;

const workaroundCode = `// ✅ Good: Custom Hooks
function Component() {
  const theme = useTheme();
  const user = useAuth();
  const router = useRouter();
  const analytics = useAnalytics();
  // Clean, composable logic
}`;

export default function WrapperHellPage() {
  return (
    <AntiPatternLayout
      title="13. Wrapper Hell (Excessive HOC Nesting)"
      description="Deeply nested Higher-Order Components creating complex component trees."
      impact="Difficult debugging, prop namespace collisions, reduced readability, performance overhead, hard to trace data flow"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Deeply nested HOCs create complex component hierarchies that are hard to debug, can cause prop namespace collisions, and make data flow difficult to trace."
      workaroundExplanation="Prefer Custom Hooks for reusable logic. They're composable, easier to debug, and don't create wrapper components. Use HOCs sparingly only for cross-cutting concerns like error boundaries."
    />
  );
}

