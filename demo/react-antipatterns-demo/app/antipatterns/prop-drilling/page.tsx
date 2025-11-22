'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Prop drilling
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />; // user not used in Layout
}

function Layout({ user }) {
  return <Header user={user} />; // user not used in Header
}

function Header({ user }) {
  return <UserMenu user={user} />; // Finally used here
}`;

const workaroundCode = `// ✅ Good: Context API
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function UserMenu() {
  const user = useContext(UserContext); // Direct access
  return <div>{user?.name}</div>;
}`;

export default function PropDrillingPage() {
  return (
    <AntiPatternLayout
      title="7. Prop Drilling"
      description="Manually passing data through multiple intermediate components that don't need it."
      impact="High coupling, reduced maintainability, verbose code, fragile component structure, difficult refactoring"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Prop drilling forces intermediate components to accept and pass props they don't use, creating unnecessary coupling. This makes refactoring difficult and code harder to maintain."
      workaroundExplanation="Use Context API for global data that needs to be accessed by distant components. This eliminates the need for intermediate components to know about data they don't use."
    />
  );
}

