'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: All state in App
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // ... many more states
  
  return (
    <div>
      <Header user={user} theme={theme} />
      <Sidebar cart={cart} notifications={notifications} />
      <MainContent user={user} cart={cart} />
    </div>
  );
}`;

const workaroundCode = `// ✅ Good: State colocated in lowest common ancestor
function CartSection() {
  const [cart, setCart] = useState([]); // Colocated
  return <CartDisplay cart={cart} />;
}

function App() {
  const [user, setUser] = useState(null); // Only truly global state
  return (
    <AuthProvider value={{ user, setUser }}>
      <Header />
      <CartSection />
      <MainContent />
    </AuthProvider>
  );
}`;

export default function StateLiftingPage() {
  return (
    <AntiPatternLayout
      title="3. Everything in App State Lifting"
      description="Lifting too much state to root App component unnecessarily forces wide re-renders."
      impact="Forces wide, costly re-renders across entire application, performance degradation, unnecessary component updates"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="When all state lives in the root App component, any state change triggers a re-render of the entire component tree, even for components that don't use that state."
      workaroundExplanation="Colocate state in the lowest common ancestor that actually needs it. Only lift state to App (or use Context/global state) when it's truly shared across distant components."
    />
  );
}

