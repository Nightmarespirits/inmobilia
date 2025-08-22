'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  MapPin, 
  Home, 
  Building, 
  Store,
  Save,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createProperty } from '@/lib/services/dashboard'
import Image from 'next/image'

const propertyTypes = [
  { value: 'apartment', label: 'Departamento', icon: Building },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'commercial', label: 'Comercial', icon: Store },
]

const propertyStatuses = [
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'rented', label: 'Alquilado' },
]

interface PropertyFormData {
  title: string
  description: string
  price: string
  type: string
  status: string
  bedrooms: string
  bathrooms: string
  area: string
  parkingSpaces: string
  floor: string
  totalFloors: string
  yearBuilt: string
  address: string
  location: string
  features: string[]
  images: string[]
}

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  price: '',
  type: 'apartment',
  status: 'available',
  bedrooms: '',
  bathrooms: '',
  area: '',
  parkingSpaces: '',
  floor: '',
  totalFloors: '',
  yearBuilt: '',
  address: '',
  location: '',
  features: [],
  images: [],
}

const commonFeatures = [
  'Estacionamiento',
  'Gimnasio',
  'Piscina',
  'Seguridad 24h',
  'Ascensor',
  'Balcón',
  'Terraza',
  'Jardín',
  'Aire acondicionado',
  'Calefacción',
  'Internet incluido',
  'Amoblado',
  'Mascotas permitidas',
  'Cerca al transporte público',
  'Vista al mar',
  'Vista a la ciudad',
]

export default function CreatePropertyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Redirect if not agent
  useEffect(() => {
    if (user && user.role !== 'agent') {
      toast({
        title: "Acceso denegado",
        description: "Solo los agentes inmobiliarios pueden crear propiedades.",
        variant: "destructive",
      })
      router.push('/dashboard')
    }
  }, [user, router, toast])

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleAddCustomFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleAddImage = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      const newUrls = [...imageUrls, newImageUrl.trim()]
      setImageUrls(newUrls)
      setFormData(prev => ({
        ...prev,
        images: newUrls
      }))
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls)
    setFormData(prev => ({
      ...prev,
      images: newUrls
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear una propiedad.",
        variant: "destructive",
      })
      return
    }
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      toast({
        title: "Error",
        description: "El precio debe ser un número válido.",
        variant: "destructive",
      })
      return
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "La ubicación es obligatoria.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "La descripción es obligatoria.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Crear la propiedad en Supabase
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        type: formData.type,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area: Number(formData.area) || 0,
        location: formData.location.trim(),
        address: formData.address.trim() || formData.location.trim(),
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        features: formData.features,
        agent_id: user.id
      }
      
      const newProperty = await createProperty(propertyData)
      
      toast({
        title: "¡Propiedad creada!",
        description: `La propiedad "${newProperty.title}" se ha publicado exitosamente.`,
      })
      
      router.push('/properties')
    } catch (error: any) {
      console.error('Error creating property:', error)
      toast({
        title: "Error al crear propiedad",
        description: error?.message || "Hubo un problema al crear la propiedad. Verifica tu conexión y permisos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    toast({
      title: "Vista previa",
      description: "La función de vista previa estará disponible pronto.",
    })
  }

  if (!user || user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
            <p className="text-gray-600 mb-4">
              Solo los agentes inmobiliarios pueden acceder a esta página.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Crear nueva propiedad</h1>
                <p className="text-sm text-gray-600">Completa la información de tu propiedad</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vista previa
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Publicar propiedad'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la propiedad *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Departamento moderno en San Isidro"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (PEN) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="450000"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad *
                  </label>
                  <select
                    value={formData.type}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {propertyStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: San Isidro, Lima"
                    className="w-full"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección completa
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Ej: Av. Javier Prado Este 1234, San Isidro"
                    className="w-full"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe las características principales de la propiedad..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la propiedad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dormitorios
                  </label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="3"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baños
                  </label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área (m²)
                  </label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="120"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estacionamientos
                  </label>
                  <Input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                    placeholder="2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Piso
                  </label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    placeholder="8"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total de pisos
                  </label>
                  <Input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                    placeholder="15"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año de construcción
                  </label>
                  <Input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {commonFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>

              {/* Custom features */}
              {formData.features.filter(f => !commonFeatures.includes(f)).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Características personalizadas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.features
                      .filter(f => !commonFeatures.includes(f))
                      .map(feature => (
                        <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Agregar característica personalizada"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomFeature}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Gallery */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={url}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image */}
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="URL de la imagen (ej: https://images.unsplash.com/...)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              <p className="text-sm text-gray-600">
                Agrega URLs de imágenes de alta calidad. La primera imagen será la imagen principal.
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Publicando...' : 'Publicar propiedad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
