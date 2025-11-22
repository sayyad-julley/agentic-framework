import { ClientDateDisplay } from './client-component';

// Server Component - serializes data before passing to client
export async function Fixed2() {
  const date = new Date();

  // ✅ FIXED: Serialize Date to ISO string
  const serializedDate = date.toISOString();

  return <ClientDateDisplay date={serializedDate} />;
}
