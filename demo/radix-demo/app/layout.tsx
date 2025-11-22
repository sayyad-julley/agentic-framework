import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radix UI Production Demo",
  description: "Production-ready Radix UI implementation following best practices",
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

