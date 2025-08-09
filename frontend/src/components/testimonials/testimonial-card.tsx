'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Quote } from 'lucide-react'

interface TestimonialCardProps {
  id: string
  name: string
  role: string
  avatar?: string
  rating: number
  comment: string
  propertyType?: string
  location?: string
  className?: string
}

export function TestimonialCard({
  id,
  name,
  role,
  avatar,
  rating,
  comment,
  propertyType,
  location,
  className
}: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Card className={`relative ${className}`}>
      <CardContent className="p-6">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 text-primary/20">
          <Quote className="h-8 w-8" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {renderStars(rating)}
        </div>
        
        {/* Comment */}
        <blockquote className="text-muted-foreground mb-6 leading-relaxed">
          "{comment || 'Excelente servicio'}"
        </blockquote>
        
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold text-lg">
                {name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{name || 'Usuario'}</h4>
            <p className="text-sm text-muted-foreground">{role || 'Cliente'}</p>
            
            {/* Property Info */}
            {(propertyType || location) && (
              <div className="flex gap-2 mt-2">
                {propertyType && (
                  <Badge variant="secondary" className="text-xs">
                    {propertyType}
                  </Badge>
                )}
                {location && (
                  <Badge variant="outline" className="text-xs">
                    {location}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar múltiples testimonios
interface TestimonialsGridProps {
  testimonials: Omit<TestimonialCardProps, 'className'>[]
  className?: string
}

export function TestimonialsGrid({ testimonials, className }: TestimonialsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          {...testimonial}
        />
      ))}
    </div>
  )
}
