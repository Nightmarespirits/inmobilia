'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyCard } from '@/components/property/property-card'
import { SearchFilters } from '@/components/search/search-filters'
import { useAuth } from '@/hooks/use-auth'
import { getProperties, searchProperties } from '@/lib/services/properties'
import { toggleFavorite, isFavorite } from '@/lib/services/favorites'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

// Interfaces para propiedades
interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  status: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  description: string
  features: string[]
  isFavorite?: boolean
  created_at?: string
}

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
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set())
  
  const { user } = useAuth()
  const { toast } = useToast()

  // Cargar propiedades desde Supabase
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        const propertiesData = await getProperties()
        
        // Cargar estado de favoritos si el usuario está autenticado
        let favoritesSet = new Set<string>()
        if (user) {
          const favoriteChecks = await Promise.all(
            propertiesData.map(async (property) => {
              const isFav = await isFavorite(user.id, property.id)
              return { id: property.id, isFavorite: isFav }
            })
          )
          favoritesSet = new Set(favoriteChecks.filter(f => f.isFavorite).map(f => f.id))
        }
        
        // Agregar estado de favoritos a las propiedades
        const propertiesWithFavorites = propertiesData.map(property => ({
          ...property,
          isFavorite: favoritesSet.has(property.id)
        }))
        
        setProperties(propertiesWithFavorites)
        setFavoriteProperties(favoritesSet)
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
  }, [properties, searchTerm, sortBy, currentFilters])

  const handleFavoriteToggle = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await toggleFavorite(user.id, propertyId)
      
      // Actualizar estado local
      const newFavorites = new Set(favoriteProperties)
      if (result.added) {
        newFavorites.add(propertyId)
        toast({
          title: "Agregado a favoritos",
          description: "La propiedad se agregó a tus favoritos.",
        })
      } else {
        newFavorites.delete(propertyId)
        toast({
          title: "Removido de favoritos",
          description: "La propiedad se removió de tus favoritos.",
        })
      }
      
      setFavoriteProperties(newFavorites)
      
      // Actualizar propiedades
      setProperties(prev => 
        prev.map(property => 
          property.id === propertyId 
            ? { ...property, isFavorite: result.added }
            : property
        )
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
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
      
      // Actualizar estado de favoritos
      let favoritesSet = new Set<string>()
      if (user) {
        const favoriteChecks = await Promise.all(
          propertiesData.map(async (property) => {
            const isFav = await isFavorite(user.id, property.id)
            return { id: property.id, isFavorite: isFav }
          })
        )
        favoritesSet = new Set(favoriteChecks.filter(f => f.isFavorite).map(f => f.id))
      }
      
      const propertiesWithFavorites = propertiesData.map(property => ({
        ...property,
        isFavorite: favoritesSet.has(property.id)
      }))
      
      setProperties(propertiesWithFavorites)
      setFavoriteProperties(favoritesSet)
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
                  type={property.type}
                  status={property.status}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  image={property.images[0]}
                  isFavorite={property.isFavorite}
                  onFavoriteToggle={handleFavoriteToggle}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
