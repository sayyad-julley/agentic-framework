'use client';

// Client Component - receives serialized data
export function ClientDateDisplay({ date }: { date: string }) {
  // ✅ FIXED: Deserialize in client component
  const dateObj = new Date(date);

  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
      <h4>Client Component with serialized props</h4>
      <p style={{ color: '#2e7d32' }}>
        ✅ Date serialized as ISO string, deserialized in client
      </p>
      <p>
        <strong>Date:</strong> {dateObj.toLocaleString()}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Original ISO string: {date}
      </p>
    </div>
  );
}

