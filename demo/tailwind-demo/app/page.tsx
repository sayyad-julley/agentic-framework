"use client";

import React from "react";
import { Button } from "./components/Button";
import { Card } from "./components/Card";
import { Container } from "./components/Container";
import { Grid } from "./components/Grid";

/**
 * Tailwind CSS Enterprise Demo
 * 
 * This demo showcases production-ready Tailwind CSS implementation following
 * enterprise best practices from implementing-tailwind-enterprise skill.
 * 
 * Key Features Demonstrated:
 * - Component-First Abstraction (Button, Card, Container, Grid)
 * - Semantic Design Tokens ([role]-[prominence]-[interaction] convention)
 * - Utility-First Patterns
 * - Responsive Design
 * - Layout Components
 * - Best Practices and Anti-Pattern Avoidance
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-surface">
      {/* Header */}
      <header className="bg-neutral-background border-b border-neutral-border shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-neutral-primary">
              Tailwind CSS Enterprise Demo
            </h1>
            <nav className="flex items-center gap-4">
              <a
                href="#components"
                className="text-neutral-secondary hover:text-neutral-primary transition-colors"
              >
                Components
              </a>
              <a
                href="#patterns"
                className="text-neutral-secondary hover:text-neutral-primary transition-colors"
              >
                Patterns
              </a>
              <a
                href="#best-practices"
                className="text-neutral-secondary hover:text-neutral-primary transition-colors"
              >
                Best Practices
              </a>
            </nav>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <Container>
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-neutral-primary">
                Enterprise-Scale Tailwind CSS
              </h2>
              <p className="text-xl text-neutral-secondary max-w-2xl mx-auto">
                Production-ready implementation following proven patterns, best
                practices, and architectural strategies for large-scale
                applications.
              </p>
            </section>

            {/* Component Showcase */}
            <section id="components" className="space-y-8">
              <h3 className="text-3xl font-semibold text-neutral-primary">
                Component-First Abstraction
              </h3>
              <p className="text-neutral-secondary">
                Abstract utility combinations into framework components for
                single source of truth and maintainability.
              </p>

              {/* Button Variants */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Button Component Variants
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" size="sm">
                    Primary Small
                  </Button>
                  <Button variant="primary" size="md">
                    Primary Medium
                  </Button>
                  <Button variant="primary" size="lg">
                    Primary Large
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>
              </Card>

              {/* Card Variants */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Card Component Variants
                </h4>
                <Grid columns={3} gap="md">
                  <Card variant="default">
                    <h5 className="font-semibold text-neutral-primary mb-2">
                      Default Card
                    </h5>
                    <p className="text-neutral-secondary text-sm">
                      Standard card with border and background.
                    </p>
                  </Card>
                  <Card variant="elevated">
                    <h5 className="font-semibold text-neutral-primary mb-2">
                      Elevated Card
                    </h5>
                    <p className="text-neutral-secondary text-sm">
                      Card with shadow for depth.
                    </p>
                  </Card>
                  <Card variant="outlined">
                    <h5 className="font-semibold text-neutral-primary mb-2">
                      Outlined Card
                    </h5>
                    <p className="text-neutral-secondary text-sm">
                      Transparent background with border.
                    </p>
                  </Card>
                </Grid>
              </Card>
            </section>

            {/* Utility-First Patterns */}
            <section id="patterns" className="space-y-8">
              <h3 className="text-3xl font-semibold text-neutral-primary">
                Utility-First Patterns
              </h3>
              <p className="text-neutral-secondary">
                Direct utility class usage for rapid prototyping and
                one-off designs.
              </p>

              {/* Responsive Grid Example */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Responsive Grid Layout
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div
                      key={item}
                      className="bg-brand-primary text-brand-on p-4 rounded-lg text-center font-medium"
                    >
                      Item {item}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Typography Scale */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Typography Scale
                </h4>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-neutral-primary">
                    Heading 1 - 4xl Bold
                  </h1>
                  <h2 className="text-3xl font-semibold text-neutral-primary">
                    Heading 2 - 3xl Semibold
                  </h2>
                  <h3 className="text-2xl font-semibold text-neutral-primary">
                    Heading 3 - 2xl Semibold
                  </h3>
                  <h4 className="text-xl font-medium text-neutral-primary">
                    Heading 4 - xl Medium
                  </h4>
                  <p className="text-base text-neutral-secondary">
                    Body text - base Regular. This demonstrates the typography
                    scale using semantic design tokens.
                  </p>
                  <p className="text-sm text-neutral-subtle">
                    Small text - sm Regular. Used for captions and secondary
                    information.
                  </p>
                </div>
              </Card>

              {/* Spacing Examples */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Spacing System
                </h4>
                <div className="space-y-4">
                  <div className="p-2 bg-brand-primary/10 rounded">
                    <code className="text-sm">p-2</code> - Padding 0.5rem
                  </div>
                  <div className="p-4 bg-brand-primary/10 rounded">
                    <code className="text-sm">p-4</code> - Padding 1rem
                  </div>
                  <div className="p-6 bg-brand-primary/10 rounded">
                    <code className="text-sm">p-6</code> - Padding 1.5rem
                  </div>
                  <div className="p-8 bg-brand-primary/10 rounded">
                    <code className="text-sm">p-8</code> - Padding 2rem
                  </div>
                </div>
              </Card>

              {/* Color System */}
              <Card variant="elevated">
                <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                  Semantic Color Tokens
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="bg-brand-primary text-brand-on p-4 rounded text-center font-medium">
                      Brand Primary
                    </div>
                    <div className="bg-brand-hover text-brand-on p-4 rounded text-center font-medium">
                      Brand Hover
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-feedback-error text-feedback-error-on p-4 rounded text-center font-medium">
                      Error
                    </div>
                    <div className="bg-feedback-error-hover text-feedback-error-on p-4 rounded text-center font-medium">
                      Error Hover
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-feedback-success text-feedback-success-on p-4 rounded text-center font-medium">
                      Success
                    </div>
                    <div className="bg-feedback-success-hover text-feedback-success-on p-4 rounded text-center font-medium">
                      Success Hover
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-feedback-warning text-feedback-warning-on p-4 rounded text-center font-medium">
                      Warning
                    </div>
                    <div className="bg-feedback-warning-hover text-feedback-warning-on p-4 rounded text-center font-medium">
                      Warning Hover
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Best Practices */}
            <section id="best-practices" className="space-y-8">
              <h3 className="text-3xl font-semibold text-neutral-primary">
                Best Practices Implemented
              </h3>

              <Grid columns={2} gap="lg">
                <Card variant="elevated">
                  <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                    ✅ Component-First Abstraction
                  </h4>
                  <ul className="space-y-2 text-neutral-secondary">
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>
                        Utility combinations abstracted into framework
                        components
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>
                        Single source of truth for component styles
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>Props and variants for customization</span>
                    </li>
                  </ul>
                </Card>

                <Card variant="elevated">
                  <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                    ✅ Semantic Design Tokens
                  </h4>
                  <ul className="space-y-2 text-neutral-secondary">
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>
                        [role]-[prominence]-[interaction] naming convention
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>Complete replacement of default palette</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>Global rebranding through configuration</span>
                    </li>
                  </ul>
                </Card>

                <Card variant="elevated">
                  <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                    ✅ Content Configuration
                  </h4>
                  <ul className="space-y-2 text-neutral-secondary">
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>
                        Comprehensive content array for JIT performance
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>All template paths included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-success mr-2">✓</span>
                      <span>Minimal CSS bundle size target (&lt;10kB)</span>
                    </li>
                  </ul>
                </Card>

                <Card variant="elevated">
                  <h4 className="text-xl font-semibold text-neutral-primary mb-4">
                    ✅ Anti-Patterns Avoided
                  </h4>
                  <ul className="space-y-2 text-neutral-secondary">
                    <li className="flex items-start">
                      <span className="text-feedback-error mr-2">❌</span>
                      <span>No @apply misuse</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-error mr-2">❌</span>
                      <span>No class soup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-error mr-2">❌</span>
                      <span>No dynamic class generation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-feedback-error mr-2">❌</span>
                      <span>No literal colors</span>
                    </li>
                  </ul>
                </Card>
              </Grid>
            </section>

            {/* Responsive Design Demo */}
            <section className="space-y-8">
              <h3 className="text-3xl font-semibold text-neutral-primary">
                Responsive Design
              </h3>
              <Card variant="elevated">
                <p className="text-neutral-secondary mb-4">
                  This layout adapts to different screen sizes using Tailwind's
                  responsive breakpoints:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-neutral-surface rounded">
                    <strong>Mobile (default):</strong> Single column layout
                  </div>
                  <div className="p-2 bg-neutral-surface rounded md:hidden">
                    <strong>Tablet (md:):</strong> 2-column layout starting at
                    768px
                  </div>
                  <div className="p-2 bg-neutral-surface rounded lg:hidden">
                    <strong>Desktop (lg:):</strong> 3-column layout starting at
                    1024px
                  </div>
                  <div className="p-2 bg-neutral-surface rounded xl:hidden">
                    <strong>Large (xl:):</strong> 4-column layout starting at
                    1280px
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-background border-t border-neutral-border mt-12">
        <Container>
          <div className="py-8 text-center text-neutral-secondary">
            <p>
              Tailwind CSS Enterprise Demo - Following production-ready best
              practices
            </p>
            <p className="text-sm text-neutral-subtle mt-2">
              Component-First Abstraction • Semantic Design Tokens • Utility-First
              Patterns
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

