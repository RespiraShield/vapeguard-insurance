import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RespiraShield Insurance - Specialized Health Coverage for Vape Users',
  description: 'Comprehensive health insurance designed specifically for vape users. Get device protection, liability coverage, and wellness benefits. Plans starting at ₹149/month.',
  keywords: 'vape insurance, health coverage, respiratory health, device protection, wellness benefits',
  authors: [{ name: 'RespiraShield Team' }],
  metadataBase: new URL('https://respirashield.com'),
  openGraph: {
    title: 'RespiraShield Insurance - Specialized Health Coverage',
    description: 'Comprehensive health insurance for vape users. Plans starting at ₹149/month.',
    url: 'https://respirashield.com',
    siteName: 'RespiraShield Insurance',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RespiraShield Insurance',
    description: 'Specialized health coverage for vape users',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#5F4FE8',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
