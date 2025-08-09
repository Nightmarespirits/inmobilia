'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Home, TrendingUp, Users, Shield, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchFilters } from '@/components/search/search-filters'
import { PropertyCard } from '@/components/property/property-card'
import { TestimonialCard } from '@/components/testimonials/testimonial-card'

// Datos de ejemplo para el MVP
const featuredProperties = [
  {
    id: '1',
    title: 'Casa Moderna en La Molina',
    price: 450000,
    type: 'Venta',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    location: 'La Molina, Lima',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
    features: ['Piscina', 'Jardín', 'Garaje'],
    agent: {
      name: 'María González',
      avatar: '/images/agent-1.jpg',
      rating: 4.9
    }
  },
  {
    id: '2',
    title: 'Departamento Ejecutivo San Isidro',
    price: 2800,
    type: 'Alquiler',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    location: 'San Isidro, Lima',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'],
    features: ['Vista al mar', 'Gimnasio', 'Seguridad 24h'],
    agent: {
      name: 'Carlos Mendoza',
      avatar: '/images/agent-2.jpg',
      rating: 4.8
    }
  },
  {
    id: '3',
    title: 'Casa de Campo en Cieneguilla',
    price: 320000,
    type: 'Venta',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    location: 'Cieneguilla, Lima',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
    features: ['Piscina', 'Quincho', 'Área verde'],
    agent: {
      name: 'Ana Rodríguez',
      avatar: '/images/agent-3.jpg',
      rating: 4.7
    }
  }
]

const testimonials = [
  {
    name: 'Roberto Silva',
    role: 'Comprador',
    content: 'PropTech Nexus me ayudó a encontrar la casa perfecta en tiempo récord. La búsqueda inteligente es increíble.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Carmen López',
    role: 'Agente Inmobiliario',
    content: 'Como agente, las herramientas de CRM y análisis de mercado han transformado mi negocio completamente.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Diego Morales',
    role: 'Vendedor',
    content: 'Vendí mi departamento 30% más rápido gracias a la valoración automática y el marketing digital.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
]

const stats = [
  { label: 'Propiedades Listadas', value: '10,000+', icon: Home },
  { label: 'Usuarios Activos', value: '50,000+', icon: Users },
  { label: 'Transacciones Exitosas', value: '2,500+', icon: TrendingUp },
  { label: 'Agentes Certificados', value: '1,200+', icon: Shield }
]

const features = [
  {
    icon: Search,
    title: 'Búsqueda Inteligente',
    description: 'Encuentra propiedades usando lenguaje natural y filtros avanzados por estilo de vida.'
  },
  {
    icon: MapPin,
    title: 'Mapas Interactivos',
    description: 'Explora propiedades con mapas detallados y datos de la zona en tiempo real.'
  },
  {
    icon: TrendingUp,
    title: 'Valoración Automática',
    description: 'Obtén estimaciones precisas de precios con nuestro algoritmo de Machine Learning.'
  },
  {
    icon: Zap,
    title: 'Transacciones Digitales',
    description: 'Completa todo el proceso de compra-venta de forma segura y digital.'
  },
  {
    icon: Users,
    title: 'CRM Profesional',
    description: 'Herramientas completas para agentes y agencias inmobiliarias.'
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Protección de datos y transacciones con los más altos estándares de seguridad.'
  }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de búsqueda
    console.log('Búsqueda:', { query: searchQuery, type: searchType })
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container-responsive py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Revoluciona tu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Experiencia Inmobiliaria
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Descubre, compra, vende y alquila propiedades con la plataforma más avanzada del mercado.
              Tecnología de IA, búsqueda inteligente y herramientas profesionales.
            </p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Busca por ubicación, tipo de propiedad o características..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/90 border-0 text-gray-900 placeholder-gray-500 h-12 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </form>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  Casas con piscina
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  Departamentos San Isidro
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  Oficinas Miraflores
                </Badge>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las mejores oportunidades inmobiliarias seleccionadas por nuestros expertos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard 
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  image={property.images[0] || '/images/placeholder.jpg'}
                  status="available"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-8">
              Ver Todas las Propiedades
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tecnología de Vanguardia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas innovadoras que transforman la manera de hacer negocios inmobiliarios
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                      <feature.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimonios reales de personas que han transformado su experiencia inmobiliaria
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialCard 
                  id={testimonial.name}
                  name={testimonial.name}
                  role={testimonial.role}
                  rating={testimonial.rating}
                  comment={testimonial.content}
                  avatar={testimonial.avatar}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para Revolucionar tu Negocio Inmobiliario?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Únete a miles de profesionales que ya están usando PropTech Nexus para crecer sus negocios
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8">
                Comenzar Gratis
              </Button>
              <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-primary-600">
                Solicitar Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
