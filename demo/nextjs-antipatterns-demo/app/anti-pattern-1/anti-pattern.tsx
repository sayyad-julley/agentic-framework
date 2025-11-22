'use client';

// ❌ ANTI-PATTERN: Directly importing Server Component into Client Component
// This violates RSC isolation and will cause runtime errors
import { ServerDataComponent } from './server-component';

export function AntiPattern1() {
  return (
    <div>
      <h4>Client Component trying to import Server Component</h4>
      {/* This will fail - cannot import SC into CC */}
      {/* <ServerDataComponent /> */}
      <p style={{ color: '#c62828' }}>
        Error: Cannot import Server Component into Client Component
      </p>
    </div>
  );
}

