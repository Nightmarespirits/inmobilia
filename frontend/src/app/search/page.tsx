'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  Map,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// removed unused Card imports
import { Badge } from '@/components/ui/badge'
import { PropertyCard } from '@/components/property/property-card'
import { SearchFilters } from '@/components/search/search-filters'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { searchProperties } from '@/lib/services/properties'
import type { PropertyFilters } from '@/lib/services/properties'
import { favoritesService } from '@/lib/services/favorites'
import type { Property } from '@/lib/supabase'

type UIProperty = Property & { isFavorite: boolean }

// Mock properties data with more variety
const mockProperties = [
  {
    id: '1',
    title: 'Departamento Moderno en San Isidro',
    location: 'San Isidro, Lima',
    price: 450000,
    type: 'apartment',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
    description: 'Hermoso departamento con vista al parque, acabados de primera.',
    features: ['Estacionamiento', 'Gimnasio', 'Piscina', 'Seguridad 24h'],
    isFavorite: false,
    district: 'San Isidro',
    pricePerSqm: 3750,
    yearBuilt: 2020,
    floor: 8,
  },
  {
    id: '2',
    title: 'Casa Familiar en Miraflores',
    location: 'Miraflores, Lima',
    price: 850000,
    type: 'house',
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'],
    description: 'Casa espaciosa ideal para familias, cerca al malecón.',
    features: ['Jardín', 'Cochera doble', 'Terraza', 'Cerca al mar'],
    isFavorite: true,
    district: 'Miraflores',
    pricePerSqm: 4250,
    yearBuilt: 2018,
    floor: 1,
  },
  {
    id: '3',
    title: 'Oficina Comercial en San Borja',
    location: 'San Borja, Lima',
    price: 320000,
    type: 'commercial',
    status: 'available',
    bedrooms: 0,
    bathrooms: 2,
    area: 80,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
    description: 'Oficina moderna en zona comercial, ideal para empresas.',
    features: ['Aire acondicionado', 'Estacionamiento', 'Recepción', 'Sala de reuniones'],
    isFavorite: false,
    district: 'San Borja',
    pricePerSqm: 4000,
    yearBuilt: 2019,
    floor: 5,
  },
  {
    id: '4',
    title: 'Departamento de Lujo en Barranco',
    location: 'Barranco, Lima',
    price: 680000,
    type: 'apartment',
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
    description: 'Departamento de lujo en el corazón bohemio de Lima.',
    features: ['Balcón', 'Vista al mar', 'Acabados premium', 'Zona cultural'],
    isFavorite: false,
    district: 'Barranco',
    pricePerSqm: 7158,
    yearBuilt: 2021,
    floor: 12,
  },
  {
    id: '5',
    title: 'Casa de Campo en Cieneguilla',
    location: 'Cieneguilla, Lima',
    price: 420000,
    type: 'house',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 300,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'],
    description: 'Casa de campo perfecta para escapar de la ciudad.',
    features: ['Piscina', 'Jardín amplio', 'BBQ', 'Aire puro'],
    isFavorite: false,
    district: 'Cieneguilla',
    pricePerSqm: 1400,
    yearBuilt: 2017,
    floor: 1,
  },
  {
    id: '6',
    title: 'Loft Industrial en Callao',
    location: 'Callao, Lima',
    price: 280000,
    type: 'apartment',
    status: 'available',
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
    description: 'Loft de estilo industrial, perfecto para jóvenes profesionales.',
    features: ['Techos altos', 'Diseño moderno', 'Cerca al aeropuerto', 'Transporte público'],
    isFavorite: true,
    district: 'Callao',
    pricePerSqm: 4308,
    yearBuilt: 2019,
    floor: 3,
  },
  {
    id: '7',
    title: 'Penthouse en Surco',
    location: 'Santiago de Surco, Lima',
    price: 1200000,
    type: 'apartment',
    status: 'available',
    bedrooms: 4,
    bathrooms: 4,
    area: 180,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'],
    description: 'Penthouse exclusivo con terraza privada y vista panorámica.',
    features: ['Terraza privada', 'Jacuzzi', 'Vista 360°', 'Ascensor privado'],
    isFavorite: false,
    district: 'Santiago de Surco',
    pricePerSqm: 6667,
    yearBuilt: 2022,
    floor: 20,
  },
  {
    id: '8',
    title: 'Casa Minimalista en La Molina',
    location: 'La Molina, Lima',
    price: 750000,
    type: 'house',
    status: 'available',
    bedrooms: 3,
    bathrooms: 3,
    area: 220,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'],
    description: 'Casa de diseño minimalista en condominio exclusivo.',
    features: ['Diseño moderno', 'Jardín zen', 'Cochera triple', 'Seguridad privada'],
    isFavorite: false,
    district: 'La Molina',
    pricePerSqm: 3409,
    yearBuilt: 2020,
    floor: 1,
  },
]

// Popular search terms
const popularSearches = [
  'Departamentos San Isidro',
  'Casas Miraflores',
  'Oficinas San Borja',
  'Lofts Barranco',
  'Penthouses Surco',
]

// Recent searches (mock data)
const recentSearches = [
  'Departamentos 3 dormitorios',
  'Casas con jardín',
  'Oficinas modernas',
]

type ViewMode = 'grid' | 'list' | 'map'
type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'area-desc' | 'price-per-sqm'

interface FiltersState {
  location?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  features?: string[]
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [properties, setProperties] = useState<UIProperty[]>([])
  const [filteredProperties, setFilteredProperties] = useState<UIProperty[]>([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FiltersState>({})

  // Sorting helper
  const applySort = useCallback((items: UIProperty[]) => {
    const arr = [...items]
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return arr.sort((a, b) => b.price - a.price)
      case 'area-desc':
        return arr.sort((a, b) => b.area - a.area)
      case 'price-per-sqm': {
        return arr.sort((a, b) => {
          const aVal = a.area ? a.price / a.area : Number.POSITIVE_INFINITY
          const bVal = b.area ? b.price / b.area : Number.POSITIVE_INFINITY
          return aVal - bVal
        })
      }
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'relevance':
      default:
        return arr
    }
  }, [sortBy])

  // Fetch properties from Supabase when search term or filters change
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      try {
        const params: PropertyFilters & { query?: string } = {
          ...(activeFilters.type ? { type: activeFilters.type } : {}),
          ...(activeFilters.minPrice ? { minPrice: activeFilters.minPrice } : {}),
          ...(activeFilters.maxPrice ? { maxPrice: activeFilters.maxPrice } : {}),
          ...(activeFilters.bedrooms ? { bedrooms: activeFilters.bedrooms } : {}),
          ...(activeFilters.bathrooms ? { bathrooms: activeFilters.bathrooms } : {}),
          ...(activeFilters.minArea ? { minArea: activeFilters.minArea } : {}),
          ...(activeFilters.maxArea ? { maxArea: activeFilters.maxArea } : {}),
          ...(activeFilters.location ? { location: activeFilters.location } : {}),
        }
        const data = await searchProperties({ query: searchTerm || undefined, ...params })

        // Favorite IDs for current user
        let favoriteIds: string[] = []
        try {
          favoriteIds = await favoritesService.getFavoritePropertyIds()
        } catch (_) {
          // ignore if not logged in
        }

        const mapped: UIProperty[] = data.map(p => ({ ...p, isFavorite: favoriteIds.includes(p.id) }))
        if (!cancelled) {
          setProperties(mapped)
          setFilteredProperties(applySort(mapped))
          toast({ title: 'Búsqueda actualizada', description: `Se encontraron ${mapped.length} propiedades.` })
        }
      } catch (err: any) {
        if (!cancelled) {
          toast({ title: 'Error al cargar propiedades', description: err?.message || 'Intenta nuevamente', variant: 'destructive' })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [searchTerm, activeFilters, applySort])

  // Re-apply sort when sort option changes
  useEffect(() => {
    setFilteredProperties(applySort(properties))
  }, [sortBy, properties, applySort])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleFavoriteToggle = async (propertyId: string) => {
    if (!user) {
      toast({ title: 'Inicia sesión para guardar favoritos', variant: 'destructive' })
      return
    }
    try {
      const added = await favoritesService.toggleFavorite(propertyId)
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isFavorite: added } : p))
      setFilteredProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isFavorite: added } : p))
    } catch (err: any) {
      toast({ title: 'No se pudo actualizar favorito', description: err?.message || 'Intenta nuevamente', variant: 'destructive' })
    }
  }

  const handleFiltersApply = (filters: FiltersState) => {
    setShowFilters(false)
    setActiveFilters(filters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
    handleSearch('')
  }

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
    ).length + (searchTerm ? 1 : 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Propiedades</h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por ubicación, tipo de propiedad, características..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 h-12"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="bg-red-500 text-white ml-1">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
                
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2 h-12"
                  >
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Searches */}
            {!searchTerm && (
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Búsquedas populares</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(search)}
                        className="text-sm"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {user && recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Búsquedas recientes</h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSearch(search)}
                          className="text-sm text-gray-600"
                        >
                          <Bookmark className="h-3 w-3 mr-1" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6">
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="relevance">Más relevantes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="newest">Más recientes</option>
                <option value="area-desc">Mayor área</option>
                <option value="price-per-sqm">Precio por m²</option>
              </select>
            </div>
            
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
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
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
              initialFilters={activeFilters}
            />
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando propiedades...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros de búsqueda o explora otras opciones.
            </p>
            <Button onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Vista de mapa próximamente</p>
            </div>
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
                  status={property.status}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  image={property.images?.[0] || 'https://via.placeholder.com/400x300?text=Propiedad'}
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
