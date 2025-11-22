/**
 * Button Component - Component-First Abstraction
 * 
 * Demonstrates best practices from implementing-tailwind-enterprise skill:
 * - Framework component abstraction for utility composition
 * - Semantic design tokens (brand-primary, brand-hover, etc.)
 * - Props and variants for customization
 * - Single source of truth for button styles
 * 
 * Anti-patterns avoided:
 * - ❌ No class soup (utility combinations abstracted)
 * - ❌ No @apply misuse (framework component used)
 * - ❌ No literal colors (semantic tokens used)
 */

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) => {
  // Base classes - common to all buttons
  const baseClasses =
    "font-medium rounded-lg focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant classes - semantic design tokens
  const variantClasses = {
    primary:
      "bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-brand-on focus:ring-brand-primary",
    secondary:
      "bg-neutral-secondary hover:bg-neutral-hover text-neutral-on focus:ring-neutral-secondary",
    danger:
      "bg-feedback-error hover:bg-feedback-error-hover text-feedback-error-on focus:ring-feedback-error",
    success:
      "bg-feedback-success hover:bg-feedback-success-hover text-feedback-success-on focus:ring-feedback-success",
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

