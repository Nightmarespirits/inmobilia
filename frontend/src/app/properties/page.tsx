'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyCard } from '@/components/property/property-card'
import { ContactModal } from '@/components/property/contact-modal'
import { SearchFilters } from '@/components/search/search-filters'
import { useAuth } from '@/hooks/use-auth'
import { useContactRedirect } from '@/hooks/use-contact-redirect'
import { getProperties, searchProperties } from '@/lib/services/properties'
// Las funciones de favoritos ahora se manejan internamente en PropertyCard
import { useToast } from '@/hooks/use-toast'
import { supabase, type Property } from '@/lib/supabase'
import { contactTrackingService } from '@/lib/services/contact-tracking'
import Link from 'next/link'

type ViewMode = 'grid' | 'list'
type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'area-desc'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState({})
  // Estado de favoritos removido - se maneja en PropertyCard
  
  // Contact Modal State
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
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // Hook para manejar redirecciones automáticas post-login
  useContactRedirect()

  // Cargar propiedades desde Supabase
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        const propertiesData = await getProperties()
        setProperties(propertiesData)
      } catch (error) {
        console.error('Error loading properties:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las propiedades. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [user, toast])

  // Filtrar y ordenar propiedades
  useEffect(() => {
    let filtered = [...properties]
    
    // Aplicar término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Aplicar filtros
    // TODO: Implementar lógica de filtros basada en currentFilters
    
    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'area-desc':
          return b.area - a.area
        case 'newest':
        default:
          // Ordenar por fecha de creación (más recientes primero)
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
    })
    
    setFilteredProperties(filtered)
  }, [properties, searchTerm, sortBy]) // Favoritos removidos - se manejan en PropertyCard

  // Manejar vista de detalles
  const handleViewDetails = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  // Manejar contacto con agente - Flujo simplificado
  const handleContact = async (propertyId: string, agentId: string, propertyTitle: string) => {
    // Si el usuario no está autenticado, guardar intención y redirigir a login
    if (!user) {
      // Guardar intención de contacto
      contactTrackingService.saveContactIntent(propertyId, agentId, propertyTitle)
      
      // Notificar al usuario
      toast({
        title: "Inicia sesión para continuar",
        description: "Te redirigiremos para que puedas contactar al agente.",
      })
      
      // Redirigir a login
      router.push('/auth/login')
      return
    }

    // Si el usuario está autenticado, mostrar modal simplificado
    try {
      // Obtener información del agente
      const { data: agentData, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', agentId)
        .single()

      if (error) {
        console.error('Error fetching agent data:', error)
      }

      // Abrir modal de contacto simplificado
      setContactModal({
        isOpen: true,
        propertyId,
        propertyTitle,
        agentId,
        agentName: agentData?.full_name || 'Agente Inmobiliario',
        agentAvatar: agentData?.avatar_url,
      })
    } catch (error) {
      console.error('Error opening contact modal:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del agente.",
        variant: "destructive",
      })
    }
  }

  // Cerrar modal de contacto
  const handleCloseContactModal = () => {
    setContactModal({
      isOpen: false,
      propertyId: '',
      propertyTitle: '',
      agentId: '',
    })
  }

  const handleFiltersApply = async (filters: any) => {
    setCurrentFilters(filters)
    setIsLoading(true)
    
    try {
      // Si hay filtros aplicados, usar búsqueda con filtros
      const hasFilters = Object.keys(filters).some(key => 
        filters[key] !== undefined && filters[key] !== '' && 
        (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
      )
      
      let propertiesData
      if (hasFilters || searchTerm) {
        // Usar búsqueda avanzada
        propertiesData = await searchProperties({
          query: searchTerm,
          ...filters
        })
      } else {
        // Cargar todas las propiedades
        propertiesData = await getProperties()
      }
      
      setProperties(propertiesData)
    } catch (error) {
      console.error('Error applying filters:', error)
      toast({
        title: "Error",
        description: "No se pudieron aplicar los filtros. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
              <p className="text-gray-600 mt-1">
                Encuentra tu propiedad ideal entre {filteredProperties.length} opciones disponibles
              </p>
            </div>
            
            {user?.role === 'agent' && (
              <Link href="/properties/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Publicar Propiedad
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por ubicación, título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="area-desc">Mayor área</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b"
        >
          <div className="container mx-auto px-4 py-6">
            <SearchFilters
              onFiltersChange={handleFiltersApply}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}

      {/* Properties Grid/List */}
      <div className="container mx-auto px-4 py-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros de búsqueda o explora otras opciones.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  image={property.images[0] || '/placeholder-property.jpg'}
                  status={property.status}
                  agentId={property.agent_id}
                  onView={handleViewDetails}
                  onContact={handleContact}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

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
