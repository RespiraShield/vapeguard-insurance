import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://launch.respirashield.com'),
  title: {
    default: 'RespiraShield | Insurance That Actually Gets You',
    template: '%s | RespiraShield'
  },
  description: 'Specialized health coverage and treatment support for vape users. Zero commitment, just your interest. Join early supporters shaping the future of vape insurance.',
  keywords: ['vape insurance', 'health coverage', 'treatment support', 'respiratory health', 'RespiraShield', 'specialized insurance', 'vape user insurance'],
  authors: [{ name: 'RespiraShield', url: 'https://launch.respirashield.com' }],
  creator: 'RespiraShield',
  publisher: 'RespiraShield',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'RespiraShield | Insurance That Actually Gets You',
    description: 'Specialized health coverage and treatment support for vape users. Zero commitment, just your interest.',
    url: 'https://launch.respirashield.com',
    siteName: 'RespiraShield',
    type: 'website',
    locale: 'en_US',
    // TODO: Add og-image.png (1200x630px) for social media sharing
    // images: [
    //   {
    //     url: '/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'RespiraShield - Insurance for Vape Users',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RespiraShield | Insurance That Actually Gets You',
    description: 'Specialized health coverage and treatment support for vape users.',
    creator: '@respirashield',
    // TODO: Add og-image for Twitter sharing
    // images: ['/og-image.png'],
  },
  verification: {
    google: 'verification_token',
  },
  alternates: {
    canonical: 'https://launch.respirashield.com',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
