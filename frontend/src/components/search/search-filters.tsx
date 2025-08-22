'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Home, DollarSign, Bed, Bath, Square } from 'lucide-react'

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

interface SearchFiltersProps {
  className?: string
  onFiltersChange?: (filters: FiltersState) => void
  isLoading?: boolean
  initialFilters?: FiltersState
}

export function SearchFilters({ className, onFiltersChange, isLoading, initialFilters }: SearchFiltersProps) {
  const [location, setLocation] = useState<string>(initialFilters?.location || '')
  const [type, setType] = useState<string>(initialFilters?.type || '')
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters?.minPrice !== undefined ? String(initialFilters.minPrice) : ''
  )
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters?.maxPrice !== undefined ? String(initialFilters.maxPrice) : ''
  )
  const [bedrooms, setBedrooms] = useState<string>(
    initialFilters?.bedrooms !== undefined ? String(initialFilters.bedrooms) : ''
  )
  const [bathrooms, setBathrooms] = useState<string>(
    initialFilters?.bathrooms !== undefined ? String(initialFilters.bathrooms) : ''
  )
  const [minArea, setMinArea] = useState<string>(
    initialFilters?.minArea !== undefined ? String(initialFilters.minArea) : ''
  )

  useEffect(() => {
    setLocation(initialFilters?.location || '')
    setType(initialFilters?.type || '')
    setMinPrice(initialFilters?.minPrice !== undefined ? String(initialFilters.minPrice) : '')
    setMaxPrice(initialFilters?.maxPrice !== undefined ? String(initialFilters.maxPrice) : '')
    setBedrooms(initialFilters?.bedrooms !== undefined ? String(initialFilters.bedrooms) : '')
    setBathrooms(initialFilters?.bathrooms !== undefined ? String(initialFilters.bathrooms) : '')
    setMinArea(initialFilters?.minArea !== undefined ? String(initialFilters.minArea) : '')
  }, [initialFilters])

  const applyFilters = () => {
    onFiltersChange?.({
      location: location || undefined,
      type: type || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      minArea: minArea ? Number(minArea) : undefined,
      features: [],
    })
  }

  const clearAll = () => {
    setLocation('')
    setType('')
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setBathrooms('')
    setMinArea('')
    onFiltersChange?.({
      location: undefined,
      type: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      minArea: undefined,
      features: [],
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por distrito, zona..." 
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Propiedad</label>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={type === 'house' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setType(type === 'house' ? '' : 'house')}
              >
                <Home className="h-3 w-3 mr-1" />
                Casa
              </Badge>
              <Badge 
                variant={type === 'apartment' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setType(type === 'apartment' ? '' : 'apartment')}
              >
                <Square className="h-3 w-3 mr-1" />
                Departamento
              </Badge>
              <Badge 
                variant={type === 'commercial' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setType(type === 'commercial' ? '' : 'commercial')}
              >
                <Square className="h-3 w-3 mr-1" />
                Oficina
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Precio Mínimo</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="number" 
                placeholder="0" 
                className="pl-10"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Precio Máximo</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="number" 
                placeholder="Sin límite" 
                className="pl-10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Área (m²)</label>
            <Input 
              type="number" 
              placeholder="Área mínima"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dormitorios</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, '5+'].map((num) => {
                const val = num === '5+' ? 5 : Number(num)
                const selected = bedrooms && Number(bedrooms) === val
                return (
                  <Badge 
                    key={String(num)} 
                    variant={selected ? 'default' : 'outline'} 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setBedrooms(selected ? '' : String(val))}
                  >
                    <Bed className="h-3 w-3 mr-1" />
                    {String(num)}
                  </Badge>
                )
              })}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Baños</label>
            <div className="flex gap-2">
              {[1, 2, 3, '4+'].map((num) => {
                const val = num === '4+' ? 4 : Number(num)
                const selected = bathrooms && Number(bathrooms) === val
                return (
                  <Badge 
                    key={String(num)} 
                    variant={selected ? 'default' : 'outline'} 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setBathrooms(selected ? '' : String(val))}
                  >
                    <Bath className="h-3 w-3 mr-1" />
                    {String(num)}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="flex-1" onClick={applyFilters} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Buscar Propiedades
          </Button>
          <Button variant="outline" onClick={clearAll} disabled={isLoading}>
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
