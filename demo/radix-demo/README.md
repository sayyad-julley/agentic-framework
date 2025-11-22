# Radix UI Production Demo

This demo showcases a production-ready Radix UI implementation following best practices from the `implementing-radix-ui-production` skill.

## Overview

Radix UI establishes an architectural paradigm rooted in strict separation of concerns, distinguishing component behavior and accessibility from visual presentation. Primitives function as the "engine" of components, delivering complex interactivity, internal state management, keyboard navigation, and WAI-ARIA compliance without imposing visual styling.

## Key Patterns Demonstrated

### Pattern 1: asChild Composition with Custom Components

The `asChild` prop is the critical architectural pattern for integrating Radix primitives into existing design systems. It delegates Radix's behavior, state management, and accessibility logic onto developer-provided elements or custom React components.

**Requirements:**
- **Prop Spreading**: Custom components MUST spread incoming props (`{...props}`) onto the underlying DOM node
- **Ref Forwarding**: Custom components MUST use `React.forwardRef` to ensure Radix-injected refs attach correctly

**Example:** `CustomButton` component used with `Tooltip.Trigger asChild`

### Pattern 2: Component Abstraction

Encapsulate Radix primitives into high-level custom components to maintain clean APIs and ensure consistency. This pattern abstracts complex structural details (Portal, Overlay, Close buttons) into reusable components.

**Example:** `DialogContent` component encapsulates Portal, Overlay, and Close button

### Pattern 3: Complex Dropdown Menu

Multi-level menus with stateful elements (checkboxes, radio groups). SubContent must also use Portal for correct layering.

**Example:** DropdownMenu with sub-menus, checkboxes, and radio groups

### Pattern 4: State-Driven Styling

Radix components expose interaction states through `data-*` attributes. Use these attributes with CSS selectors or Tailwind JIT syntax for state-driven styling without external state management.

**Example:** Popover with `data-[state=open]` and `data-[side]` attributes

## Best Practices Applied

1. **Mandatory Prop Spreading**: All custom components used with `asChild` spread incoming props onto the underlying DOM node
2. **Ref Forwarding**: All wrapper components use `React.forwardRef` for proper ref attachment
3. **Component Abstraction**: Radix primitives encapsulated into high-level custom components
4. **Semantic Responsibility**: Using semantic elements (button, a) for accessibility
5. **Data Attribute Styling**: Using Radix's `data-*` attributes for state-based styling
6. **Labeling**: Providing accessible names using Label primitive or `aria-label`

## Anti-Patterns Avoided

1. **Missing Prop Spreading**: All components properly spread props to maintain functionality
2. **Non-Functional Element Overrides**: Using semantic button elements, not divs without tabindex
3. **CSS Order Conflicts**: Proper CSS import order maintained
4. **Portal Context Loss**: Portals properly configured (if theme needed)
5. **Rigid Theming**: Using data attributes for flexible styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The demo will be available at `http://localhost:4005`

## Project Structure

```
radix-demo/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main demo page
├── components/
│   └── ui/
│       ├── custom-button.tsx    # Custom button with forwardRef and prop spreading
│       ├── dialog.tsx           # Dialog component abstraction
│       ├── dropdown-menu.tsx    # Dropdown menu with sub-menus
│       ├── popover.tsx          # Popover component
│       └── tooltip.tsx         # Tooltip component
├── lib/
│   └── utils.ts             # Utility functions (cn helper)
└── package.json
```

## Dependencies

- `@radix-ui/react-dialog`: Dialog primitive
- `@radix-ui/react-tooltip`: Tooltip primitive
- `@radix-ui/react-dropdown-menu`: Dropdown menu primitive
- `@radix-ui/react-popover`: Popover primitive
- `@radix-ui/react-icons`: Icon components
- `tailwindcss`: Utility-first CSS framework
- `clsx` & `tailwind-merge`: Class name utilities

## Key Components

### CustomButton

Demonstrates Pattern 1 (asChild Composition):
- Uses `React.forwardRef` for ref forwarding
- Spreads props (`{...props}`) onto button element
- Compatible with Radix primitives via `asChild` prop

### Dialog

Demonstrates Pattern 2 (Component Abstraction):
- Encapsulates Portal, Overlay, and Close button
- Provides clean API with DialogContent, DialogHeader, etc.

### DropdownMenu

Demonstrates Pattern 3 (Complex Dropdown):
- Multi-level menus with sub-menus
- Stateful elements (checkboxes, radio groups)
- Proper Portal usage for layering

### Popover

Demonstrates Pattern 4 (State-Driven Styling):
- Uses `data-[state=open]` for animations
- Uses `data-[side]` for positioning-based styling
- No external state management needed

## References

- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [WAI-ARIA Patterns](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Data Attributes](https://tailwindcss.com/docs/hover-focus-and-other-states#data-attributes)
- Implementing Radix UI Production Skill: `agent-framework/agents/agent-skills/skills-hms/implementing-radix-ui-production/SKILL.md`

## License

This is a demo project for educational purposes.

