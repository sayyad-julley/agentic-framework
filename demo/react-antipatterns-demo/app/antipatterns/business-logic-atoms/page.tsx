'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Business logic in Atom
function Button({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser); // Business logic in Atom
  }, [userId]);
  
  return <button>{user?.name || 'Loading'}</button>;
}`;

const workaroundCode = `// ✅ Good: Atom is presentational only
function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}

// Logic in Custom Hook or Organism
function useUser(userId: string) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  return user;
}

// Usage in Organism
function UserButton({ userId }: { userId: string }) {
  const user = useUser(userId);
  return <Button label={user?.name || 'Loading'} onClick={() => {}} />;
}`;

export default function BusinessLogicAtomsPage() {
  return (
    <AntiPatternLayout
      title="2. Business Logic in Atoms"
      description="Placing complex business logic or stateful operations in atomic components breaks reusability principle."
      impact="Breaks reusability principle, creates maintenance debt, violates separation of concerns, makes Atoms tightly coupled to business logic"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Atoms should be pure, presentational components. Mixing business logic (like data fetching) into atoms makes them non-reusable and tightly coupled to specific use cases."
      workaroundExplanation="Keep atoms purely presentational. Extract business logic into custom hooks or place it in organisms (higher-level components). This maintains separation of concerns and reusability."
    />
  );
}

