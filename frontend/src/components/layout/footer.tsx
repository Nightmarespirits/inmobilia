'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  platform: [
    { name: 'Cómo funciona', href: '/how-it-works' },
    { name: 'Precios', href: '/pricing' },
    { name: 'Características', href: '/features' },
    { name: 'API', href: '/api' },
  ],
  properties: [
    { name: 'Comprar', href: '/properties/buy' },
    { name: 'Vender', href: '/properties/sell' },
    { name: 'Alquilar', href: '/properties/rent' },
    { name: 'Valoración', href: '/valuation' },
  ],
  professionals: [
    { name: 'Para Agentes', href: '/agents' },
    { name: 'Para Agencias', href: '/agencies' },
    { name: 'Herramientas CRM', href: '/crm' },
    { name: 'Centro de Recursos', href: '/resources' },
  ],
  company: [
    { name: 'Acerca de', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carreras', href: '/careers' },
    { name: 'Contacto', href: '/contact' },
  ],
  legal: [
    { name: 'Términos de Servicio', href: '/terms' },
    { name: 'Política de Privacidad', href: '/privacy' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Aviso Legal', href: '/legal' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/proptechnexus' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/proptechnexus' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/proptechnexus' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/proptechnexus' },
]

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar suscripción al newsletter
    console.log('Newsletter subscription')
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-responsive py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Mantente al día con PropTech Nexus
            </h3>
            <p className="text-gray-400 mb-6">
              Recibe las últimas noticias del mercado inmobiliario, nuevas funcionalidades y consejos exclusivos.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-responsive py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-lg">PropTech Nexus</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              La plataforma inmobiliaria de próxima generación que revoluciona la manera de comprar, 
              vender y alquilar propiedades con tecnología de vanguardia.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contacto@proptechnexus.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+51 1 234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Lima, Perú</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Properties Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Propiedades</h4>
            <ul className="space-y-2">
              {footerLinks.properties.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionals Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Profesionales</h4>
            <ul className="space-y-2">
              {footerLinks.professionals.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="container-responsive py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} PropTech Nexus. Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
