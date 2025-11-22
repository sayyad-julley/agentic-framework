import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client-Side Fetching Demo',
  description: 'Demonstration of Flash of Loading State issue',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

