import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algolia Search Demo",
  description: "Real-world Algolia search implementation with Next.js",
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

