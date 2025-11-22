import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unleash Feature Flags Demo",
  description: "Production-ready Unleash feature flag management demonstration",
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

