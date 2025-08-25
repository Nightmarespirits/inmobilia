'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin, Home, TrendingUp, Users, Shield, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useContactRedirect } from '@/hooks/use-contact-redirect'
import { useToast } from '@/hooks/use-toast'

import { SearchFilters } from '@/components/search/search-filters'
import { PropertyCard } from '@/components/property/property-card'
import { TestimonialCard } from '@/components/testimonials/testimonial-card'
import { ContactModal } from '@/components/property/contact-modal'
import { LoadingSpinner } from '@/components/ui/spinner'
import { getProperties } from '@/lib/services/properties'
import { Property } from '@/lib/supabase'
import { contactTrackingService } from '@/lib/services/contact-tracking'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    propertyId: string
    propertyTitle: string
    agentId: string
    agentName?: string
    agentAvatar?: string
  }>({
    isOpen: false,
    propertyId: '',
    propertyTitle: '',
    agentId: '',
  })

  const router = useRouter()
  const { toast } = useToast()

  // Hook para manejar redirecciones automáticas post-login
  useContactRedirect()

  // Cargar propiedades destacadas al montar el componente
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setIsLoading(true)
        const properties = await getProperties({
          limit: 6, // Solo mostrar 6 propiedades destacadas
          sortBy: 'created_at',
          order: 'desc'
        })
        
        if (properties && properties.length >= 0) {
          setFeaturedProperties(properties)
        }
      } catch (error) {
        console.error('Error loading featured properties:', error)
        toast({
          title: "Error",
          description: "Error al cargar propiedades destacadas.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirigir a página de búsqueda con el término
    if (searchTerm.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleViewProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  const handleContactProperty = async (propertyId: string) => {
    const property = featuredProperties.find(p => p.id === propertyId)
    if (!property) return

    // Guardar intención de contacto si no está autenticado
    contactTrackingService.saveContactIntent(
      property.id,
      property.agent_id,
      property.title
    )

    setContactModal({
      isOpen: true,
      propertyId: property.id,
      propertyTitle: property.title,
      agentId: property.agent_id,
      agentName: property.agent?.name,
      agentAvatar: property.agent?.avatar
    })
  }

  const handleCloseContactModal = () => {
    setContactModal({
      isOpen: false,
      propertyId: '',
      propertyTitle: '',
      agentId: '',
    })
  }

  return (
    <div className="min-h-screen">
      
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Loading State */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="flex gap-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
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
                    agentId={property.agent_id}
                    onView={() => handleViewProperty(property.id)}
                    onContact={() => handleContactProperty(property.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay propiedades disponibles</h3>
              <p className="text-gray-600">Vuelve más tarde para ver nuevas propiedades destacadas.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8"
              onClick={() => router.push('/properties')}
            >
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
              ¿Listo para Transformar tu Experiencia Inmobiliaria?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Encuentra la propiedad de tus sueños o únete como agente profesional para crecer tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => router.push('/search')}
              >
              Buscar Propiedades
              </Button>
              <Button 
                size="lg" 
                className="px-8 py-4 bg-yellow-500 text-primary-900 hover:bg-yellow-400 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
                onClick={() => router.push('/auth/register?type=agent')}
              >
                Comienza Gratis
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              <span className="opacity-75">¿Eres agente inmobiliario?</span> <span className="font-semibold">Registra tu cuenta profesional gratis</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={handleCloseContactModal}
        propertyId={contactModal.propertyId}
        propertyTitle={contactModal.propertyTitle}
        agentId={contactModal.agentId}
        agentName={contactModal.agentName}
        agentAvatar={contactModal.agentAvatar}
      />

    </div>
  )
}
