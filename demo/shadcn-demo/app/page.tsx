"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/metric-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Code,
} from "lucide-react";

/**
 * Custom Button Variant using CVA
 * 
 * Demonstrates CVA Standardization Pattern:
 * - All custom components must use CVA for variant definitions
 * - Ensures theme-aware implementation
 * - Maintains design system integrity
 */
const customButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
        info: "bg-blue-600 text-white hover:bg-blue-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "md",
    },
  }
);

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof customButtonVariants> {
  children: React.ReactNode;
}

function CustomButton({
  variant,
  size,
  className,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      className={cn(customButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * shadcn/ui Production Demo
 * 
 * This demo showcases production-ready shadcn/ui implementation following
 * best practices from implementing-shadcn-ui-production skill.
 * 
 * Key Features Demonstrated:
 * - Atomic Composition Pattern (MetricCard composite)
 * - CVA Standardization (CustomButton with CVA variants)
 * - Advanced Theming (Dark mode via next-themes)
 * - Component Composition
 * - Best Practices and Anti-Pattern Avoidance
 */
export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">shadcn/ui Production Demo</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <nav className="flex items-center gap-4">
              <a
                href="#patterns"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Patterns
              </a>
              <a
                href="#components"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Components
              </a>
              <a
                href="#best-practices"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Best Practices
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Production-Ready shadcn/ui
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Implementation following proven patterns, best practices, and
              architectural strategies from implementing-shadcn-ui-production
              skill.
            </p>
          </section>

          {/* Patterns Section */}
          <section id="patterns" className="space-y-8">
            <h3 className="text-3xl font-semibold">Architectural Patterns</h3>

            <Tabs defaultValue="atomic" className="w-full">
              <TabsList>
                <TabsTrigger value="atomic">Atomic Composition</TabsTrigger>
                <TabsTrigger value="cva">CVA Standardization</TabsTrigger>
                <TabsTrigger value="theming">Advanced Theming</TabsTrigger>
              </TabsList>

              <TabsContent value="atomic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Atomic Composition Pattern</CardTitle>
                    <CardDescription>
                      Build complex business-specific components by composing
                      shadcn/ui primitives as atomic units.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MetricCard
                        title="Total Revenue"
                        value="$45,231.89"
                        change="+20.1% from last month"
                        trend="up"
                        onAction={() => setDialogOpen(true)}
                      />
                      <MetricCard
                        title="Active Users"
                        value="2,350"
                        change="-12.5% from last month"
                        trend="down"
                      />
                      <MetricCard
                        title="Conversion Rate"
                        value="12.5%"
                        change="+2.4% from last month"
                        trend="up"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      MetricCard is a composite component built from Card and
                      Button primitives, demonstrating atomic composition.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cva" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CVA Standardization Pattern</CardTitle>
                    <CardDescription>
                      All custom components must use CVA for variant definitions
                      to ensure theme-aware implementation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Custom Button Variants (CVA)</Label>
                      <div className="flex flex-wrap items-center gap-4">
                        <CustomButton variant="success" size="sm">
                          Success Small
                        </CustomButton>
                        <CustomButton variant="success" size="md">
                          Success Medium
                        </CustomButton>
                        <CustomButton variant="success" size="lg">
                          Success Large
                        </CustomButton>
                        <CustomButton variant="warning">Warning</CustomButton>
                        <CustomButton variant="info">Info</CustomButton>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Standard Button Variants</Label>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Theming Pattern</CardTitle>
                    <CardDescription>
                      Dark mode via next-themes with dual CSS variable
                      declaration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold mb-2">Theme Switching</h4>
                        <p className="text-sm text-muted-foreground">
                          Use the theme toggle in the header to switch between
                          light and dark modes. Theme variables are dual-declared
                          in globals.css.
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Theme-Aware Components</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                          Primary
                        </div>
                        <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
                          Secondary
                        </div>
                        <div className="p-4 rounded-lg bg-muted text-muted-foreground">
                          Muted
                        </div>
                        <div className="p-4 rounded-lg bg-accent text-accent-foreground">
                          Accent
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Components Section */}
          <section id="components" className="space-y-8">
            <h3 className="text-3xl font-semibold">Component Showcase</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dialog Component</CardTitle>
                  <CardDescription>
                    Built on Radix UI Dialog primitive for accessibility.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dialog Example</DialogTitle>
                        <DialogDescription>
                          This dialog demonstrates proper Server/Client component
                          separation. The Dialog is a client component with
                          &apos;use client&apos; directive.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                          Dialog content goes here. This component is built on
                          Radix UI primitives for accessibility and proper focus
                          management.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card Component</CardTitle>
                  <CardDescription>
                    Atomic primitive for building composite components.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cards are atomic primitives that can be composed into
                    higher-level structures like MetricCard.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-sm font-medium">Card Header</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-sm">Card Content</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-sm">Card Footer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Best Practices Section */}
          <section id="best-practices" className="space-y-8">
            <h3 className="text-3xl font-semibold">Best Practices</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Implemented Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>CVA Mandatory:</strong> All custom components
                        use CVA for variant definitions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Dual CSS Variables:</strong> Theme variables
                        declared for both light and dark modes
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Atomic Composition:</strong> Primitives composed
                        into business composites
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Server/Client Separation:</strong> Proper
                        component boundaries to avoid hydration errors
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Anti-Patterns Avoided
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>No Hardcoded Colors:</strong> All colors use
                        CSS variables for theme awareness
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>No SSR Hydration Errors:</strong> Client
                        components properly marked with &apos;use client&apos;
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>No Tailwind Conflicts:</strong> Using @theme
                        inline directive for proper variable mapping
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>No Accessibility Regression:</strong> Built on
                        Radix UI primitives with proper ARIA attributes
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Key Features */}
          <section className="space-y-8">
            <h3 className="text-3xl font-semibold">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Atomic Composition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Build complex components by composing shadcn/ui primitives
                    as atomic units, ensuring reusability and maintainability.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Code className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>CVA Standardization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All custom components use class-variance-authority for
                    type-safe variants and theme-aware implementation.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Production Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Following proven patterns, best practices, and avoiding
                    common anti-patterns for production deployment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto py-8 px-4 text-center text-sm text-muted-foreground">
          <p>
            shadcn/ui Production Demo - Following best practices from
            implementing-shadcn-ui-production skill
          </p>
          <p className="mt-2">
            Atomic Composition • CVA Standardization • Advanced Theming
          </p>
        </div>
      </footer>
    </div>
  );
}

