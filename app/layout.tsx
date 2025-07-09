import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"//vercel analytics

export const metadata: Metadata = {
  title: 'TikTok Multiviewer',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
