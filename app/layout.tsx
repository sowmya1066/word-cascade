import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Word Cascade',
  description: 'Created by Sowmya',
  generator: 'dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
