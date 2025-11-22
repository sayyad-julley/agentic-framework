'use client';

// ❌ ANTI-PATTERN: Receiving non-serializable props
// This will cause hydration errors
export function AntiPattern2({
  date,
  callback,
}: {
  date: Date; // ❌ Date object is not serializable
  callback: () => void; // ❌ Function is not serializable
}) {
  return (
    <div>
      <h4>Client Component receiving non-serializable props</h4>
      <p style={{ color: '#c62828' }}>
        Error: Cannot serialize Date objects or functions across RSC boundary
      </p>
      <p>Date: {date.toString()}</p>
      <button onClick={callback}>Call Function</button>
    </div>
  );
}

