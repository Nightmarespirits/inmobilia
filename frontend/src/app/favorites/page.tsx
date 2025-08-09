'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Search, Filter, Grid, List, Trash2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/property/property-card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

// Mock favorite properties data
const mockFavoriteProperties = [
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
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
    isFavorite: true,
    savedDate: '2024-01-20',
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
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    isFavorite: true,
    savedDate: '2024-01-18',
  },
]

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc'

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [favorites, setFavorites] = useState(mockFavoriteProperties)
  const [filteredFavorites, setFilteredFavorites] = useState(mockFavoriteProperties)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para ver tus propiedades favoritas.",
        variant: "destructive",
      })
      router.push('/auth/login')
    }
  }, [user, router, toast])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...favorites]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime())
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
    }

    setFilteredFavorites(filtered)
  }, [favorites, searchTerm, sortBy])

  const handleFavoriteToggle = (propertyId: string) => {
    setFavorites(prev => prev.filter(property => property.id !== propertyId))
    toast({
      title: "Eliminado de favoritos",
      description: "La propiedad se eliminó de tus favoritos.",
    })
  }

  const handleClearAll = () => {
    if (favorites.length === 0) return
    
    setFavorites([])
    toast({
      title: "Favoritos eliminados",
      description: "Se eliminaron todas las propiedades de tus favoritos.",
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mis propiedades favoritas',
        text: `Mira mis ${favorites.length} propiedades favoritas en PropTech Nexus`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Enlace copiado",
        description: "El enlace de tus favoritos se copió al portapapeles.",
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para ver tus propiedades favoritas.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-current" />
                Mis Favoritos
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredFavorites.length === 0 
                  ? 'No tienes propiedades favoritas guardadas'
                  : `${filteredFavorites.length} ${filteredFavorites.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}`
                }
              </p>
            </div>
            
            {favorites.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>

          {/* Search and Controls */}
          {favorites.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">Guardados recientemente</option>
                  <option value="oldest">Guardados hace tiempo</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
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
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explora nuestras propiedades y guarda las que más te gusten haciendo clic en el corazón.
            </p>
            <Button 
              onClick={() => router.push('/properties')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Explorar propiedades
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          /* No Results */
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda.
            </p>
          </div>
        ) : (
          /* Properties Grid/List */
          <motion.div
            layout
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredFavorites.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <div className="relative">
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
                    image={property.image}
                    isFavorite={property.isFavorite}
                    onFavoriteToggle={handleFavoriteToggle}
                    className={viewMode === 'list' ? 'flex-row' : ''}
                  />
                  
                  {/* Saved Date Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Guardado {new Date(property.savedDate).toLocaleDateString('es-PE')}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
