import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "shadcn/ui Production Demo",
  description: "Production-ready shadcn/ui demonstration following best practices from implementing-shadcn-ui-production skill",
};

/**
 * Root Layout with Theme Provider
 * 
 * Best Practice: Wrap app with ThemeProvider for dark mode support
 * Uses next-themes with class strategy for theme switching
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

