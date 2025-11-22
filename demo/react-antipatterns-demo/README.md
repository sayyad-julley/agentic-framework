# React Anti-Patterns Demo

Interactive demonstration of 14 common React 18 anti-patterns and their workarounds. This demo showcases both problematic code patterns and recommended solutions.

## Features

- **14 Anti-Patterns Covered**: Comprehensive examples of common React pitfalls
- **Side-by-Side Comparison**: View anti-patterns and workarounds side-by-side
- **Interactive Navigation**: Easy browsing through all anti-patterns
- **Clear Explanations**: Each anti-pattern includes impact description and explanations

## Anti-Patterns Included

1. **Legacy ReactDOM.render Usage** - Using old API instead of createRoot
2. **Business Logic in Atoms** - Mixing logic with presentational components
3. **Everything in App State Lifting** - Over-lifting state to root
4. **Context for High-Frequency Updates** - Using Context for frequently changing data
5. **Stale Closures in useEffect** - Capturing outdated state in closures
6. **Inline Component Creation** - Defining components inside render functions
7. **Prop Drilling** - Passing props through unnecessary layers
8. **Premature/Excessive Memoization** - Overusing useMemo/useCallback
9. **Manual useEffect Data Fetching** - Not using specialized libraries
10. **Direct Server Component Import** - Breaking Next.js App Router boundaries
11. **Non-Serializable Props** - Passing non-serializable data to Server Components
12. **Missing Validation in Server Actions** - Security vulnerabilities
13. **Wrapper Hell** - Excessive HOC nesting
14. **Global State Sprawl** - Overusing global state

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd react-antipatterns-demo
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:4004](http://localhost:4004) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
react-antipatterns-demo/
├── app/
│   ├── antipatterns/          # Individual anti-pattern pages
│   │   ├── legacy-render/
│   │   ├── business-logic-atoms/
│   │   ├── state-lifting/
│   │   └── ... (11 more)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page with navigation
│   └── globals.css            # Global styles
├── components/
│   └── AntiPatternLayout.tsx  # Shared layout component
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

1. Navigate to the home page to see all 14 anti-patterns
2. Click on any anti-pattern card to view details
3. Use the tabs to switch between anti-pattern (❌) and workaround (✅) code
4. Read the explanations to understand the impact and solution

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 18.3.1** - Latest React with concurrent features
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ant Design** - UI components
- **Zustand** - State management (for examples)
- **React Query** - Server state management (for examples)
- **Zod** - Schema validation (for examples)

## Learning Resources

- [React 18 Documentation](https://react.dev)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)

## Contributing

This is a demonstration project. Feel free to use it as a reference or extend it with additional examples.

## License

MIT

