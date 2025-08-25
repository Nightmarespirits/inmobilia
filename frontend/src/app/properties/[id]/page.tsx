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
  Edit,
  Eye,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageGallery } from '@/components/ui/image-gallery'
import { LoadingSpinner } from '@/components/ui/spinner'
import { PropertyCardSkeleton } from '@/components/ui/loading-states'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getPropertyById } from '@/lib/services/properties'
import { toggleFavorite, isFavorite } from '@/lib/services/favorites'
import type { Property } from '@/lib/supabase'

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
  
  const [property, setProperty] = useState<Property | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isToggleFavorite, setIsToggleFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  // Cargar propiedad desde Supabase
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true)
        const propertyData = await getPropertyById(params.id as string)
        setProperty(propertyData)
        
        // Verificar si está en favoritos
        if (user) {
          const favoriteStatus = await isFavorite(user.id, propertyData.id)
          setIsFavorited(favoriteStatus)
        }
      } catch (error) {
        console.error('Error loading property:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la propiedad.",
          variant: "destructive",
        })
        router.push('/properties')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProperty()
    }
  }, [params.id, user, router, toast])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
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

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar a favoritos.",
        variant: "destructive",
      })
      return
    }

    if (!property) return
    
    try {
      setIsToggleFavorite(true)
      await toggleFavorite(user.id, property.id)
      setIsFavorited(!isFavorited)
      
      toast({
        title: isFavorited ? "Eliminado de favoritos" : "Agregado a favoritos",
        description: isFavorited ? "La propiedad se eliminó de tus favoritos." : "La propiedad se agregó a tus favoritos.",
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos.",
        variant: "destructive",
      })
    } finally {
      setIsToggleFavorite(false)
    }
  }

  const handleShare = async () => {
    if (!property) return
    
    const shareData = {
      title: property.title,
      text: `Mira esta propiedad: ${property.title} - ${formatPrice(property.price)}`,
      url: window.location.href,
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Enlace copiado",
          description: "El enlace de la propiedad se copió al portapapeles.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace.",
          variant: "destructive",
        })
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <PropertyCardSkeleton />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Propiedad no encontrada</h2>
          <p className="text-gray-600 mb-4">La propiedad que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => router.push('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>
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
                {/* Image Gallery */}
                <div className="relative">
                  <ImageGallery
                    images={property.images}
                    alt={property.title}
                    className="h-96 md:h-[500px]"
                  />
                  
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={isFavorited ? "default" : "secondary"}
                      onClick={handleFavoriteToggle}
                      disabled={isToggleFavorite}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      {isToggleFavorite ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleShare}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                      <span>{property.fullAddress || property.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(property.views || 0).toLocaleString()} visualizaciones
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
                  
                  {property.parkingSpaces && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.parkingSpaces}</div>
                        <div className="text-sm text-gray-600">Estacionamientos</div>
                      </div>
                    </div>
                  )}
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
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{feature}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  {(property.floor || property.totalFloors) && (
                    <div>
                      <div className="text-sm text-gray-600">Piso</div>
                      <div className="font-semibold">
                        {property.floor && property.totalFloors 
                          ? `${property.floor} de ${property.totalFloors}`
                          : property.floor || property.totalFloors
                        }
                      </div>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div>
                      <div className="text-sm text-gray-600">Año de construcción</div>
                      <div className="font-semibold">{property.yearBuilt}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Publicado</div>
                    <div className="font-semibold">
                      {new Date(property.publishedDate || property.created_at).toLocaleDateString('es-PE')}
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
                  {(property as any).nearbyPlaces && (property as any).nearbyPlaces.length > 0 ? (
                    (property as any).nearbyPlaces.map((place: any, index: number) => (
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
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay información de lugares cercanos disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle>Agente inmobiliario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={property.agent?.avatar} alt={property.agent?.name} />
                    <AvatarFallback>
                      {property.agent?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AG'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">{property.agent?.name || 'Agente no disponible'}</h4>
                    {property.agent?.rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{property.agent?.rating}</span>
                        {(property.agent as any)?.totalSales && (
                          <>
                            <span>•</span>
                            <span>{(property.agent as any).totalSales} ventas</span>
                          </>
                        )}
                      </div>
                    )}
                    {(property.agent as any)?.experience && (
                      <div className="text-sm text-gray-600">{(property.agent as any).experience} de experiencia</div>
                    )}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => property.agent?.phone && window.open(`tel:${property.agent.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                      Llamar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => property.agent?.email && window.open(`mailto:${property.agent.email}`)}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                  
                  {/* Edit button for agents */}
                  {user && (user.role === 'agent' || user.id === property.agent_id) && (
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
                {property.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publicado:</span>
                    <span className="text-sm">
                      {new Date(property.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Vistas:</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{property.views || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
