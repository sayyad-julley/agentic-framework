import type { Config } from "tailwindcss";

/**
 * Enterprise-Scale Tailwind CSS Configuration
 * 
 * Following best practices from implementing-tailwind-enterprise skill:
 * - Comprehensive content configuration for JIT performance
 * - Semantic design tokens with [role]-[prominence]-[interaction] convention
 * - Complete replacement of default palette with semantic names
 * - Theme customization for maintainable design system
 */
const config: Config = {
  // CRITICAL: Comprehensive content array for JIT performance
  // All template paths must be included for proper class detection
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Semantic Design Tokens
      // Following [role]-[prominence]-[interaction] naming convention
      colors: {
        // Brand colors - primary brand identity
        brand: {
          primary: "#3B82F6", // Primary brand color
          hover: "#2563EB", // Hover state
          active: "#1D4ED8", // Active/pressed state
          on: "#FFFFFF", // Text color on brand background
        },
        // Neutral colors - text, backgrounds, borders
        neutral: {
          primary: "#1F2937", // Primary text
          secondary: "#4B5563", // Secondary text
          subtle: "#9CA3AF", // Subtle text
          hover: "#374151", // Hover state
          background: "#FFFFFF", // Primary background
          surface: "#F9FAFB", // Surface background
          border: "#E5E7EB", // Border color
          on: "#FFFFFF", // Text on neutral background
        },
        // Feedback colors - status indicators
        feedback: {
          error: "#EF4444",
          "error-hover": "#DC2626",
          "error-on": "#FFFFFF",
          success: "#10B981",
          "success-hover": "#059669",
          "success-on": "#FFFFFF",
          warning: "#F59E0B",
          "warning-hover": "#D97706",
          "warning-on": "#FFFFFF",
          info: "#3B82F6",
          "info-hover": "#2563EB",
          "info-on": "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};

export default config;

