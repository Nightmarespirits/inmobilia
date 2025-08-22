'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Bed, Bath, Square, Eye } from 'lucide-react'

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  image: string
  status: 'available' | 'sold' | 'rented' | 'pending'
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onView?: (id: string) => void
  className?: string
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  image,
  status,
  isFavorite = false,
  onFavoriteToggle,
  onView,
  className
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'sold':
        return 'bg-red-500'
      case 'rented':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'sold':
        return 'Vendido'
      case 'rented':
        return 'Alquilado'
      case 'pending':
        return 'Pendiente'
      default:
        return 'N/A'
    }
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="p-0 relative">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getStatusColor(status)} text-white border-0`}>
              {getStatusText(status)}
            </Badge>
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={() => onFavoriteToggle?.(id)}
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
          
          {/* Price Overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 text-white px-3 py-1 rounded-lg">
              <span className="text-lg font-bold">{formatPrice(price)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {bedrooms}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {bathrooms}
              </div>
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {area}m²
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
            <Button size="sm" className="flex-1">
              Contactar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
