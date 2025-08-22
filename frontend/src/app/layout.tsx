import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'

// Nota: Fuentes de Google deshabilitadas en dev para evitar timeouts.
// Usa fuentes del sistema vía Tailwind (font-sans). Si se desea, migrar a next/font/local.

export const metadata: Metadata = {
  title: {
    default: 'PropTech Nexus - Plataforma Inmobiliaria de Próxima Generación',
    template: '%s | PropTech Nexus'
  },
  description: 'La plataforma inmobiliaria más avanzada de Perú. Compra, vende y alquila propiedades con tecnología de vanguardia, IA y herramientas profesionales.',
  keywords: ['inmobiliaria', 'propiedades', 'bienes raíces', 'Perú', 'tecnología', 'IA'],
  authors: [{ name: 'PropTech Nexus Team' }],
  creator: 'PropTech Nexus',
  publisher: 'PropTech Nexus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://proptechnexus.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://proptechnexus.com',
    title: 'PropTech Nexus - Plataforma Inmobiliaria de Próxima Generación',
    description: 'La plataforma inmobiliaria más avanzada de Perú con IA y tecnología de vanguardia.',
    siteName: 'PropTech Nexus',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PropTech Nexus - Plataforma Inmobiliaria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropTech Nexus - Plataforma Inmobiliaria de Próxima Generación',
    description: 'La plataforma inmobiliaria más avanzada de Perú con IA y tecnología de vanguardia.',
    images: ['/og-image.jpg'],
    creator: '@proptechnexus',
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
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={`font-sans antialiased`}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  )
}

// Client component to handle conditional layout
function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
