'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Share2 } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTrigger } from './dialog'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  showThumbnails?: boolean
  showCounter?: boolean
  allowDownload?: boolean
  allowShare?: boolean
}

export function ImageGallery({
  images,
  alt = 'Imagen',
  className,
  aspectRatio = 'auto',
  showThumbnails = true,
  showCounter = true,
  allowDownload = false,
  allowShare = false
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        className
      )}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">Sin imágenes</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `imagen-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alt,
          url: imageUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copiar URL al clipboard
      try {
        await navigator.clipboard.writeText(imageUrl)
        // Aquí podrías mostrar un toast de confirmación
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Imagen principal */}
      <div className="relative group">
        <Card className="overflow-hidden">
          <div className={cn(
            "relative",
            aspectRatio === 'square' && 'aspect-square',
            aspectRatio === 'video' && 'aspect-video'
          )}>
            <img
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay con controles */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              {/* Navegación */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Contador */}
              {showCounter && images.length > 1 && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {currentIndex + 1} / {images.length}
                </Badge>
              )}

              {/* Botón de zoom */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0">
                  <FullscreenGallery
                    images={images}
                    initialIndex={currentIndex}
                    alt={alt}
                    onClose={() => setIsModalOpen(false)}
                    allowDownload={allowDownload}
                    allowShare={allowShare}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                </DialogContent>
              </Dialog>

              {/* Acciones adicionales */}
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {allowDownload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => handleDownload(images[currentIndex])}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {allowShare && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => handleShare(images[currentIndex])}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              )}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores de puntos (alternativa a thumbnails) */}
      {!showThumbnails && images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex
                  ? "bg-primary"
                  : "bg-muted-foreground hover:bg-muted-foreground/80"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para vista en pantalla completa
interface FullscreenGalleryProps {
  images: string[]
  initialIndex: number
  alt: string
  onClose: () => void
  allowDownload: boolean
  allowShare: boolean
  onDownload: (url: string) => void
  onShare: (url: string) => void
}

function FullscreenGallery({
  images,
  initialIndex,
  alt,
  onClose,
  allowDownload,
  allowShare,
  onDownload,
  onShare
}: FullscreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Navegación con teclado
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Imagen principal */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        />
      </AnimatePresence>

      {/* Controles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {currentIndex + 1} / {images.length}
            </Badge>
            <div className="flex gap-2">
              {allowDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => onDownload(images[currentIndex])}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {allowShare && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => onShare(images[currentIndex])}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navegación lateral */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 pointer-events-auto"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 pointer-events-auto"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Thumbnails en la parte inferior */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
            <div className="flex justify-center gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-colors",
                    index === currentIndex
                      ? "border-white"
                      : "border-transparent hover:border-white/50"
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente simple para mostrar una sola imagen
interface SingleImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  allowZoom?: boolean
}

export function SingleImage({
  src,
  alt,
  className,
  aspectRatio = 'auto',
  allowZoom = true
}: SingleImageProps) {
  return (
    <ImageGallery
      images={[src]}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      showThumbnails={false}
      showCounter={false}
    />
  )
}