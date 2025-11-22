import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * MetricCard Composite Component
 * 
 * Demonstrates Atomic Composition Pattern from implementing-shadcn-ui-production skill:
 * - Uses base components (Card, Button) as atomic units
 * - Composes them into business-specific composite
 * - Avoids over-nesting and prop drilling
 * 
 * Best Practice: Combine primitives into higher-level structures
 * Anti-Pattern: Over-nesting components, prop drilling through multiple layers
 */
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  onAction?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  onAction,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {trend === "up" && <TrendingUp className="h-4 w-4" />}
          {trend === "down" && <TrendingDown className="h-4 w-4" />}
          {change}
        </div>
        {onAction && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

