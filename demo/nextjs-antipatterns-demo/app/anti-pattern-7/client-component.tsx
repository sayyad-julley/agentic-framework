'use client';

import { useState, useEffect } from 'react';

// ✅ FIXED: Client Component with browser APIs
export function ClientBrowserComponent() {
  const [width, setWidth] = useState(0);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Browser APIs work in Client Components
    setWidth(window.innerWidth);
    setTheme(localStorage.getItem('theme'));

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', marginTop: '1rem' }}>
      <p>
        <strong>Window Width:</strong> {width}px
      </p>
      <p>
        <strong>Theme:</strong> {theme || 'default'}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
        ✅ Browser APIs work correctly in Client Components
      </p>
    </div>
  );
}

