# shadcn/ui Production Demo

This demo showcases production-ready shadcn/ui implementation following best practices from the `implementing-shadcn-ui-production` skill.

## Features Demonstrated

### Architectural Patterns

1. **Atomic Composition Pattern**
   - Building complex business-specific components by composing shadcn/ui primitives
   - Example: `MetricCard` composite built from `Card` and `Button` primitives

2. **CVA Standardization Pattern**
   - All custom components use `class-variance-authority` for variant definitions
   - Ensures theme-aware implementation and maintains design system integrity
   - Example: `CustomButton` component with CVA variants

3. **Advanced Theming Pattern**
   - Dark mode via `next-themes` with class strategy
   - Dual CSS variable declaration (`:root` for light mode, `.dark` for dark mode)
   - `@theme inline` directive for Tailwind utility mapping

### Best Practices Implemented

- ✅ **CVA Mandatory**: All custom components use CVA for variant definitions
- ✅ **Dual CSS Variables**: Theme variables declared for both light and dark modes
- ✅ **Atomic Composition**: Primitives composed into business composites
- ✅ **Server/Client Separation**: Proper component boundaries to avoid hydration errors
- ✅ **Theme Variables**: Using CSS custom properties for all colors
- ✅ **Accessibility**: Built on Radix UI primitives with proper ARIA attributes

### Anti-Patterns Avoided

- ❌ **No Hardcoded Colors**: All colors use CSS variables for theme awareness
- ❌ **No SSR Hydration Errors**: Client components properly marked with `'use client'`
- ❌ **No Tailwind Conflicts**: Using `@theme inline` directive for proper variable mapping
- ❌ **No Accessibility Regression**: Built on Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:4004](http://localhost:4004) in your browser

## Project Structure

```
shadcn-demo/
├── app/
│   ├── globals.css          # Theme variables (dual declaration)
│   ├── layout.tsx           # Root layout with ThemeProvider
│   └── page.tsx              # Demo page
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── metric-card.tsx       # Composite component (Atomic Composition)
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── theme-toggle.tsx      # Theme switcher
├── lib/
│   └── utils.ts              # cn() utility for class merging
├── components.json           # shadcn/ui configuration
└── tailwind.config.ts        # Tailwind config with theme variables
```

## Key Components

### MetricCard (Composite Component)

Demonstrates atomic composition by combining `Card` and `Button` primitives into a business-specific component.

### CustomButton (CVA Example)

Shows CVA standardization pattern with custom variants defined using `class-variance-authority`.

### Theme System

- Theme variables defined in `app/globals.css`
- Dual declaration for light/dark modes
- `@theme inline` directive for Tailwind mapping
- `next-themes` for theme switching

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [class-variance-authority](https://cva.style)
- [next-themes](https://github.com/pacocoursey/next-themes)
- `implementing-shadcn-ui-production` skill documentation

## Notes

- shadcn/ui components are copied as source code (not NPM packages)
- Maintenance responsibility transfers to development team
- Components are AI-ready due to exposed code structure
- Production suitability validated by adoption in high-scale projects

