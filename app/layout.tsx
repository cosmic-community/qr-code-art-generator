import type { Metadata } from 'next'
import './globals.css'
import CosmicBadge from '@/components/CosmicBadge'

export const metadata: Metadata = {
  title: 'QR Code Art Generator',
  description: 'Transform any URL into beautiful, artistic QR codes with customizable styling options',
  keywords: 'QR code, generator, artistic, custom, URL, link',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Access environment variable on server side
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        {/* Console capture script for dashboard debugging */}
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        {/* Pass bucket slug as prop to client component */}
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}