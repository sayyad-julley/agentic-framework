import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linear Demo",
  description: "Real-world Linear API integration demo",
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

