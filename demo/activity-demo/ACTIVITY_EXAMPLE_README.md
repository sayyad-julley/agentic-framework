# React Activity Component Examples

This directory contains examples demonstrating the usage of React's `<Activity />` component, which is a React Labs feature for preserving component state when hiding/showing UI elements.

## What is Activity?

The `<Activity />` component allows you to hide and restore parts of your UI while preserving their internal state. When a component is wrapped in `<Activity>` and its `mode` is set to `'hidden'`, React:

- Unmounts the component's effects
- Deprioritizes updates
- **Retains the component's state**

This is particularly useful for:
- Toggling sidebars without losing state
- Managing tabbed interfaces
- Pre-rendering content that users are likely to access next
- Conditional content display

## Files

### 1. `activity-simple-example.tsx`
A simple, beginner-friendly example showing:
- Basic Activity usage
- State preservation (counter and input field)
- Toggle visibility functionality

### 2. `activity-example.tsx`
A comprehensive example with three use cases:
- **Example 1:** Sidebar with state preservation (expanded sections, search, checkboxes)
- **Example 2:** Tabbed interface with pre-rendering
- **Example 3:** Conditional content display with form data

## Installation

To use these examples, you'll need:

1. **React 19+** (Activity is a React Labs feature)
2. **Ant Design** (for UI components - optional, can be replaced with plain HTML/CSS)

```bash
npm install react react-dom
npm install antd  # Optional, for UI components
```

## Basic Usage

```tsx
import { Activity } from 'react';
import { useState } from 'react';

function App() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide' : 'Show'} Component
      </button>

      <Activity mode={isVisible ? 'visible' : 'hidden'}>
        <YourComponent />
      </Activity>
    </>
  );
}
```

## API

### Activity Props

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'visible' \| 'hidden'` | Controls whether the component is visible or hidden |
| `children` | `ReactNode` | The component(s) whose state should be preserved |

### Mode Values

- **`'visible'`**: Component is rendered normally
- **`'hidden'`**: Component is hidden but state is preserved

## Key Benefits

1. **State Preservation**: Component state (useState, form inputs, etc.) is maintained when hidden
2. **Performance**: Hidden components are unmounted, reducing unnecessary background processing
3. **User Experience**: Seamless UI interactions without losing user input or selections
4. **Pre-rendering**: Can pre-render components for instant switching

## Use Cases

### 1. Toggling Sidebars
```tsx
<Activity mode={isSidebarVisible ? 'visible' : 'hidden'}>
  <Sidebar />
</Activity>
```

### 2. Tabbed Interfaces
```tsx
{tabs.map(tab => (
  <Activity key={tab.id} mode={activeTab === tab.id ? 'visible' : 'hidden'}>
    <TabContent />
  </Activity>
))}
```

### 3. Conditional Content
```tsx
<Activity mode={showAdvanced ? 'visible' : 'hidden'}>
  <AdvancedOptions />
</Activity>
```

## Important Notes

- Activity is a **React Labs feature**, meaning it's experimental and the API may change
- Requires **React 19+**
- State is preserved, but **effects are cleaned up** when hidden
- Hidden components are **unmounted** (not just hidden with CSS)

## Running the Examples

If you're using Next.js:

```bash
# Copy the example file to your app directory
cp activity-simple-example.tsx app/activity-demo/page.tsx

# Or use it as a component
cp activity-simple-example.tsx components/ActivityExample.tsx
```

If you're using Create React App or Vite:

```bash
# Copy to your src directory
cp activity-simple-example.tsx src/ActivityExample.tsx

# Import and use in your App.tsx
import ActivityExample from './ActivityExample';
```

## References

- [React Activity Documentation](https://react.dev/reference/react/Activity)
- [React Labs: View Transitions, Activity, and More](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more)

## License

MIT

