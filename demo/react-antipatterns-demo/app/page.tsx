'use client';

import Link from 'next/link';
import { Card, Typography, Space, Tag } from 'antd';

const { Title, Paragraph } = Typography;

const antipatterns = [
  {
    id: 1,
    title: 'Legacy ReactDOM.render Usage',
    description: 'Using ReactDOM.render instead of createRoot API prevents concurrent rendering benefits.',
    impact: 'Blocks React 18 scheduler, prevents useTransition/useDeferredValue from working',
    route: '/antipatterns/legacy-render',
  },
  {
    id: 2,
    title: 'Business Logic in Atoms',
    description: 'Placing complex business logic or stateful operations in atomic components breaks reusability principle.',
    impact: 'Breaks reusability principle, creates maintenance debt, violates separation of concerns',
    route: '/antipatterns/business-logic-atoms',
  },
  {
    id: 3,
    title: 'Everything in App State Lifting',
    description: 'Lifting too much state to root App component unnecessarily forces wide re-renders.',
    impact: 'Forces wide, costly re-renders across entire application, performance degradation',
    route: '/antipatterns/state-lifting',
  },
  {
    id: 4,
    title: 'Context for High-Frequency Updates',
    description: 'Using Context API for frequently changing data causes performance issues.',
    impact: 'Forces unnecessary re-renders of all consumers, severe performance bottlenecks',
    route: '/antipatterns/context-high-frequency',
  },
  {
    id: 5,
    title: 'Stale Closures in useEffect',
    description: 'Functions capturing outdated state/props from previous render cycles in useEffect or async callbacks.',
    impact: 'Asynchronous bugs, logic operating on outdated values, incorrect behavior',
    route: '/antipatterns/stale-closures',
  },
  {
    id: 6,
    title: 'Inline Component Creation',
    description: 'Creating components inside render function of another component causes remounting.',
    impact: 'Forces component remounting on every render, state loss, focus loss',
    route: '/antipatterns/inline-components',
  },
  {
    id: 7,
    title: 'Prop Drilling',
    description: 'Manually passing data through multiple intermediate components that don\'t need it.',
    impact: 'High coupling, reduced maintainability, verbose code, fragile component structure',
    route: '/antipatterns/prop-drilling',
  },
  {
    id: 8,
    title: 'Premature/Excessive Memoization',
    description: 'Overusing useMemo/useCallback on cheap components or frequently changing props.',
    impact: 'Overhead cost of dependency comparison negates minimal rendering savings',
    route: '/antipatterns/premature-memoization',
  },
  {
    id: 9,
    title: 'Manual useEffect Data Fetching',
    description: 'Using useEffect for server state management (data fetching, caching, synchronization).',
    impact: 'Redundant manual management, missing features (automatic caching, stale data invalidation)',
    route: '/antipatterns/manual-fetching',
  },
  {
    id: 10,
    title: 'Direct Server Component Import into Client Component',
    description: 'Importing Server Components directly into Client Component modules (Next.js App Router).',
    impact: 'Breaks React Server Components architecture, runtime errors, hydration mismatches',
    route: '/antipatterns/server-component-import',
  },
  {
    id: 11,
    title: 'Non-Serializable Props',
    description: 'Passing non-serializable data (functions, class instances, Date objects) to Server Components.',
    impact: 'Serialization errors, hydration mismatches, runtime failures',
    route: '/antipatterns/non-serializable-props',
  },
  {
    id: 12,
    title: 'Missing Validation in Server Actions',
    description: 'Server Actions without input validation and authorization checks.',
    impact: 'Security vulnerabilities, data corruption, unauthorized access, injection attacks',
    route: '/antipatterns/missing-validation',
  },
  {
    id: 13,
    title: 'Wrapper Hell (Excessive HOC Nesting)',
    description: 'Deeply nested Higher-Order Components creating complex component trees.',
    impact: 'Difficult debugging, prop namespace collisions, reduced readability',
    route: '/antipatterns/wrapper-hell',
  },
  {
    id: 14,
    title: 'Global State Sprawl',
    description: 'Moving too much state to global stores unnecessarily.',
    impact: 'Reduced performance, increased complexity, harder to reason about state flow',
    route: '/antipatterns/global-state-sprawl',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Title level={1}>React Anti-Patterns Demo</Title>
            <Paragraph>
              Interactive demonstration of 14 common React 18 anti-patterns and their workarounds.
              Click on any anti-pattern to see both the problematic code and the recommended solution.
            </Paragraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {antipatterns.map((antipattern) => (
              <Link key={antipattern.id} href={antipattern.route}>
                <Card
                  hoverable
                  className="h-full"
                  title={
                    <div className="flex items-center gap-2">
                      <span>#{antipattern.id}</span>
                      <span>{antipattern.title}</span>
                    </div>
                  }
                >
                  <Paragraph className="text-sm text-gray-600 dark:text-gray-400">
                    {antipattern.description}
                  </Paragraph>
                  <Tag color="red" className="mt-2">
                    Impact: {antipattern.impact.split(',')[0]}...
                  </Tag>
                </Card>
              </Link>
            ))}
          </div>
        </Space>
      </div>
    </div>
  );
}

