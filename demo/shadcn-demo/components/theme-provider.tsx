"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * Theme Provider Component
 * 
 * Wraps next-themes ThemeProvider for dark mode support
 * 
 * Best Practice: Use class strategy for theme switching
 * Anti-Pattern: Using inline styles or data attributes for theme
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

