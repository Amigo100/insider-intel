import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

/**
 * Typography System
 *
 * Inter: Primary UI font - clean, highly legible, optimized for screens
 * JetBrains Mono: Data/numbers font - tabular figures, clear distinction between similar characters
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
