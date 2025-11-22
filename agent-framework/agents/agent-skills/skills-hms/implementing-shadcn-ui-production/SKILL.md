---
name: implementing-shadcn-ui-production
description: Implements shadcn/ui components using open code distribution model by applying atomic composition patterns (building composites from primitives), CVA standardization (class-variance-authority for type-safe variants), advanced theming (dark mode via next-themes, custom design tokens with @theme directive), following best practices (component composition with Context/Redux, mandatory CVA usage, dual CSS variable declaration, component governance policy, mandatory Axe testing), implementing workarounds (controlled upstream synchronization with diff workflow, monorepo adoption with packages/ui, managed internal library with Bit), and avoiding anti-patterns (maintenance debt trap from neglected updates, SSR hydration errors from client logic in Server Components, Tailwind typography conflicts from hardcoded values, accessibility regression from missing ARIA). Use when building production UI systems, customizing components, setting up design tokens, managing component lifecycle, or avoiding integration pitfalls.
version: 1.0.0
dependencies:
  - react>=18.0.0
  - typescript>=5.0.0
  - tailwindcss>=3.0.0
  - class-variance-authority>=0.7.0
  - next-themes>=0.2.0
---

# Implementing shadcn/ui Production

## Overview

shadcn/ui represents a fundamental architectural shift from traditional component library models to an open code distribution system. Components are distributed as TypeScript/React source code that developers copy directly into their projects, transforming them from external dependencies into fully owned internal assets. This architecture provides complete transparency, eliminates vendor lock-in, enables unrestricted customization, and positions components as inherently AI-ready for analysis and improvement. The core trade-off is the transfer of maintenance responsibility from library maintainers to the development team, requiring dedicated internal maintenance protocols to manage component lifecycle, security patches, and dependency updates.

## When to Use

Use this skill when:
- Building production UI systems with custom design requirements
- Implementing design system consistency across applications
- Setting up dark mode and custom theming systems
- Managing component lifecycle and upstream synchronization
- Avoiding common integration pitfalls (SSR hydration, Tailwind conflicts, accessibility issues)
- Customizing components beyond standard library capabilities
- Establishing component governance and maintenance protocols

**Input format**: Next.js/React project, Tailwind CSS configured, understanding of component composition, access to shadcn/ui CLI
**Expected output**: Production-ready shadcn/ui implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Next.js/React project setup with App Router (if using Next.js)
- Tailwind CSS configured with utility-first approach
- Understanding of React component composition patterns
- Access to shadcn/ui CLI (`npx shadcn@latest`)
- TypeScript configuration for type safety
- Design system requirements and custom theming needs defined

## Execution Steps

### Step 1: Atomic Composition Pattern

Component composition is the fundamental mechanism for creating complex user interfaces while promoting reusability and simplifying maintenance. shadcn/ui components, built on Radix primitives, are inherently modular, making them ideal for integration into new contexts.

**Pattern**: Use base components as atomic units for business composites
**Best Practice**: Combine primitives (Button, Card) into higher-level structures (MetricCard, Dashboard widgets)
**Anti-Pattern**: Over-nesting components, prop drilling through multiple layers

**Composite Component Template**:
```typescript
// components/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  onAction?: () => void;
}

export function MetricCard({ title, value, change, onAction }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{change}</div>
        {onAction && <Button onClick={onAction}>View Details</Button>}
      </CardContent>
    </Card>
  );
}
```

**State Management Best Practice**: Avoid prop drilling by using React Context or external state managers (Zustand, Redux) for shared state across deep component hierarchies.

### Step 2: CVA Standardization Pattern

Any component created or significantly modified within the application must conform to design system consistency pillars: Visual, Behavioral, Accessibility, Theming, and Developer Experience. The central tool for enforcing this consistency is class-variance-authority (CVA).

**Pattern**: Use CVA for type-safe component variants
**Best Practice**: All custom components must use CVA for variant definition
**Anti-Pattern**: Hardcoded styles bypassing CVA, breaking theme-aware implementation

**CVA Variant Template**:
```typescript
// components/custom-button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const customButtonVariants = cva(
  "base-classes",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      variant: {
        primary: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

interface CustomButtonProps extends VariantProps<typeof customButtonVariants> {
  children: React.ReactNode;
  className?: string;
}

export function CustomButton({ size, variant, className, children }: CustomButtonProps) {
  return (
    <Button className={cn(customButtonVariants({ size, variant }), className)}>
      {children}
    </Button>
  );
}
```

**Critical**: CVA ensures components respond reliably to global theme changes (dark mode, theme switching). Bypassing CVA with hardcoded styles breaks theme awareness.

### Step 3: Advanced Theming Pattern

Effective theming is crucial for production systems, especially concerning dark mode implementation and custom brand colors. Dark mode is managed through next-themes provider with class strategy.

**Pattern**: Dark mode via next-themes with class strategy
**Best Practice**: Dual CSS variable declaration (:root for light mode, .dark for dark mode)
**Anti-Pattern**: Hardcoded colors, missing dark mode variables, breaking theme system

**Theme Token Extension Workflow**:

**Step 1: Define Variables** (app/globals.css):
```css
:root {
  --warning: 45 93% 47%;
  --warning-foreground: 0 0% 100%;
}

.dark {
  --warning: 45 93% 50%;
  --warning-foreground: 0 0% 0%;
}
```

**Step 2: Map to Utilities** (app/globals.css):
```css
@theme inline {
  --color-warning: oklch(var(--warning));
  --color-warning-foreground: oklch(var(--warning-foreground));
}
```

**Step 3: Consumption** (Component):
```typescript
<div className="bg-warning text-warning-foreground">
  Warning message
</div>
```

**Critical**: The @theme inline directive maps CSS custom properties to Tailwind utility classes, making new colors seamlessly available across all components.

## Common Patterns

### Pattern 1: Atomic Composition

Build complex business-specific components by composing shadcn/ui primitives as atomic units. This ensures core styling and accessibility logic are inherited from battle-tested primitives while assembly dictates unique features.

**When to apply**: Creating business-specific components (dashboards, metric cards, structured layouts)
**Code template**: Combine Button + Card primitives into MetricCard composite

### Pattern 2: CVA Standardization

Enforce design system consistency by mandating class-variance-authority usage for all custom or modified components. CVA centralizes variant definitions and prevents component layer decoupling from global styling variables.

**When to apply**: All custom components, any component modifications, variant definitions
**Code template**: Define variants with CVA, extend VariantProps for type safety

### Pattern 3: Advanced Theming

Implement dark mode and custom design tokens using next-themes provider with dual CSS variable declaration and @theme inline directive for Tailwind utility mapping.

**When to apply**: Theming setup, dark mode implementation, custom color/brand token introduction
**Code template**: 3-step workflow (variables → @theme → usage)

## Best Practices

- **Component Composition**: Avoid over-nesting (excessive layers impact rendering performance). Use React Context or external state managers (Zustand, Redux) for shared state to prevent prop drilling.
- **CVA Mandatory**: All custom components must use CVA for variant definitions. This ensures theme-aware implementation and maintains design system integrity.
- **Theme Variables**: Always dual-declare CSS variables (:root for light mode, .dark for dark mode). Use @theme inline directive to map variables to Tailwind utilities.
- **Maintenance Protocol**: Establish explicit Component Governance Policy categorizing components by modification level (L1: Unmodified, L3: Heavily Customized). Dedicate recurring engineering cycles for proactive maintenance and upstream synchronization.
- **Accessibility**: Mandatory Axe testing for all composite components. Verify correct ARIA attribute usage, intuitive keyboard navigation, and proper semantic HTML structure.

## Workarounds

### Workaround 1: Controlled Upstream Synchronization

**When**: Component maintenance and updates needed, security patches available, dependency updates required

**How**: Use `npx shadcn@latest diff [component]` to visualize line-by-line comparison between local and upstream versions. For batch checking, implement automated script:

```bash
# Batch diffing script
for file in components/ui/*.tsx; do 
  npx shadcn@latest diff $(basename "$file" .tsx); 
done
```

If update required, overwrite using `npx shadcn@latest add -y -o [component]`, then conduct code review to re-implement customizations on updated source.

**Trade-off**: Manual merge process requires dedicated engineering time. Maintenance debt increases with customization level.

### Workaround 2: Monorepo Adoption

**When**: Multiple applications sharing components, large organizations managing multiple codebases

**How**: Use native monorepo support (Next.js with Turborepo). Install components into shared workspace package (`packages/ui`). CLI handles path resolution automatically:

```typescript
// apps/web imports from shared package
import { Button } from "@workspace/ui/components/button";
```

**Trade-off**: Centralized maintenance creates single source of truth but requires coordinated updates across dependent applications.

### Workaround 3: Managed Internal Library

**When**: Extreme scaling scenarios, distributing highly customized components across separate repositories, sharing with external teams

**How**: Use tooling layer (Bit) to treat customized components as versionable, published assets consumed via package manager. Source code remains owned and modifiable internally.

**Trade-off**: Reintroduces library management complexity while retaining customization flexibility.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Maintenance Debt Trap

**Issue**: Neglecting upstream component updates leads to security vulnerabilities, accessibility regressions, and dependency conflicts. Components diverge from upstream, making future updates increasingly difficult.

**Detection**: Components not synced for 3+ months, security advisories for underlying dependencies (Radix), accessibility issues in updated upstream versions

**Resolution**: Implement weekly diff workflow using `npx shadcn@latest diff`. Establish Component Governance Policy with categorization (L1: Unmodified, L3: Heavily Customized). Dedicate recurring engineering cycles for L3 component maintenance.

**Prevention**: Categorize all components by modification level. Schedule proactive maintenance reviews. Monitor upstream repository for security fixes and critical patches.

### Anti-Pattern 2: SSR Hydration Errors

**Issue**: Client-side logic, hooks, or state management initiated incorrectly within Server Components causes mismatch between server-rendered HTML and client-side JavaScript during hydration.

**Detection**: Hydration mismatch errors in console, "Text content does not match" warnings, component state inconsistencies

**Resolution**: Strict adherence to Server/Client component separation. Stateful components must use 'use client' directive. Verify initial props passed from server to client are stable and consistent.

**Prevention**: Verify Server/Client component boundaries. Never use browser APIs (window, localStorage) in Server Components. Ensure props are serializable (no functions, Date objects, class instances).

### Anti-Pattern 3: Tailwind Typography Conflicts

**Issue**: Hardcoded pixel or rem values replace CSS variables, breaking theme system. Results in inconsistent heading hierarchies, layout breakage, and failure to respond to theme changes.

**Detection**: Inconsistent font scaling, layout breakage, components not responding to theme changes, hardcoded values in component styles

**Resolution**: Use Tailwind's @apply rules for reusable classes. Adjust font scales exclusively through CSS custom properties. Never replace CSS variables with hardcoded values.

**Prevention**: Always use CSS custom properties for typography. Use @apply rules for consistency. Verify components respond to theme variable changes.

### Anti-Pattern 4: Accessibility Regression

**Issue**: Missing ARIA attributes, broken keyboard navigation, improper focus traps compromise accessibility. Components built on accessible Radix primitives can be compromised through misuse.

**Detection**: Axe testing failures, keyboard navigation issues, missing accessible names for interactive elements (modals, dialogs), focus trap failures

**Resolution**: Mandatory accessibility checks (automated Axe testing) for all composite components. Verify correct ARIA attribute usage, intuitive keyboard navigation flow, proper semantic HTML structure.

**Prevention**: Integrate Axe testing into development workflow. Test all composites for accessibility. Verify focus traps have robust fallbacks for keyboard users.

## Code Templates

### Composite Component Template

```typescript
// components/business-component.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BusinessComponent() {
  return (
    <Card>
      <CardContent>
        <Button>Action</Button>
      </CardContent>
    </Card>
  );
}
```

### CVA Variant Template

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const componentVariants = cva("base", {
  variants: {
    size: { sm: "h-8", md: "h-10", lg: "h-12" },
    variant: { primary: "bg-primary", destructive: "bg-destructive" },
  },
  defaultVariants: { size: "md", variant: "primary" },
});

interface Props extends VariantProps<typeof componentVariants> {
  children: React.ReactNode;
}
```

### Theme Token Extension Template

```css
/* Step 1: Define variables */
:root { --custom: 200 80% 50%; }
.dark { --custom: 200 80% 60%; }

/* Step 2: Map to utilities */
@theme inline {
  --color-custom: oklch(var(--custom));
}

/* Step 3: Use in components */
/* className="bg-custom" */
```

### Server-Side Pagination Template

```typescript
// components/pagination-controls.tsx (Client Component)
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PaginationControls({ currentPage, lastPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div className="flex space-x-2">
      <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
        Previous
      </Button>
      <Button disabled={currentPage === lastPage} onClick={() => handlePageChange(currentPage + 1)}>
        Next
      </Button>
    </div>
  );
}
```

### Form Validation Template

```typescript
// Using Zod + react-hook-form + shadcn/ui
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Valid email required"),
});

export function SignUpForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "" },
  });
  
  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}
```

## Real-World Examples

### Example 1: Enterprise Data Table with Server-Side Pagination

**Context**: High-volume data tables requiring server-side pagination for performance. Client-side pagination inefficient for thousands of records.

**Implementation**: Separate data fetching (Server Component) from interactivity (Client Component). Server Component fetches data based on URL searchParams. Client Component (PaginationControls) modifies URL query string to trigger server re-fetch.

```typescript
// app/products/page.tsx (Server Component)
export default async function ProductsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "1");
  const products = await fetchProducts(page);
  
  return (
    <div>
      <DataTable data={products} />
      <PaginationControls currentPage={page} lastPage={products.totalPages} />
    </div>
  );
}

// components/pagination-controls.tsx (Client Component - 15 lines)
"use client";
export function PaginationControls({ currentPage, lastPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };
  return (
    <div className="flex space-x-2">
      <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</Button>
      <Button disabled={currentPage === lastPage} onClick={() => handlePageChange(currentPage + 1)}>Next</Button>
    </div>
  );
}
```

**Key Points**: URL query string management triggers server-side re-render. Server/Client component separation ensures efficient data fetching.

### Example 2: Custom Utility Distribution

**Context**: Cross-browser scrollbar hiding utility needed consistently across application. Complex CSS rules require centralized management.

**Implementation**: Define custom utility in registry JSON using @utility directive. CLI distributes CSS, making class available like standard Tailwind utility.

```json
// registry/utility/scrollbar-hidden.json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "scrollbar-hidden",
  "type": "registry:utility",
  "css": {
    "@utility scrollbar-hidden": {
      "&::-webkit-scrollbar": { "display": "none" },
      "-ms-overflow-style": "none",
      "scrollbar-width": "none"
    }
  }
}
```

**Usage**: `<ScrollArea className="scrollbar-hidden">...</ScrollArea>`

**Key Points**: @utility directive enables centralized CSS management. Complex styling concerns integrated into utility-first design system.

## Error Handling

- **Component Installation Failures**: Verify Tailwind configuration, check component dependencies, ensure CLI version compatibility
- **Theme Variable Mapping Errors**: Validate @theme inline directive syntax, verify CSS variable names match Tailwind utility mapping
- **CVA Type Errors**: Ensure VariantProps extension, verify variant definitions match component usage, check TypeScript configuration
- **Hydration Mismatch Resolution**: Verify 'use client' directives, check prop serialization, ensure stable initial props from server

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in component code
- ❌ No credentials in SKILL.md or templates
- ✅ Use external credential management systems
- ✅ Route sensitive operations through secure channels

**Component Ownership**: Source code is fully owned, transferring security responsibility to development team. Regular security patch monitoring required. Implement Component Governance Policy for security update tracking.

## Performance Considerations

- **Bundle Size Optimization**: Only copy required components into project. shadcn/ui architecture naturally promotes minimalism - unused components don't affect bundle size.
- **Theme Variable Performance**: CSS custom properties (CSS variables) provide efficient theming without JavaScript overhead. Theme switching is performant.
- **Component Composition Performance**: Avoid over-nesting components. Excessive nested layers negatively impact rendering performance. Use React Context or external state managers to prevent prop drilling without adding render overhead.

## Related Resources

For extensive reference materials, see:
- shadcn/ui official documentation: https://ui.shadcn.com
- Radix UI primitives: https://www.radix-ui.com
- class-variance-authority: https://cva.style
- next-themes: https://github.com/pacocoursey/next-themes

## Notes

- shadcn/ui is not distributed as NPM package - components are copied as source code
- Maintenance responsibility transfers to development team - requires dedicated protocols
- Components are AI-ready due to exposed code structure and flat-file schema
- Production suitability validated by adoption in high-scale projects (x.ai, openai.com, vercel.app)
- Monorepo support available in latest CLI versions for shared component management

