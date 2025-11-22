/**
 * Card Component - Composite Component Abstraction
 * 
 * Demonstrates best practices from implementing-tailwind-enterprise skill:
 * - Composite component combining multiple utility classes
 * - Variant system for different card styles
 * - Semantic design tokens for consistent styling
 * - Single source of truth for card styles
 */

interface CardProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card = ({
  variant = "default",
  padding = true,
  children,
  className = "",
}: CardProps) => {
  const variantClasses = {
    default: "bg-neutral-background border border-neutral-border",
    elevated: "bg-neutral-background shadow-md",
    outlined: "bg-transparent border-2 border-neutral-primary",
  };

  return (
    <div
      className={`rounded-lg ${variantClasses[variant]} ${
        padding ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

