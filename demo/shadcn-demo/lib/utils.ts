import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 * 
 * Best Practice: Use this utility for all className merging in shadcn/ui components
 * Anti-Pattern: Direct string concatenation or template literals for class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

