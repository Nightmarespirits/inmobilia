'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/image-upload'
import { LoadingSpinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createProperty } from '@/lib/services/properties'

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

// Esquema de validación con Zod que coincide con CreatePropertyData
const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  type: z.enum(['apartment', 'house', 'commercial', 'land']),
  status: z.enum(['available', 'sold', 'rented', 'pending']).default('available'),
  bedrooms: z.number().min(0, 'El número de dormitorios no puede ser negativo').max(20, 'Número de dormitorios inválido'),
  bathrooms: z.number().min(0, 'El número de baños no puede ser negativo').max(20, 'Número de baños inválido'),
  area: z.number().min(1, 'El área debe ser mayor a 0').max(10000, 'El área parece demasiado grande'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres').max(200, 'La dirección no puede exceder 200 caracteres'),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres').max(100, 'La ubicación no puede exceder 100 caracteres'),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url('URL de imagen inválida')).min(1, 'Debe agregar al menos una imagen').max(20, 'Máximo 20 imágenes permitidas')
})

type PropertyFormData = z.infer<typeof propertySchema>

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
  
  const [isLoading, setIsLoading] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
      status: 'available',
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      features: [],
      images: []
    },
    mode: 'onChange'
  })
  
  const watchedFeatures = watch('features')
  const watchedImages = watch('images')

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

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = watchedFeatures || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    setValue('features', newFeatures)
  }

  const handleAddCustomFeature = () => {
    if (newFeature.trim() && !watchedFeatures?.includes(newFeature.trim())) {
      setValue('features', [...(watchedFeatures || []), newFeature.trim()])
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (feature: string) => {
    const newFeatures = (watchedFeatures || []).filter(f => f !== feature)
    setValue('features', newFeatures)
  }

  const handleImagesChange = (urls: string[]) => {
    setValue('images', urls, { shouldValidate: true })
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear una propiedad.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Validar que todos los campos requeridos estén presentes
      if (!data.title || !data.description || !data.price || !data.type || !data.status || 
          data.bedrooms === undefined || data.bathrooms === undefined || !data.area || 
          !data.location || !data.address || !data.images?.length || !data.features) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive",
        })
        return
      }

      // Crear el objeto de datos que coincida exactamente con CreatePropertyData
      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        status: data.status,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        location: data.location,
        address: data.address,
        latitude: -12.0464, // TODO: Implementar geolocalización real
        longitude: -77.0428,
        images: data.images,
        features: data.features
      }
      
      const newProperty = await createProperty(propertyData)
      
      toast({
        title: "¡Propiedad creada!",
        description: `La propiedad "${newProperty.title}" se ha publicado exitosamente.`,
      })
      
      router.push(`/properties/${newProperty.id}`)
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
                <h1 className="text-2xl font-bold">Crear nueva propiedad</h1>
                <p className="text-lg text-gray-600">Completa la información de tu propiedad</p>
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
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || !isValid}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Publicar propiedad
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Información básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título de la propiedad *
                  </label>
                  <Input
                    placeholder="Ej: Hermoso departamento en Miraflores"
                    {...register('title')}
                    className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio (USD) *
                  </label>
                  <Input
                    type="number"
                    placeholder="150000"
                    {...register('price', { valueAsNumber: true })}
                    className={`w-full ${errors.price ? 'border-red-500' : ''}`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de propiedad *
                  </label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value as any)}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado *
                  </label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción *
                </label>
                <Textarea
                  placeholder="Describe las características principales de la propiedad..."
                  {...register('description')}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detalles de la propiedad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Detalles de la propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dormitorios *
                  </label>
                  <Input
                    type="number"
                    placeholder="3"
                    {...register('bedrooms', { valueAsNumber: true })}
                    min="0"
                    className={`w-full ${errors.bedrooms ? 'border-red-500' : ''}`}
                  />
                  {errors.bedrooms && (
                    <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Baños *
                  </label>
                  <Input
                    type="number"
                    placeholder="2"
                    {...register('bathrooms', { valueAsNumber: true })}
                    min="0"
                    className={`w-full ${errors.bathrooms ? 'border-red-500' : ''}`}
                  />
                  {errors.bathrooms && (
                    <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Área (m²) *
                  </label>
                  <Input
                    type="number"
                    placeholder="120"
                    {...register('area', { valueAsNumber: true })}
                    min="1"
                    className={`w-full ${errors.area ? 'border-red-500' : ''}`}
                  />
                  {errors.area && (
                    <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                  )}
                </div>
                

              </div>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={watchedFeatures?.includes(feature) || false}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label htmlFor={feature} className="text-sm font-medium cursor-pointer">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Agregar característica personalizada"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomFeature}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {watchedFeatures && watchedFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedFeatures.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dirección completa *
                </label>
                <Input
                  placeholder="Av. Larco 123, Miraflores, Lima"
                  {...register('address')}
                  className={`w-full ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Distrito/Ubicación *
                </label>
                <Input
                  placeholder="Miraflores"
                  {...register('location')}
                  className={`w-full ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Imágenes de la propiedad *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={watchedImages || []}
                onChange={handleImagesChange}
                maxFiles={20}
                bucket="property-images"
                folder="properties"
              />
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Publicar propiedad
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
