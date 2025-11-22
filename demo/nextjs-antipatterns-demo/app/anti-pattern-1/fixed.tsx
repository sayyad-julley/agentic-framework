'use client';

import { useState } from 'react';

// ✅ FIXED: Client Component accepts children prop
export function Fixed1({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <p style={{ color: '#2e7d32' }}>
          ✅ Client Component accepts Server Component as children
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem' }}>
      <h4>Modal (Client Component)</h4>
      <div style={{ marginBottom: '1rem' }}>{children}</div>
      <button onClick={() => setIsOpen(false)}>Close</button>
    </div>
  );
}

