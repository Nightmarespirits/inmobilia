'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Trash2,
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Calendar,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

// Mock property data
const mockProperty = {
  id: '1',
  title: 'Departamento Moderno en San Isidro',
  description: 'Hermoso departamento con vista al parque, acabados de primera calidad y ubicación privilegiada.',
  location: 'San Isidro, Lima',
  district: 'San Isidro',
  address: 'Av. Javier Prado Este 1234',
  price: 450000,
  currency: 'USD',
  type: 'apartment',
  status: 'available',
  bedrooms: 3,
  bathrooms: 2,
  area: 120,
  builtArea: 110,
  lotArea: 0,
  yearBuilt: 2020,
  floor: 8,
  totalFloors: 15,
  parking: 2,
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  ],
  features: ['Estacionamiento', 'Gimnasio', 'Piscina', 'Seguridad 24h', 'Ascensor', 'Balcón'],
  amenities: ['Aire acondicionado', 'Calefacción', 'Internet', 'Cable'],
  nearbyPlaces: ['Centro comercial', 'Parque', 'Transporte público', 'Colegios'],
  agent: {
    id: 'agent-1',
    name: 'María González',
    phone: '+51 999 888 777',
    email: 'maria@proptech.com',
  },
}

const propertyTypes = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'office', label: 'Oficina' },
  { value: 'land', label: 'Terreno' },
]

const propertyStatus = [
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'rented', label: 'Alquilado' },
  { value: 'reserved', label: 'Reservado' },
]

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'PEN', label: 'PEN (S/)' },
]

const commonFeatures = [
  'Estacionamiento', 'Gimnasio', 'Piscina', 'Seguridad 24h', 'Ascensor', 
  'Balcón', 'Terraza', 'Jardín', 'Cochera', 'Portería', 'Sala de juegos',
  'Área de BBQ', 'Lavandería', 'Depósito', 'Vista al mar', 'Vista al parque'
]

const commonAmenities = [
  'Aire acondicionado', 'Calefacción', 'Internet', 'Cable', 'Gas natural',
  'Agua caliente', 'Intercomunicador', 'Alarma', 'Closets empotrados'
]

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [property, setProperty] = useState(mockProperty)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFeature, setNewFeature] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  // Redirect if not agent
  useEffect(() => {
    if (!user || user.role !== 'agent') {
      toast({
        title: "Acceso denegado",
        description: "Solo los agentes inmobiliarios pueden editar propiedades.",
        variant: "destructive",
      })
      router.push('/properties')
    }
  }, [user, router, toast])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!property.title.trim()) {
      newErrors.title = 'El título es requerido'
    }

    if (!property.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!property.location.trim()) {
      newErrors.location = 'La ubicación es requerida'
    }

    if (!property.price || property.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }

    if (!property.area || property.area <= 0) {
      newErrors.area = 'El área debe ser mayor a 0'
    }

    if (property.bedrooms < 0) {
      newErrors.bedrooms = 'El número de dormitorios no puede ser negativo'
    }

    if (property.bathrooms < 0) {
      newErrors.bathrooms = 'El número de baños no puede ser negativo'
    }

    if (property.images.length === 0) {
      newErrors.images = 'Debe agregar al menos una imagen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Propiedad actualizada",
        description: "Los cambios se han guardado exitosamente.",
      })
      
      router.push(`/properties/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la propiedad. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProperty(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addFeature = (feature: string) => {
    if (feature && !property.features.includes(feature)) {
      setProperty(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }))
    }
  }

  const removeFeature = (feature: string) => {
    setProperty(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !property.amenities.includes(amenity)) {
      setProperty(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }))
    }
  }

  const removeAmenity = (amenity: string) => {
    setProperty(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const addImage = () => {
    if (newImageUrl && !property.images.includes(newImageUrl)) {
      setProperty(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl]
      }))
      setNewImageUrl('')
    }
  }

  const removeImage = (imageUrl: string) => {
    setProperty(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  if (!user || user.role !== 'agent') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Propiedad</h1>
              <p className="text-gray-600">ID: {params.id}</p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <Input
                    value={property.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Departamento moderno en San Isidro"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={property.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe las características principales de la propiedad..."
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de propiedad *
                    </label>
                    <select
                      value={property.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={property.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {propertyStatus.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación general *
                  </label>
                  <Input
                    value={property.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: San Isidro, Lima"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distrito
                    </label>
                    <Input
                      value={property.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Ej: San Isidro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección exacta
                    </label>
                    <Input
                      value={property.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ej: Av. Javier Prado Este 1234"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price and Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precio y Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio *
                    </label>
                    <Input
                      type="number"
                      value={property.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      placeholder="450000"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={property.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {currencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Bed className="h-4 w-4 inline mr-1" />
                      Dormitorios
                    </label>
                    <Input
                      type="number"
                      value={property.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                      min="0"
                      className={errors.bedrooms ? 'border-red-500' : ''}
                    />
                    {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Bath className="h-4 w-4 inline mr-1" />
                      Baños
                    </label>
                    <Input
                      type="number"
                      value={property.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                      min="0"
                      className={errors.bathrooms ? 'border-red-500' : ''}
                    />
                    {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Ruler className="h-4 w-4 inline mr-1" />
                      Área total (m²) *
                    </label>
                    <Input
                      type="number"
                      value={property.area}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                      min="1"
                      className={errors.area ? 'border-red-500' : ''}
                    />
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estacionamientos
                    </label>
                    <Input
                      type="number"
                      value={property.parking}
                      onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Año de construcción
                    </label>
                    <Input
                      type="number"
                      value={property.yearBuilt}
                      onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="h-4 w-4 inline mr-1" />
                      Piso
                    </label>
                    <Input
                      type="number"
                      value={property.floor}
                      onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pisos totales
                    </label>
                    <Input
                      type="number"
                      value={property.totalFloors}
                      onChange={(e) => handleInputChange('totalFloors', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de la imagen"
                    className="flex-1"
                  />
                  <Button onClick={addImage} disabled={!newImageUrl}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {feature}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature)}
                        className="h-4 w-4 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Nueva característica"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFeature(newFeature)
                        setNewFeature('')
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      addFeature(newFeature)
                      setNewFeature('')
                    }}
                    disabled={!newFeature}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Características comunes:</p>
                  <div className="flex flex-wrap gap-1">
                    {commonFeatures
                      .filter(feature => !property.features.includes(feature))
                      .map((feature, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addFeature(feature)}
                          className="text-xs"
                        >
                          + {feature}
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {amenity}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAmenity(amenity)}
                        className="h-4 w-4 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Nueva comodidad"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addAmenity(newAmenity)
                        setNewAmenity('')
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      addAmenity(newAmenity)
                      setNewAmenity('')
                    }}
                    disabled={!newAmenity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Comodidades comunes:</p>
                  <div className="flex flex-wrap gap-1">
                    {commonAmenities
                      .filter(amenity => !property.amenities.includes(amenity))
                      .map((amenity, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addAmenity(amenity)}
                          className="text-xs"
                        >
                          + {amenity}
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push(`/properties/${params.id}`)}
                  className="w-full"
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
                      toast({
                        title: "Propiedad eliminada",
                        description: "La propiedad ha sido eliminada exitosamente.",
                      })
                      router.push('/properties')
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar propiedad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
