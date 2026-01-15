import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteConfig = {
  name: 'InsiderIntel',
  description:
    'Track insider trading and institutional holdings with AI-powered insights. Get real-time alerts on SEC filings and make better investment decisions.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com',
}

export const metadata: Metadata = {
  title: {
    default: 'InsiderIntel - Track Smart Money with AI',
    template: '%s | InsiderIntel',
  },
  description: siteConfig.description,
  keywords: [
    'insider trading',
    'SEC filings',
    'Form 4',
    '13F filings',
    'institutional holdings',
    'stock analysis',
    'smart money',
    'investment research',
    'AI analysis',
    'hedge fund holdings',
  ],
  authors: [{ name: 'InsiderIntel' }],
  creator: 'InsiderIntel',
  publisher: 'InsiderIntel',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: 'InsiderIntel - Track Smart Money with AI',
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InsiderIntel - Track Insider Trading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsiderIntel - Track Smart Money with AI',
    description: siteConfig.description,
    images: ['/og-image.png'],
    creator: '@insiderintel',
  },
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
