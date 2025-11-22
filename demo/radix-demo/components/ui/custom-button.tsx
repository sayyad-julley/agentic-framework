"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CustomButton Component
 * 
 * Demonstrates Pattern 1: asChild with Custom Components
 * - Uses React.forwardRef for ref forwarding (MANDATORY)
 * - Spreads incoming props ({...props}) onto DOM node (MANDATORY)
 * - Follows best practice: Mandatory Prop Spreading and Ref Forwarding
 * 
 * This component can be used with asChild prop from Radix primitives
 */
export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(({ className, variant = "default", size = "md", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200":
            variant === "default",
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700":
            variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          "h-8 px-3 text-xs": size === "sm",
          "h-10 px-4 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

CustomButton.displayName = "CustomButton";

