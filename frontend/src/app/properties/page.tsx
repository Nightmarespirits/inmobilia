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
import Link from 'next/link'

// Mock data for properties
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
  },
]

type ViewMode = 'grid' | 'list'
type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'area-desc'

export default function PropertiesPage() {
  const [properties, setProperties] = useState(mockProperties)
  const [filteredProperties, setFilteredProperties] = useState(mockProperties)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { user } = useAuth()

  // Filter and search logic
  useEffect(() => {
    let filtered = [...properties]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'area-desc':
        filtered.sort((a, b) => b.area - a.area)
        break
      case 'newest':
      default:
        // Keep original order for newest
        break
    }

    setFilteredProperties(filtered)
  }, [properties, searchTerm, sortBy])

  const handleFavoriteToggle = (propertyId: string) => {
    setProperties(prev =>
      prev.map(property =>
        property.id === propertyId
          ? { ...property, isFavorite: !property.isFavorite }
          : property
      )
    )
  }

  const handleFiltersApply = (filters: any) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Here you would apply the filters to the properties
      // For now, we'll just close the filters
      setShowFilters(false)
      setIsLoading(false)
    }, 1000)
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
