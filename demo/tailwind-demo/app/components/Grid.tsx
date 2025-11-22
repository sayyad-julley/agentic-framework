/**
 * Grid Component - Layout Component
 * 
 * Demonstrates best practices from implementing-tailwind-enterprise skill:
 * - Responsive grid system
 * - Standardized spacing and gap values
 * - Consistent layout patterns
 */

interface GridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const Grid = ({
  columns = 3,
  gap = "md",
  children,
  className = "",
}: GridProps) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

