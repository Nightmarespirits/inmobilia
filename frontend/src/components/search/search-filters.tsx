'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Home, DollarSign, Bed, Bath, Square } from 'lucide-react'

interface SearchFiltersProps {
  className?: string
}

export function SearchFilters({ className }: SearchFiltersProps) {
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
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Propiedad</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                <Home className="h-3 w-3 mr-1" />
                Casa
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                <Square className="h-3 w-3 mr-1" />
                Departamento
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
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
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Área (m²)</label>
            <Input 
              type="number" 
              placeholder="Área mínima"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dormitorios</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, '5+'].map((num) => (
                <Badge 
                  key={num} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  <Bed className="h-3 w-3 mr-1" />
                  {num}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Baños</label>
            <div className="flex gap-2">
              {[1, 2, 3, '4+'].map((num) => (
                <Badge 
                  key={num} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  <Bath className="h-3 w-3 mr-1" />
                  {num}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Buscar Propiedades
          </Button>
          <Button variant="outline">
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
