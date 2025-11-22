---
name: implementing-radix-ui-production
description: Implements Radix UI primitives using architectural patterns (asChild composition with mandatory prop spreading and ref forwarding, component abstraction for custom APIs, data attribute styling for state-driven visuals), applying best practices (semantic responsibility, WAI-ARIA labeling, portal container pattern), implementing workarounds (CSS layering for Tailwind conflicts, portal context preservation, theme palette abstraction), and avoiding anti-patterns (missing prop spreading causing broken functionality, non-functional element overrides breaking accessibility, CSS order conflicts removing styles, portal context loss breaking theming, rigid theming limiting design flexibility). Use when building accessible UI components, integrating with design systems, managing portals and theming, or creating production-ready interactive components.
version: 1.0.0
dependencies:
  - react>=18.0.0
  - typescript>=5.0.0
  - @radix-ui/react-dialog>=1.0.0
  - @radix-ui/react-tooltip>=1.0.0
  - @radix-ui/react-dropdown-menu>=2.0.0
  - @radix-ui/react-popover>=1.0.0
  - tailwindcss>=3.0.0
---

# Implementing Radix UI Production

## Overview

Radix UI establishes an architectural paradigm rooted in strict separation of concerns, distinguishing component behavior and accessibility from visual presentation. Primitives function as the "engine" of components, delivering complex interactivity, internal state management, keyboard navigation, and WAI-ARIA compliance without imposing visual styling. This allows complete control over appearance while benefiting from production-ready, accessible behavior. Radix manages WAI-ARIA attributes, focus management, and keyboard navigation patterns, while developers handle styling and semantic labeling.

## When to Use

Use this skill when:
- Building accessible UI components requiring complex interactivity
- Integrating Radix primitives into existing design systems
- Managing portal-based components (Dialog, Tooltip, DropdownMenu, Popover)
- Implementing state-driven styling without external state management
- Creating custom component abstractions from primitives
- Avoiding common integration pitfalls (CSS conflicts, portal context loss, accessibility issues)

**Input format**: React 18+ project, TypeScript recommended, Tailwind CSS (if using utility-first styling), understanding of component composition
**Expected output**: Production-ready Radix UI implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- React 18+ project setup
- TypeScript configuration (recommended for type safety)
- Tailwind CSS configured (if using utility-first styling)
- Understanding of React component composition and ref forwarding
- Access to required Radix UI primitive packages
- Design system requirements and theming needs defined

## Execution Steps

### Step 1: asChild Composition Pattern

The `asChild` prop is the critical architectural pattern for integrating Radix primitives into existing design systems. It delegates Radix's behavior, state management, and accessibility logic onto developer-provided elements or custom React components.

**Mandatory Requirements**:
1. **Prop Spreading**: Custom components MUST spread incoming props (`{...props}`) onto the underlying DOM node
2. **Ref Forwarding**: Custom components MUST use `React.forwardRef` to ensure Radix-injected refs attach correctly

**Template**: Custom component with asChild integration
```typescript
// CustomButton with forwardRef and prop spreading
import * as React from "react";

const CustomButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  )
);

// Usage with asChild
import * as Tooltip from "@radix-ui/react-tooltip";

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <CustomButton variant="icon">Info</CustomButton>
  </Tooltip.Trigger>
  <Tooltip.Content>Tooltip content</Tooltip.Content>
</Tooltip.Root>
```

**Anti-Pattern**: Missing prop spreading causes critical logic (keyboard event listeners, state handlers) to be lost, resulting in broken functionality.

### Step 2: Component Abstraction Pattern

Encapsulate Radix primitives into high-level custom components to maintain clean APIs and ensure consistency. This pattern abstracts complex structural details (Portal, Overlay, Close buttons) into reusable components.

**Best Practice**: Encapsulate Portal, Overlay, and Close components within abstraction layer
**Benefits**: Cleaner API, consistency across application, easier maintenance

**Template**: Custom Dialog component abstraction
```typescript
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      {...props}
      ref={forwardedRef}
      className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-[30px] rounded-md shadow-2xl"
    >
      {children}
      <DialogPrimitive.Close aria-label="Close" className="absolute top-[10px] right-[10px]">
        <Cross1Icon />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
```

### Step 3: Data Attribute Styling Pattern

Radix components expose interaction states through `data-*` attributes (e.g., `data-state='open'`). Use these attributes with CSS selectors or Tailwind JIT syntax for state-driven styling without external state management.

**Best Practice**: Leverage Radix's internal state management via data attributes
**Anti-Pattern**: External state manipulation for styling creates unnecessary complexity

**Template**: Tailwind JIT with data attributes
```typescript
import * as Popover from "@radix-ui/react-popover";

<Popover.Root>
  <Popover.Trigger asChild>
    <button className="p-2 rounded bg-indigo-600 text-white">Open</button>
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      className="
        bg-white p-4 rounded shadow-xl border
        data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
        data-[side=bottom]:slide-in-from-top-2
      "
    >
      Content here
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

### Step 4: Semantic Element Management

When using `asChild` to override default element types, verify the new element remains focusable and capable of responding to keyboard events. The developer assumes accessibility responsibility when changing element types.

**Best Practice**: Verify focusability and keyboard event handling when overriding elements
**Anti-Pattern**: Using non-functional containers (e.g., `div` without `tabindex`) breaks accessibility

**Template**: Element override with accessibility checks
```typescript
// Safe: Anchor element is inherently focusable
<Tooltip.Trigger asChild>
  <a href="/link" className="...">Link with tooltip</a>
</Tooltip.Trigger>

// Unsafe: Div requires tabindex and keyboard handlers
<Tooltip.Trigger asChild>
  <div tabIndex={0} role="button" onKeyDown={handleKeyDown} className="...">
    Custom trigger
  </div>
</Tooltip.Trigger>
```

## Common Patterns

### Pattern 1: asChild with Custom Components

**When**: Integrating proprietary components as triggers for Radix primitives

**Template**: CustomButton with forwardRef and prop spreading
```typescript
const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <button ref={ref} className={cn("base-styles", className)} {...props}>
      {children}
    </button>
  )
);

// Integration
<Tooltip.Trigger asChild>
  <CustomButton variant="icon" size="small">i</CustomButton>
</Tooltip.Trigger>
```

**Critical**: All Radix-injected props must be spread onto the underlying DOM node.

### Pattern 2: Portal Container Pattern

**When**: Portal content loses theme context (CSS variables, theme tokens) because it renders outside the themed root

**Template**: Custom portal container within theme boundary
```typescript
const portalContainerRef = useRef<HTMLDivElement>(null);

<div ref={portalContainerRef} className="theme-root">
  <Theme>
    <Dialog.Root>
      <Dialog.Portal container={portalContainerRef.current}>
        <Dialog.Content>Content inherits theme</Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </Theme>
</div>
```

**Workaround**: Use `container` prop to mount portal content within theme boundary.

### Pattern 3: Complex Dropdown Menu

**When**: Multi-level menus with stateful elements (checkboxes, radio groups)

**Template**: DropdownMenu with Sub, CheckboxItem, Separator
```typescript
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const [checked, setChecked] = React.useState(true);

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>...</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Item>New Tab</DropdownMenu.Item>
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>More Tools</DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Save Page</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
      <DropdownMenu.Separator />
      <DropdownMenu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
        Show Bookmarks
      </DropdownMenu.CheckboxItem>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

**Best Practice**: SubContent must also use Portal for correct layering.

### Pattern 4: State-Driven Styling

**When**: Conditional styling based on component state (open/closed, checked/unchecked)

**Template**: Tailwind classes with data-[state] selectors
```typescript
<Popover.Content
  className="
    bg-white p-4 rounded
    data-[state=open]:opacity-100 data-[state=closed]:opacity-0
    data-[state=open]:animate-in data-[state=closed]:animate-out
  "
>
```

**Best Practice**: Leverage Radix's internal state management; avoid external state for styling.

## Best Practices

1. **Mandatory Prop Spreading**: All custom components used with `asChild` must spread incoming props (`{...props}`) onto the underlying DOM node. Failure breaks functionality.

2. **Ref Forwarding**: Use `React.forwardRef` for all wrapper components intended for `asChild` usage. Radix requires DOM node references for focus management and positioning.

3. **Component Abstraction**: Encapsulate Radix primitives into high-level custom components. This insulates applications from API changes and ensures consistency.

4. **Semantic Responsibility**: When overriding default element types with `asChild`, verify the new element remains focusable and keyboard-accessible. Use semantic elements or add `tabindex` and keyboard handlers.

5. **Data Attribute Styling**: Use Radix's `data-*` attributes for state-based styling. This eliminates external state manipulation and ensures visual feedback matches component behavior.

6. **Labeling**: Provide accessible names using the Label primitive or `aria-label` for non-form controls. Radix manages ARIA attributes, but accessible names are the developer's responsibility.

## Workarounds

### Workaround 1: CSS Order Conflicts (Tailwind + Radix Themes)

**When**: Tailwind base styles load after Radix Themes CSS, removing essential styling (background colors, etc.)

**Solution**: Explicit CSS layering with PostCSS

**Implementation**:
```css
/* globals.css - Manual import order */
@import "tailwindcss/base";
@import "@radix-ui/themes/styles.css";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

**Alternative**: Use granular Radix Themes imports (`tokens.css`, `components.css`, `utilities.css`) for precise specificity control.

**Trade-off**: Requires PostCSS configuration and explicit import management.

### Workaround 2: Portal Context Loss

**When**: Portal content renders outside the `<Theme>` component, losing CSS variables and theme tokens

**Solution**: Custom portal container pattern

**Implementation**:
```typescript
const portalRef = useRef<HTMLDivElement>(null);

<Theme>
  <div ref={portalRef}>
    <Dialog.Root>
      <Dialog.Portal container={portalRef.current}>
        <Dialog.Content>Inherits theme</Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>
</Theme>
```

**Trade-off**: Requires DOM structure planning and ref management.

### Workaround 3: Theme Palette Abstraction

**When**: Need role-based color names (primary, secondary, warning) instead of Radix's physical tokens (crimson, indigo)

**Solution**: Custom ThemePalette context provider

**Implementation**:
```typescript
const ThemePaletteContext = createContext<PaletteMap>({});

const paletteMap = {
  primary: 'crimson',
  secondary: 'indigo',
  warning: 'amber'
};

<ThemePaletteContext.Provider value={paletteMap}>
  <Theme accentColor={paletteMap.primary}>
    {/* Components use abstract names */}
  </Theme>
</ThemePaletteContext.Provider>
```

**Trade-off**: Additional abstraction layer adds complexity but maintains design system vocabulary.

## Anti-Patterns to Avoid

### 1. Missing Prop Spreading

**Issue**: Radix-injected props (event handlers, state attributes) not spread onto custom component's DOM node, causing broken functionality (triggers don't open dialogs/tooltips).

**Detection**: Component appears visually correct but doesn't respond to interactions.

**Resolution**: Add `{...props}` spread to custom component's root element.

```typescript
// ❌ Anti-pattern
const MyButton = ({ children }) => <button>{children}</button>;

// ✅ Correct
const MyButton = ({ children, ...props }) => <button {...props}>{children}</button>;
```

### 2. Non-Functional Element Overrides

**Issue**: Using `div` without `tabindex` or keyboard handlers as interactive trigger breaks accessibility.

**Detection**: Component not keyboard accessible, fails WAI-ARIA compliance.

**Resolution**: Use semantic elements (`button`, `a`) or add `tabindex={0}`, `role`, and keyboard event handlers.

```typescript
// ❌ Anti-pattern
<Tooltip.Trigger asChild>
  <div>Trigger</div>
</Tooltip.Trigger>

// ✅ Correct
<Tooltip.Trigger asChild>
  <button>Trigger</button>
</Tooltip.Trigger>
```

### 3. CSS Order Conflicts

**Issue**: Tailwind base styles override Radix Themes styles, removing background colors and essential styling.

**Detection**: Components lose styling after Tailwind configuration, background colors disappear.

**Resolution**: Implement explicit CSS layering (Workaround 1) or use granular Radix Themes imports.

### 4. Portal Context Loss

**Issue**: Portal content renders outside theme boundary, losing CSS variables and theme tokens, causing styling breaks.

**Detection**: Portal-based components (Dialog, Tooltip) have incorrect colors or missing styles.

**Resolution**: Use custom portal container pattern (Workaround 2) to mount portals within theme boundary.

### 5. Rigid Theming

**Issue**: Radix Themes uses physical color tokens (crimson, indigo) instead of role-based names (primary, secondary), limiting design system flexibility.

**Detection**: Components default to accent color only, cannot use abstract color names.

**Resolution**: Implement theme palette abstraction layer (Workaround 3) to map abstract names to Radix tokens.

## Code Templates

### Template 1: Custom Dialog Component Abstraction

```typescript
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef(
  ({ children, ...props }, forwardedRef) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/50" />
      <DialogPrimitive.Content
        {...props}
        ref={forwardedRef}
        className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-[30px] rounded-md shadow-2xl"
      >
        {children}
        <DialogPrimitive.Close aria-label="Close">
          <Cross1Icon />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
```

### Template 2: asChild Trigger Integration

```typescript
const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <button ref={ref} className={cn("base-styles", className)} {...props}>
      {children}
    </button>
  )
);

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <CustomButton variant="icon">Info</CustomButton>
  </Tooltip.Trigger>
  <Tooltip.Content>Tooltip content</Tooltip.Content>
</Tooltip.Root>
```

### Template 3: Complex Dropdown Menu

```typescript
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>...</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Item>Item</DropdownMenu.Item>
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>Submenu</DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Sub Item</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
      <DropdownMenu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
        Checkbox Item
      </DropdownMenu.CheckboxItem>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

### Template 4: State-Driven Styling

```typescript
<Popover.Content
  className="
    bg-white p-4 rounded shadow-xl
    data-[state=open]:animate-in data-[state=open]:fade-in-0
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0
    data-[side=bottom]:slide-in-from-top-2
  "
>
  Content
</Popover.Content>
```

## Real-World Examples

### Example 1: Production Dialog Component

```typescript
// components/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/50 z-50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-6 rounded-lg shadow-xl z-50",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-4 right-4" aria-label="Close">
        <Cross1Icon />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
```

### Example 2: Custom Button as Tooltip Trigger

```typescript
// components/custom-button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "icon";
  size?: "small" | "medium" | "large";
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, className, variant = "default", size = "medium", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "rounded font-medium transition-colors",
        variant === "icon" && "p-2",
        size === "small" && "text-sm px-3 py-1.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

// Usage with Tooltip
import * as Tooltip from "@radix-ui/react-tooltip";

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <CustomButton variant="icon" size="small">i</CustomButton>
  </Tooltip.Trigger>
  <Tooltip.Content>This uses asChild with prop spreading</Tooltip.Content>
</Tooltip.Root>
```

## Error Handling

- **Prop Spreading Errors**: If component doesn't respond to interactions, verify `{...props}` is spread on root element
- **Ref Forwarding Errors**: If positioning or focus management fails, verify `React.forwardRef` is used
- **Portal Context Errors**: If portal styling breaks, verify portal container is within theme boundary
- **CSS Conflict Errors**: If styles disappear, check CSS import order and implement explicit layering

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys or tokens in component code
- ❌ No credentials in SKILL.md or templates
- ✅ Use environment variables for configuration
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Components require React 18+ for concurrent features
- TypeScript recommended for type safety with Radix primitives
- Portal components require careful DOM structure planning

## Dependencies

This skill requires:
- `react>=18.0.0`: React framework
- `typescript>=5.0.0`: TypeScript for type safety
- `@radix-ui/react-*`: Radix UI primitive packages (dialog, tooltip, dropdown-menu, popover)
- `tailwindcss>=3.0.0`: Tailwind CSS for utility-first styling (if used)

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment.

## Performance Considerations

- **Portal Optimization**: Minimize portal usage; only use for components requiring z-index layering
- **State Management**: Leverage Radix's internal state via data attributes; avoid external state for styling
- **Component Abstraction**: Cache abstracted components to prevent unnecessary re-renders
- **Ref Management**: Use refs efficiently; avoid creating unnecessary ref objects

## Related Resources

For extensive reference materials:
- Radix UI Documentation: https://www.radix-ui.com/docs
- WAI-ARIA Patterns: https://www.w3.org/WAI/ARIA/apg/
- Tailwind CSS Data Attributes: https://tailwindcss.com/docs/hover-focus-and-other-states#data-attributes

## Notes

- Radix primitives default to uncontrolled mode for rapid implementation; can be fully controlled for complex state management
- Focus management is automatic but relies on developer-provided accessible labels
- Portal components require explicit container management for theme inheritance
- CSS conflicts with Tailwind require explicit import ordering or granular Radix Themes imports

