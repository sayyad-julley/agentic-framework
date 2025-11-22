"use client";

import * as React from "react";
import { CustomButton } from "@/components/ui/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Radix UI Production Demo
 * 
 * This demo showcases production-ready Radix UI implementation following
 * best practices from implementing-radix-ui-production skill.
 * 
 * Key Patterns Demonstrated:
 * - Pattern 1: asChild Composition with Custom Components
 * - Pattern 2: Component Abstraction (Dialog, Tooltip, DropdownMenu, Popover)
 * - Pattern 3: Complex Dropdown Menu with Sub-menus and Stateful Elements
 * - Pattern 4: State-Driven Styling with Data Attributes
 * - Best Practices: Prop Spreading, Ref Forwarding, Semantic Responsibility
 * - Anti-Pattern Avoidance: Missing Prop Spreading, Non-Functional Overrides
 */
export default function Home() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(true);
  const [position, setPosition] = React.useState("bottom");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Radix UI Production Demo
          </h1>
          <nav className="flex items-center gap-4">
            <a
              href="#aschild"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
            >
              asChild Pattern
            </a>
            <a
              href="#abstraction"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
            >
              Component Abstraction
            </a>
            <a
              href="#dropdown"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
            >
              Complex Dropdown
            </a>
            <a
              href="#styling"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
            >
              State-Driven Styling
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        <div className="space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
              Production-Ready Radix UI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Implementation following proven patterns, best practices, and
              architectural strategies from implementing-radix-ui-production
              skill.
            </p>
          </section>

          {/* Pattern 1: asChild Composition */}
          <section id="aschild" className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                Pattern 1: asChild Composition with Custom Components
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">asChild</code> prop
                delegates Radix&apos;s behavior onto developer-provided elements.
                Custom components MUST use <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">React.forwardRef</code> and
                spread props (<code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{`{...props}`}</code>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tooltip with CustomButton */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Tooltip with CustomButton (asChild)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CustomButton uses forwardRef and prop spreading, making it
                  compatible with asChild.
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomButton variant="primary" size="md">
                        Hover for tooltip
                      </CustomButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This tooltip uses asChild with CustomButton</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Dialog with CustomButton */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Dialog with CustomButton (asChild)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dialog trigger uses asChild to delegate behavior to CustomButton.
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <CustomButton variant="secondary">Open Dialog</CustomButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Example</DialogTitle>
                      <DialogDescription>
                        This dialog demonstrates asChild pattern with CustomButton.
                        The CustomButton component properly forwards refs and spreads
                        props, making it compatible with Radix primitives.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dialog content goes here. This component is built on Radix
                        UI primitives for accessibility and proper focus management.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        variant="secondary"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        variant="primary"
                        onClick={() => setDialogOpen(false)}
                      >
                        Confirm
                      </CustomButton>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Best Practices Note */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <InfoCircledIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                    Best Practices Applied
                  </h5>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Ref Forwarding:</strong> CustomButton uses{" "}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        React.forwardRef
                      </code>{" "}
                      for proper ref attachment
                    </li>
                    <li>
                      <strong>Prop Spreading:</strong> CustomButton spreads{" "}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        {`{...props}`}
                      </code>{" "}
                      onto the button element
                    </li>
                    <li>
                      <strong>Semantic Responsibility:</strong> Using semantic{" "}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        button
                      </code>{" "}
                      element ensures keyboard accessibility
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Pattern 2: Component Abstraction */}
          <section id="abstraction" className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                Pattern 2: Component Abstraction
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Encapsulate Radix primitives into high-level custom components
                to maintain clean APIs and ensure consistency. This pattern
                abstracts complex structural details (Portal, Overlay, Close
                buttons) into reusable components.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dialog Abstraction */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Dialog Component Abstraction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  DialogContent encapsulates Portal, Overlay, and Close button,
                  providing a clean API.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <CustomButton variant="default">Open Abstracted Dialog</CustomButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Abstracted Dialog</DialogTitle>
                      <DialogDescription>
                        This dialog demonstrates component abstraction. The
                        DialogContent component encapsulates Portal, Overlay, and
                        Close button internally.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tooltip Abstraction */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Tooltip Component Abstraction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  TooltipContent encapsulates Portal and styling, providing
                  consistent appearance.
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomButton variant="primary">Hover for abstracted tooltip</CustomButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This tooltip uses component abstraction</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </section>

          {/* Pattern 3: Complex Dropdown Menu */}
          <section id="dropdown" className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                Pattern 3: Complex Dropdown Menu
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Multi-level menus with stateful elements (checkboxes, radio
                groups). SubContent must also use Portal for correct layering.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                Complex Dropdown with Sub-menus and Stateful Elements
              </h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton variant="default">Open Complex Menu</CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Save Page</DropdownMenuItem>
                        <DropdownMenuItem>Print</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Share</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={checked}
                    onCheckedChange={setChecked}
                  >
                    Show Bookmarks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Position</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                    <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="left">Left</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This dropdown demonstrates sub-menus, checkboxes, and radio
                groups. SubContent uses Portal for correct z-index layering.
              </p>
            </div>
          </section>

          {/* Pattern 4: State-Driven Styling */}
          <section id="styling" className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                Pattern 4: State-Driven Styling
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Radix components expose interaction states through{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  data-*
                </code>{" "}
                attributes. Use these attributes with CSS selectors or Tailwind
                JIT syntax for state-driven styling without external state
                management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popover with State-Driven Styling */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Popover with Data Attributes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PopoverContent uses{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    data-[state=open]
                  </code>{" "}
                  and{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    data-[side]
                  </code>{" "}
                  attributes for styling.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <CustomButton variant="primary">Open Popover</CustomButton>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Popover Content</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This popover uses state-driven styling with data
                        attributes. The animation classes use{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                          data-[state=open]
                        </code>{" "}
                        to trigger animations.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* State-Driven Styling Example */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                  Data Attribute Classes
                </h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      data-[state=open]:animate-in
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      data-[state=open]:fade-in-0
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      data-[state=open]:zoom-in-95
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      data-[side=bottom]:slide-in-from-top-2
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These Tailwind classes use Radix&apos;s data attributes for
                  state-driven styling without external state management.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices Summary */}
          <section className="space-y-8">
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
              Best Practices Applied
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  ✅ Implemented Practices
                </h4>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Prop Spreading:</strong> All custom components
                      spread props onto DOM nodes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Ref Forwarding:</strong> All wrapper components use
                      React.forwardRef
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Component Abstraction:</strong> Radix primitives
                      encapsulated in high-level components
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Data Attribute Styling:</strong> Using Radix&apos;s
                      data-* attributes for state-based styling
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-6 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  ⚠️ Anti-Patterns Avoided
                </h4>
                <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Missing Prop Spreading:</strong> All components
                      properly spread props
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Non-Functional Overrides:</strong> Using semantic
                      button elements, not divs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>CSS Order Conflicts:</strong> Proper CSS import
                      order maintained
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>
                      <strong>Portal Context Loss:</strong> Portals properly
                      configured (if theme needed)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="container mx-auto py-8 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Radix UI Production Demo - Following best practices from
            implementing-radix-ui-production skill
          </p>
          <p className="mt-2">
            asChild Composition • Component Abstraction • State-Driven Styling
          </p>
        </div>
      </footer>
    </div>
  );
}

