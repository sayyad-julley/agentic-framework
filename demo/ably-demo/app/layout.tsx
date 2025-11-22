import type { Metadata } from "next";
import { AblyProvider } from "./providers/ably-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ably Realtime Demo",
  description: "Production-ready Ably realtime messaging demonstration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AblyProvider>{children}</AblyProvider>
      </body>
    </html>
  );
}

