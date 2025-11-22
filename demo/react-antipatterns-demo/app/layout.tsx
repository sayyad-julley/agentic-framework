import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Anti-Patterns Demo",
  description: "Interactive demonstration of React 18 anti-patterns and their workarounds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

