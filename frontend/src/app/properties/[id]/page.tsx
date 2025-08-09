'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Car,
  Wifi,
  Shield,
  Dumbbell,
  Waves,
  Trees,
  Star,
  ChevronLeft,
  ChevronRight,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

// Mock property data
const mockProperty = {
  id: '1',
  title: 'Departamento Moderno en San Isidro',
  location: 'San Isidro, Lima',
  fullAddress: 'Av. Javier Prado Este 1234, San Isidro, Lima',
  price: 450000,
  type: 'apartment',
  status: 'available',
  bedrooms: 3,
  bathrooms: 2,
  area: 120,
  parkingSpaces: 2,
  floor: 8,
  totalFloors: 15,
  yearBuilt: 2020,
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  ],
  description: `Hermoso departamento moderno ubicado en el corazón de San Isidro, una de las zonas más exclusivas de Lima. 
  
  Este espacioso departamento de 120m² cuenta con acabados de primera calidad, amplias ventanas que brindan excelente iluminación natural y una distribución funcional perfecta para familias modernas.
  
  La propiedad se encuentra en el 8vo piso de un edificio de 15 pisos con ascensor, ofreciendo vistas panorámicas de la ciudad y el parque cercano.`,
  
  features: [
    { icon: Car, label: 'Estacionamiento', value: '2 espacios' },
    { icon: Dumbbell, label: 'Gimnasio', value: 'Incluido' },
    { icon: Waves, label: 'Piscina', value: 'Techada' },
    { icon: Shield, label: 'Seguridad', value: '24 horas' },
    { icon: Wifi, label: 'Internet', value: 'Fibra óptica' },
    { icon: Trees, label: 'Áreas verdes', value: 'Jardines' },
  ],
  
  agent: {
    id: 'agent-1',
    name: 'María González',
    phone: '+51 999 123 456',
    email: 'maria.gonzalez@proptechnexus.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 4.8,
    totalSales: 45,
    experience: '5 años',
  },
  
  nearbyPlaces: [
    { name: 'Centro Comercial Jockey Plaza', distance: '0.5 km', type: 'shopping' },
    { name: 'Parque El Olivar', distance: '0.3 km', type: 'park' },
    { name: 'Estación Metro San Isidro', distance: '0.8 km', type: 'transport' },
    { name: 'Hospital Anglo Americano', distance: '1.2 km', type: 'hospital' },
    { name: 'Colegio San Patricio', distance: '0.7 km', type: 'school' },
  ],
  
  isFavorite: false,
  views: 1250,
  publishedDate: '2024-01-15',
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [property, setProperty] = useState(mockProperty)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'sold':
        return 'bg-red-500'
      case 'rented':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'sold':
        return 'Vendido'
      case 'rented':
        return 'Alquilado'
      default:
        return 'No disponible'
    }
  }

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar propiedades favoritas.",
        variant: "destructive",
      })
      return
    }

    setProperty(prev => ({ ...prev, isFavorite: !prev.isFavorite }))
    toast({
      title: property.isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: property.isFavorite 
        ? "La propiedad se eliminó de tus favoritos." 
        : "La propiedad se agregó a tus favoritos.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Mira esta propiedad: ${property.title} en ${property.location}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Enlace copiado",
        description: "El enlace de la propiedad se copió al portapapeles.",
      })
    }
  }

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar al agente.",
        variant: "destructive",
      })
      return
    }
    setShowContactForm(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              
              <Button
                variant={property.isFavorite ? "default" : "outline"}
                size="sm"
                onClick={handleFavoriteToggle}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${property.isFavorite ? 'fill-current' : ''}`} />
                {property.isFavorite ? 'Guardado' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-t-lg">
                  <Image
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(property.status)} text-white border-0`}>
                      {getStatusText(property.status)}
                    </Badge>
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {property.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Vista ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl lg:text-3xl">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>{property.fullAddress}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.views.toLocaleString()} visualizaciones
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Features */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Dormitorios</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Baños</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Square className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.area}m²</div>
                      <div className="text-sm text-gray-600">Área</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.parkingSpaces}</div>
                      <div className="text-sm text-gray-600">Estacionamientos</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Características</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.features.map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{feature.label}</div>
                            <div className="text-sm text-gray-600">{feature.value}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-600">Piso</div>
                    <div className="font-semibold">{property.floor} de {property.totalFloors}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Año de construcción</div>
                    <div className="font-semibold">{property.yearBuilt}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Publicado</div>
                    <div className="font-semibold">
                      {new Date(property.publishedDate).toLocaleDateString('es-PE')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Places */}
            <Card>
              <CardHeader>
                <CardTitle>Lugares cercanos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{place.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{place.type}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{place.distance}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle>Agente inmobiliario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{property.agent.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{property.agent.rating}</span>
                      <span>•</span>
                      <span>{property.agent.totalSales} ventas</span>
                    </div>
                    <div className="text-sm text-gray-600">{property.agent.experience} de experiencia</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleContact}
                    className="w-full flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contactar agente
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Llamar
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                  
                  {/* Edit button for agents */}
                  {user && user.role === 'agent' && (
                    <Button 
                      onClick={() => router.push(`/properties/${params.id}/edit`)}
                      variant="secondary"
                      className="w-full flex items-center gap-2 mt-3"
                    >
                      <Edit className="h-4 w-4" />
                      Editar propiedad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Visit */}
            <Card>
              <CardHeader>
                <CardTitle>Agendar visita</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Inicia sesión",
                        description: "Debes iniciar sesión para agendar una visita.",
                        variant: "destructive",
                      })
                      return
                    }
                    toast({
                      title: "Próximamente",
                      description: "La función de agendar visitas estará disponible pronto.",
                    })
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Agendar visita
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de propiedad:</span>
                  <span className="font-mono text-sm">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="capitalize">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge variant="outline">{getStatusText(property.status)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
