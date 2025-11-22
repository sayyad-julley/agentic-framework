'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Direct SC import into CC
'use client';
import { ServerComponent } from './ServerComponent'; // Error

function ClientComponent() {
  return <ServerComponent />; // Cannot import SC into CC
}`;

const workaroundCode = `// ✅ Good: Component interleaving
'use client';
function ClientComponent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

// Server Component
import { ClientComponent } from './ClientComponent';
import { ServerData } from './ServerData';

export default function Page() {
  return (
    <ClientComponent>
      <ServerData /> {/* SC passed as children */}
    </ClientComponent>
  );
}`;

export default function ServerComponentImportPage() {
  return (
    <AntiPatternLayout
      title="10. Direct Server Component Import into Client Component"
      description="Importing Server Components directly into Client Component modules (Next.js App Router)."
      impact="Breaks React Server Components architecture, runtime errors, hydration mismatches"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Server Components cannot be imported into Client Components because they run in different environments. This breaks the React Server Components architecture and causes runtime errors."
      workaroundExplanation="Use component interleaving: pass Server Components as children props to Client Components. This maintains the server/client boundary while allowing composition."
    />
  );
}

