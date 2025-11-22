---
name: implementing-react-18-architecture
description: Implements React 18 scalable architecture by applying concurrent rendering patterns (useTransition, useDeferredValue, createRoot), component composition (Custom Hooks, Compound Components, Atomic Design), state management (local colocation, Context for static data, Zustand/React Query for dynamic data), performance optimization (strategic memoization, code splitting), implementing workarounds (functional state updates, component definition outside render), and avoiding anti-patterns (legacy ReactDOM.render, business logic in Atoms, Context for high-frequency updates, stale closures, inline component creation, prop drilling, premature memoization). Use when building scalable React 18 applications, implementing concurrent features, setting up component architecture, managing state, optimizing performance, or avoiding common React pitfalls.
version: 1.0.0
dependencies:
  - react>=18.3.1
  - typescript>=5.0.0
---

# Implementing React 18 Architecture

## Overview

React 18 introduces Concurrent Rendering through a sophisticated update scheduler that allows React to interrupt and resume rendering tasks, improving UX and responsiveness. This skill provides architectural patterns for building scalable React 18 applications, emphasizing component taxonomy (Atomic Design), state management strategies (local, global, server state separation), performance optimization (memoization, code splitting), and critical anti-pattern avoidance. The architecture prioritizes discipline over complexity, ensuring state granularity, proper colocation, and strategic use of concurrent hooks as a performance optimization layer.

## When to Use

Use this skill when:
- Building scalable React 18 applications requiring architectural discipline
- Implementing concurrent features (useTransition, useDeferredValue)
- Setting up component architecture following Atomic Design principles
- Managing state across local, global, and server state categories
- Optimizing performance with strategic memoization and code splitting
- Avoiding common React pitfalls (stale closures, remounting, prop drilling, Context misuse)
- Implementing component composition patterns (Custom Hooks, Compound Components)
- Setting up error boundaries, portals, and form management

**Input format**: React 18.3.1+ project, TypeScript configuration, understanding of hooks and component lifecycle, modern build system (Vite/Next.js)

**Expected output**: Production-ready React 18 implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- React 18.3.1+ project setup
- TypeScript configuration for type safety
- Understanding of React hooks and component lifecycle
- Modern build system (Vite or Next.js) for optimized bundle outputs
- Access to state management libraries (Zustand, React Query) if needed

## Execution Steps

### Step 1: Concurrent Rendering Patterns

React 18's Concurrent Rendering operates through a scheduler that manages update priority, allowing urgent updates (user input) to interrupt non-urgent updates (heavy computations).

**Pattern**: useTransition for Non-Urgent Updates
**Best Practice**: Wrap state updates that can be deferred in startTransition
**Anti-Pattern**: Using legacy ReactDOM.render instead of createRoot

**useTransition Template**:
```typescript
import { useTransition } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab); // Non-urgent: can be interrupted
    });
  }

  return (
    <>
      {isPending && <Spinner />}
      <TabButton onClick={() => selectTab('about')}>About</TabButton>
      <TabButton onClick={() => selectTab('posts')}>Posts</TabButton>
      <TabButton onClick={() => selectTab('contact')}>Contact</TabButton>
      <TabContent tab={tab} />
    </>
  );
}
```

**Pattern**: useDeferredValue for UI Stabilization
**Best Practice**: Defer heavy rendering tasks linked to fast-changing inputs
**Anti-Pattern**: Rendering heavy components directly from input state

**useDeferredValue Template**:
```typescript
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {query !== deferredQuery && <p>Loading results...</p>}
      <HeavyList query={deferredQuery} />
    </>
  );
}
```

**Best Practice**: Initialize with createRoot API
```typescript
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### Step 2: Component Architecture (Atomic Design)

Atomic Design provides a rigorous taxonomy for organizing components into five hierarchy levels: Atoms (fundamental UI blocks), Molecules (groups of Atoms), Organisms (complex components with state), Templates (layout structure), Pages (data-populated instances).

**Pattern**: Atomic Design Hierarchy
**Best Practice**: Strict separation of concerns (Atoms = presentational only)
**Anti-Pattern**: Business logic in Atoms, "Everything in App" state lifting

**Atom Component Template**:
```typescript
// components/atoms/Button.tsx
import React, { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled?: boolean;
}

const Button: FC<ButtonProps> = ({ label, onClick, isDisabled = false }) => {
  return (
    <button
      className="btn-primary"
      onClick={onClick}
      disabled={isDisabled}
    >
      {label}
    </button>
  );
};

export default Button;
```

**Organism with Colocated State Template**:
```typescript
// components/organisms/SearchInput.tsx
import { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

export function SearchInput() {
  const [query, setQuery] = useState(''); // Colocated state

  return (
    <div className="search-input">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button label="Search" onClick={() => handleSearch(query)} />
    </div>
  );
}
```

**Best Practice**: File and state colocation - keep related files close, state in lowest common ancestor

### Step 3: Component Composition Patterns

Modern React prioritizes composable, hook-based solutions over deeply nested wrappers.

**Pattern**: Custom Hooks for Reusable Logic
**Best Practice**: Extract stateful logic into Custom Hooks, decouple from view layer
**Anti-Pattern**: Wrapper hell (excessive HOC nesting), prop drilling

**Custom Hook Template**:
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**Pattern**: Compound Components with Context API
**Best Practice**: Use Context API locally for implicit state sharing between related components
**Anti-Pattern**: Prop drilling through multiple layers

**Compound Component Template**:
```typescript
// components/Tabs.tsx
import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface TabsContextType {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.Panel = function TabsPanel({ index, children }: { index: number; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs.Panel must be used within Tabs');
  
  return context.selectedIndex === index ? <div>{children}</div> : null;
};
```

### Step 4: State Management Strategy

State must be segmented into local, global (UI), and server (data fetching) categories, choosing specialized tools for each.

**Pattern**: Local State (useState, useReducer)
**Best Practice**: State colocation in lowest common ancestor
**Anti-Pattern**: Global state sprawl, "Everything in App" state lifting

**useReducer Template**:
```typescript
import { useReducer } from 'react';

interface State {
  count: number;
  step: number;
}

type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'reset':
      return { ...state, count: 0 };
    case 'setStep':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  return (
    <>
      <input value={state.step} onChange={(e) => dispatch({ type: 'setStep', step: Number(e.target.value) })} />
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

**Pattern**: Global State Selection
**Best Practice**: Context for static/rarely-changing data, subscription-based libraries for high-frequency updates
**Anti-Pattern**: Context for high-frequency updates

**Context Provider Template**:
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface User {
  name: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Zustand Store Template**:
```typescript
// stores/useCounterStore.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Step 5: Server State Management

Server state (data fetching, caching, loading states, synchronization, error handling) is functionally distinct from client UI state and should be managed by specialized libraries.

**Pattern**: React Query / RTK Query for Data Fetching
**Best Practice**: Specialized libraries over useEffect for server state
**Anti-Pattern**: Manual useEffect data fetching

**React Query Template**:
```typescript
import { useQuery } from '@tanstack/react-query';

function ProductsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Step 6: Performance Optimization

Strategic memoization eliminates unnecessary work, while code splitting optimizes initial page load.

**Pattern**: Strategic Memoization
**Best Practice**: Memoize expensive computations and stable function references
**Anti-Pattern**: Premature/excessive memoization

**React.memo Template**:
```typescript
import { memo } from 'react';

interface ProductCardProps {
  product: { id: string; name: string; price: number };
  onAddToCart: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
});
```

**useMemo Template**:
```typescript
import { useMemo } from 'react';

function ProductList({ products, filter }: { products: Product[]; filter: string }) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  }, [products, filter]);

  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

**Pattern**: Code Splitting with React.lazy and Suspense
**Best Practice**: Lazy load feature components or large dependencies

**Code Splitting Template**:
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Step 7: Common Pitfalls and Workarounds

**Anti-Pattern**: Stale Closures in useEffect
**Workaround**: Functional state updates, strict dependency arrays

**useEffect with Proper Dependencies Template**:
```typescript
import { useEffect, useState, useCallback } from 'react';

function Timer() {
  const [count, setCount] = useState(0);

  // ✅ Good: Functional update
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // Always uses latest state
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}
```

**Anti-Pattern**: Inline Component Creation
**Workaround**: Define components outside render function

**Component Definition Outside Render Template**:
```typescript
// ✅ Good: Component defined outside
const ChildComponent = ({ value }: { value: string }) => <div>{value}</div>;

function ParentComponent() {
  const [value, setValue] = useState('');

  return (
    <div>
      <ChildComponent value={value} />
    </div>
  );
}

// ❌ Bad: Component defined inside render
function ParentComponent() {
  const [value, setValue] = useState('');
  
  const ChildComponent = () => <div>{value}</div>; // Causes remounting
  return <ChildComponent />;
}
```

### Step 8: Error Handling and UX Patterns

**Pattern**: Error Boundaries (Class Components)
**Best Practice**: Error Boundaries must be class components

**Error Boundary Template**:
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

**Pattern**: React Portals for Modals/Dialogs
**Best Practice**: Render modals to document body to bypass parent styling conflicts

**Portal Template**:
```typescript
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}
```

**Pattern**: React Hook Form for Form Management
**Best Practice**: Use React Hook Form for high-performance form solutions

**React Hook Form Template**:
```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}
      <input {...register('password', { required: true })} />
      {errors.password && <span>Password is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Code Templates

### Template 1: TypeScript Functional Component (RFC)
```typescript
import React, { FC } from 'react';

interface ButtonPrimaryProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled?: boolean;
}

const ButtonPrimary: FC<ButtonPrimaryProps> = ({ label, onClick, isDisabled = false }) => {
  return (
    <button className="btn-primary" onClick={onClick} disabled={isDisabled}>
      {label}
    </button>
  );
};

export default ButtonPrimary;
```

### Template 2: Context Provider with Safe Consumption Hook
```typescript
import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Template 3: Custom Hook (useDocumentTitle)
```typescript
import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string, prevailOnUnmount = false) {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    return () => {
      if (!prevailOnUnmount) {
        document.title = defaultTitle.current;
      }
    };
  }, [prevailOnUnmount]);
}
```

### Template 4: useDeferredValue Search Filter
```typescript
import { useState, useDeferredValue } from 'react';

function DeferredSearchComponent() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {query !== deferredQuery && <p>Loading results...</p>}
      <HeavyList query={deferredQuery} />
    </div>
  );
}
```

### Template 5: Compound Component Pattern
```typescript
import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface TabsContextType {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.Panel = function TabsPanel({ index, children }: { index: number; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs.Panel must be used within Tabs');
  return context.selectedIndex === index ? <div>{children}</div> : null;
};
```

### Template 6: Zustand Store Setup
```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Template 7: React.memo Optimization
```typescript
import { memo } from 'react';

interface ProductCardProps {
  product: { id: string; name: string };
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return <div>{product.name}</div>;
});
```

### Template 8: Code Splitting with Suspense
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Template 9: Error Boundary Class Component
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Template 10: Portal Implementation
```typescript
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}
```

## Anti-Patterns

### 1. Legacy ReactDOM.render Usage

**Description**: Using ReactDOM.render instead of createRoot API prevents concurrent rendering benefits.

**Impact**: Blocks React 18 scheduler, prevents useTransition/useDeferredValue from working, no concurrent rendering benefits.

**Workaround**: Use createRoot API for React 18+ initialization.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Legacy API
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
```

**Workaround Code**:
```typescript
// ✅ Good: Modern API
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### 2. Business Logic in Atoms

**Description**: Placing complex business logic or stateful operations in atomic components breaks reusability principle.

**Impact**: Breaks reusability principle, creates maintenance debt, violates separation of concerns, makes Atoms tightly coupled to business logic.

**Workaround**: Keep Atoms purely presentational, move logic to Organisms or Custom Hooks.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Business logic in Atom
function Button({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser); // Business logic in Atom
  }, [userId]);
  
  return <button>{user?.name || 'Loading'}</button>;
}
```

**Workaround Code**:
```typescript
// ✅ Good: Atom is presentational only
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
```

### 3. Everything in App State Lifting

**Description**: Lifting too much state to root App component unnecessarily forces wide re-renders.

**Impact**: Forces wide, costly re-renders across entire application, performance degradation, unnecessary component updates.

**Workaround**: Colocate state in lowest common ancestor, use Context or external state for truly shared state.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: All state in App
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
}
```

**Workaround Code**:
```typescript
// ✅ Good: State colocated in lowest common ancestor
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
}
```

### 4. Context for High-Frequency Updates

**Description**: Using Context API for frequently changing data (form inputs, live dashboards, real-time updates) causes performance issues.

**Impact**: Forces unnecessary re-renders of all consumers, severe performance bottlenecks, UI lag.

**Workaround**: Use subscription-based libraries (Zustand, Jotai) for high-frequency state updates.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Context for high-frequency updates
const FormContext = createContext();

function FormProvider({ children }) {
  const [formData, setFormData] = useState({}); // Changes frequently
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children} {/* All children re-render on every keystroke */}
    </FormContext.Provider>
  );
}
```

**Workaround Code**:
```typescript
// ✅ Good: Zustand for high-frequency updates
import { create } from 'zustand';

const useFormStore = create((set) => ({
  formData: {},
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),
}));

// Only components using specific fields re-render
```

### 5. Stale Closures in useEffect

**Description**: Functions capturing outdated state/props from previous render cycles in useEffect or async callbacks.

**Impact**: Asynchronous bugs, logic operating on outdated values, incorrect behavior, race conditions.

**Workaround**: Use functional state updates (setState(prev => ...)), strict dependency arrays, stabilize with useCallback/useMemo.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Stale closure
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Uses stale count value
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Missing count in dependencies
}
```

**Workaround Code**:
```typescript
// ✅ Good: Functional update
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // Always uses latest state
    }, 1000);
    return () => clearInterval(interval);
  }, []); // No dependency needed with functional update
}
```

### 6. Inline Component Creation

**Description**: Creating components inside render function of another component causes remounting.

**Impact**: Forces component remounting on every render, state loss, focus loss, unnecessary side effects, performance degradation.

**Workaround**: Define components outside parent's render function to maintain stable references.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Component defined inside render
function ParentComponent() {
  const [value, setValue] = useState('');
  
  const ChildComponent = () => <div>{value}</div>; // New component on every render
  
  return <ChildComponent />; // Causes remounting
}
```

**Workaround Code**:
```typescript
// ✅ Good: Component defined outside
const ChildComponent = ({ value }: { value: string }) => <div>{value}</div>;

function ParentComponent() {
  const [value, setValue] = useState('');
  return <ChildComponent value={value} />; // Stable reference
}
```

### 7. Prop Drilling

**Description**: Manually passing data through multiple intermediate components that don't need it.

**Impact**: High coupling, reduced maintainability, verbose code, fragile component structure, difficult refactoring.

**Workaround**: Use Context API for global data, improve component composition (pass elements as props), use state management libraries.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Prop drilling
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />; // user not used in Layout
}

function Layout({ user }) {
  return <Header user={user} />; // user not used in Header
}

function Header({ user }) {
  return <UserMenu user={user} />; // Finally used here
}
```

**Workaround Code**:
```typescript
// ✅ Good: Context API
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
}
```

### 8. Premature/Excessive Memoization

**Description**: Overusing useMemo/useCallback on cheap components or frequently changing props.

**Impact**: Overhead cost of dependency comparison negates minimal rendering savings, unnecessary complexity, harder to maintain.

**Workaround**: Only memoize expensive computations and stable function references, prioritize state colocation.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Premature memoization
function SimpleComponent({ name }: { name: string }) {
  const memoizedName = useMemo(() => name.toUpperCase(), [name]); // Unnecessary
  const handleClick = useCallback(() => console.log(name), [name]); // Unnecessary
  
  return <button onClick={handleClick}>{memoizedName}</button>;
}
```

**Workaround Code**:
```typescript
// ✅ Good: Memoize only expensive operations
function ExpensiveComponent({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.price - b.price); // Expensive operation
  }, [items]);
  
  return <div>{sortedItems.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}
```

### 9. Manual useEffect Data Fetching

**Description**: Using useEffect for server state management (data fetching, caching, synchronization, error handling).

**Impact**: Redundant manual management, missing features (automatic caching, stale data invalidation, error recovery), boilerplate code.

**Workaround**: Use specialized libraries (React Query, RTK Query) for server state management.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Manual data fetching
function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []); // Missing caching, refetching, error recovery
}
```

**Workaround Code**:
```typescript
// ✅ Good: React Query
import { useQuery } from '@tanstack/react-query';

function ProductsList() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json()),
  }); // Automatic caching, refetching, error handling
}
```

### 10. Direct Server Component Import into Client Component

**Description**: Importing Server Components directly into Client Component modules (Next.js App Router).

**Impact**: Breaks React Server Components architecture, runtime errors, hydration mismatches.

**Workaround**: Use component interleaving (pass SC as children prop to CC).

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Direct SC import into CC
'use client';
import { ServerComponent } from './ServerComponent'; // Error

function ClientComponent() {
  return <ServerComponent />; // Cannot import SC into CC
}
```

**Workaround Code**:
```typescript
// ✅ Good: Component interleaving
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
}
```

### 11. Non-Serializable Props

**Description**: Passing non-serializable data (functions, class instances, Date objects) to Server Components.

**Impact**: Serialization errors, hydration mismatches, runtime failures.

**Workaround**: Pass only serializable data (primitives, plain objects), use Server Actions for mutations.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Non-serializable props
function ServerComponent({ onClick, date }: { onClick: () => void; date: Date }) {
  return <button onClick={onClick}>{date.toISOString()}</button>; // Error
}
```

**Workaround Code**:
```typescript
// ✅ Good: Serializable props
function ServerComponent({ dateString }: { dateString: string }) {
  const date = new Date(dateString); // Deserialize in component
  return <div>{date.toISOString()}</div>;
}

// Pass serialized data
<ServerComponent dateString={date.toISOString()} />
```

### 12. Missing Validation in Server Actions

**Description**: Server Actions without input validation and authorization checks.

**Impact**: Security vulnerabilities, data corruption, unauthorized access, injection attacks.

**Workaround**: Always validate and authorize in Server Actions before mutations, use schema validation libraries.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: No validation
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title }); // No validation, no auth check
}
```

**Workaround Code**:
```typescript
// ✅ Good: Validation and authorization
'use server';
import { z } from 'zod';

const postSchema = z.object({ title: z.string().min(1).max(100) });

export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const validated = postSchema.safeParse({ title: formData.get('title') });
  if (!validated.success) throw new Error('Validation failed');
  
  await db.posts.create({ title: validated.data.title, userId: user.id });
}
```

### 13. Wrapper Hell (Excessive HOC Nesting)

**Description**: Deeply nested Higher-Order Components creating complex component trees.

**Impact**: Difficult debugging, prop namespace collisions, reduced readability, performance overhead, hard to trace data flow.

**Workaround**: Prefer Custom Hooks for reusable logic, use HOCs sparingly for cross-cutting concerns only.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Wrapper hell
const EnhancedComponent = withTheme(
  withAuth(
    withRouter(
      withAnalytics(Component) // Deep nesting
    )
  )
);
```

**Workaround Code**:
```typescript
// ✅ Good: Custom Hooks
function Component() {
  const theme = useTheme();
  const user = useAuth();
  const router = useRouter();
  const analytics = useAnalytics();
  // Clean, composable logic
}
```

### 14. Global State Sprawl

**Description**: Moving too much state to global stores unnecessarily.

**Impact**: Reduced performance, increased complexity, harder to reason about state flow, unnecessary re-renders.

**Workaround**: Keep state local (useState, useReducer), only elevate to global when truly shared across distant components.

**Anti-Pattern Code**:
```typescript
// ❌ Bad: Global state sprawl
const useStore = create((set) => ({
  count: 0,
  name: '',
  theme: 'light',
  cart: [],
  notifications: [],
  user: null,
  // ... everything in global store
}));
```

**Workaround Code**:
```typescript
// ✅ Good: Local state with selective global
function Counter() {
  const [count, setCount] = useState(0); // Local state
  return <div>{count}</div>;
}

// Only truly shared state in global store
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Real-World Examples

### Example 1: Deferred Search with Heavy List Rendering

**Use Case**: Search input that filters a large list without causing input lag.

```typescript
import { useState, useDeferredValue, useMemo } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const filteredItems = useMemo(() => {
    return largeList.filter(item => 
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery]);

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Search..."
      />
      {query !== deferredQuery && <p>Searching...</p>}
      <ItemList items={filteredItems} />
    </div>
  );
}
```

### Example 2: Compound Tabs Component

**Use Case**: Tabs component with implicit state sharing between parent and children.

```typescript
import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface TabsContextType {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }: { index: number; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  return (
    <button
      onClick={() => context.setSelectedIndex(index)}
      className={context.selectedIndex === index ? 'active' : ''}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({ index, children }: { index: number; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsPanel must be used within Tabs');
  return context.selectedIndex === index ? <div>{children}</div> : null;
};

// Usage
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>About</Tabs.Tab>
    <Tabs.Tab index={1}>Posts</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel index={0}>About content</Tabs.Panel>
  <Tabs.Panel index={1}>Posts content</Tabs.Panel>
</Tabs>
```

## Error Handling

Guidelines for handling common errors:

- **Stale Closure Errors**: Use functional state updates and strict dependency arrays. If dependencies change frequently, consider useRef or restructuring the effect.

- **Serialization Errors**: Ensure all props passed to Server Components are serializable. Convert Date objects to ISO strings, avoid passing functions or class instances.

- **Hydration Mismatches**: Ensure server and client render the same initial output. Avoid browser-only APIs in initial render, use useEffect for client-only logic.

- **Context Errors**: Always check if context is undefined before using. Provide clear error messages when context is used outside Provider.

- **Fallback Strategy**: Implement Error Boundaries at strategic points in component tree. Log errors to external service in componentDidCatch. Provide user-friendly fallback UI.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or scripts
- ✅ Use environment variables or secure vaults
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- TypeScript strict mode required for type safety
- All components must handle error states gracefully
- Server Actions must include validation and authorization
- Performance budgets should be monitored for large applications

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `react>=18.3.1`: React 18 with concurrent rendering support
- `typescript>=5.0.0`: TypeScript for type safety

**Optional Dependencies** (for specific patterns):
- `@tanstack/react-query`: Server state management
- `zustand`: Global state management for high-frequency updates
- `react-hook-form`: High-performance form management
- `class-variance-authority`: Component variant management

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

## Performance Considerations

- **Memoization Strategy**: Only memoize expensive computations (complex filtering, sorting, transformations) and stable function references passed to memoized components.

- **Code Splitting**: Lazy load feature components and large dependencies. Use Suspense boundaries strategically to improve perceived performance.

- **State Colocation**: Keep state as local as possible. Only lift state when truly necessary for sharing across distant components.

- **Concurrent Hooks**: Use useTransition and useDeferredValue as performance optimization layer, not replacement for proper state management.

- **Bundle Size**: Monitor bundle size. Use dynamic imports for heavy libraries. Consider tree-shaking opportunities.

## Related Resources

For extensive reference materials, see:
- React 18 Documentation: https://react.dev
- React Query Documentation: https://tanstack.com/query
- Zustand Documentation: https://zustand-demo.pmnd.rs
- React Hook Form Documentation: https://react-hook-form.com

## Notes

- **Concurrent Rendering**: React 18's concurrent features are opt-in optimizations. The scheduler automatically manages priority, but explicit use of useTransition/useDeferredValue provides better control.

- **Server Components**: This skill focuses on React 18 patterns. For Next.js App Router Server Components, refer to the Next.js 14 production skill.

- **State Management**: Choose state management tool based on update frequency and sharing requirements. Context for static data, Zustand/Jotai for high-frequency updates, Redux for complex middleware needs.

- **Performance**: Premature optimization is an anti-pattern. Profile first, optimize based on actual performance bottlenecks.

- **TypeScript**: Strict typing is non-negotiable for large-scale applications. Use interface for props, prefer type for utility types.

