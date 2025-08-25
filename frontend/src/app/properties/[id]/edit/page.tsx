'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Building,
  DollarSign
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
import { PropertyCardSkeleton } from '@/components/ui/loading-states'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/services/properties'
import type { Property } from '@/lib/supabase'

// Esquema de validación con Zod que coincide con CreatePropertyData
const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  type: z.enum(['apartment', 'house', 'commercial', 'land']),
  status: z.enum(['available', 'sold', 'rented', 'pending']),
  bedrooms: z.number().min(0, 'El número de dormitorios no puede ser negativo').max(20, 'Número de dormitorios inválido'),
  bathrooms: z.number().min(0, 'El número de baños no puede ser negativo').max(20, 'Número de baños inválido'),
  area: z.number().min(1, 'El área debe ser mayor a 0').max(10000, 'El área parece demasiado grande'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres').max(200, 'La dirección no puede exceder 200 caracteres'),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres').max(100, 'La ubicación no puede exceder 100 caracteres'),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url('URL de imagen inválida')).min(1, 'Debe agregar al menos una imagen').max(20, 'Máximo 20 imágenes permitidas')
})

type PropertyFormData = z.infer<typeof propertySchema>

// Opciones para los selects
const propertyTypes = [
  { value: 'apartment', label: 'Departamento', icon: Building },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'commercial', label: 'Comercial', icon: Building },
  { value: 'land', label: 'Terreno', icon: MapPin }
]

const propertyStatuses = [
  { value: 'available', label: 'Disponible' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'sold', label: 'Vendido' },
  { value: 'rented', label: 'Alquilado' }
]

const commonFeatures = [
  'Piscina', 'Gimnasio', 'Ascensor', 'Portería 24h', 'Jardín', 
  'Terraza', 'Balcón', 'Aire acondicionado', 'Calefacción', 
  'Cocina equipada', 'Lavandería', 'Estudio', 'Vestidor'
]

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: 'onChange'
  })

  // Cargar datos de la propiedad
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true)
        const propertyData = await getPropertyById(params.id as string)
        setProperty(propertyData)
        
        // Resetear el formulario con los datos de la propiedad
        reset({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          type: propertyData.type,
          status: propertyData.status,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          area: propertyData.area,
          address: propertyData.address,
          location: propertyData.location,
          features: propertyData.features || [],
          images: propertyData.images || []
        })
      } catch (error) {
        console.error('Error loading property:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la propiedad",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProperty()
    }
  }, [params.id, reset, toast])

  // Función para enviar el formulario
  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSaving(true)
      await updateProperty(params.id as string, data)
      
      toast({
        title: "¡Éxito!",
        description: "La propiedad se ha actualizado correctamente",
      })
      
      router.push(`/properties/${params.id}`)
    } catch (error) {
      console.error('Error updating property:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la propiedad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función para eliminar la propiedad
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteProperty(params.id as string)
      
      toast({
        title: "Propiedad eliminada",
        description: "La propiedad ha sido eliminada exitosamente.",
      })
      
      router.push('/properties')
    } catch (error) {
      console.error('Error deleting property:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para agregar característica
  const addFeature = (feature: string) => {
    const currentFeatures = watch('features') || []
    if (!currentFeatures.includes(feature)) {
      setValue('features', [...currentFeatures, feature])
    }
  }

  // Función para remover característica
  const removeFeature = (feature: string) => {
    const currentFeatures = watch('features') || []
    setValue('features', currentFeatures.filter(f => f !== feature))
  }

  // Estados de carga
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
          <p className="text-gray-600 mb-4">La propiedad que intentas editar no existe o ha sido eliminada.</p>
          <Button onClick={() => router.push('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'agent' && user.id !== property.agent_id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h2>
          <p className="text-gray-600 mb-4">Solo puedes editar tus propias propiedades.</p>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/properties/${params.id}`)}
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
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || !isValid}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                        className={errors.title ? 'border-red-500' : ''}
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
                        className={errors.price ? 'border-red-500' : ''}
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
                      className={errors.address ? 'border-red-500' : ''}
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
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dormitorios *
                      </label>
                      <Input
                        type="number"
                        placeholder="3"
                        {...register('bedrooms', { valueAsNumber: true })}
                        min="0"
                        className={errors.bedrooms ? 'border-red-500' : ''}
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
                        className={errors.bathrooms ? 'border-red-500' : ''}
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
                        className={errors.area ? 'border-red-500' : ''}
                      />
                      {errors.area && (
                        <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imágenes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Imágenes de la propiedad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={watch('images') || []}
                    onChange={(urls) => setValue('images', urls)}
                    maxFiles={20}
                    bucket="property-images"
                    folder={`property-${params.id}`}
                  />
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-2">{errors.images.message}</p>
                  )}
                </CardContent>
              </Card>

              {/* Características */}
              <Card>
                <CardHeader>
                  <CardTitle>Características</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Características actuales */}
                  <div className="flex flex-wrap gap-2">
                    {(watch('features') || []).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Agregar característica personalizada */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar característica personalizada"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newFeature.trim()) {
                            addFeature(newFeature.trim())
                            setNewFeature('')
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newFeature.trim()) {
                          addFeature(newFeature.trim())
                          setNewFeature('')
                        }
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Características comunes */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Características comunes:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonFeatures
                        .filter(feature => !(watch('features') || []).includes(feature))
                        .map((feature) => (
                          <Button
                            key={feature}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFeature(feature)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {feature}
                          </Button>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving || !isValid}
                  className="w-full flex items-center gap-2"
                >
                  {isSaving ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/properties/${params.id}`)}
                  className="w-full flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancelar
                </Button>

                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isDeleting ? 'Eliminando...' : 'Eliminar propiedad'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
