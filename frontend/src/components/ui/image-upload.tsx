'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  maxSize?: number // en MB
  disabled?: boolean
  className?: string
  bucket?: string
  folder?: string
}

interface UploadedImage {
  url: string
  file?: File
  uploading?: boolean
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  disabled = false,
  className,
  bucket = 'property-images',
  folder = 'uploads'
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map(url => ({ url }))
  )
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicUrl
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    // Validar número máximo de archivos
    if (images.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Demasiados archivos",
        description: `Máximo ${maxFiles} imágenes permitidas`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Agregar archivos con estado de carga
    const newImages: UploadedImage[] = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      uploading: true
    }))

    setImages(prev => [...prev, ...newImages])

    // Subir archivos uno por uno
    const uploadPromises = acceptedFiles.map(async (file, index) => {
      try {
        const url = await uploadImage(file)
        
        setImages(prev => prev.map((img, i) => {
          if (img.file === file) {
            return { url, uploading: false }
          }
          return img
        }))

        return url
      } catch (error: any) {
        setImages(prev => prev.map((img, i) => {
          if (img.file === file) {
            return { ...img, uploading: false, error: error.message }
          }
          return img
        }))
        
        toast({
          title: "Error al subir imagen",
          description: error.message || "No se pudo subir la imagen",
          variant: "destructive",
        })
        
        return null
      }
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      const successfulUploads = uploadedUrls.filter(Boolean) as string[]
      
      // Actualizar el valor final
      const allUrls = [
        ...value,
        ...successfulUploads
      ]
      onChange(allUrls)

      if (successfulUploads.length > 0) {
        toast({
          title: "Imágenes subidas",
          description: `${successfulUploads.length} imagen(es) subida(s) correctamente`,
        })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setIsUploading(false)
    }
  }, [images, maxFiles, disabled, value, onChange, bucket, folder, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxSize * 1024 * 1024, // Convertir MB a bytes
    disabled: disabled || isUploading,
    multiple: true
  })

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    const newUrls = value.filter((_, index) => index !== indexToRemove)
    
    setImages(newImages)
    onChange(newUrls)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <Card className={cn(
        "border-2 border-dashed transition-colors cursor-pointer",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-2">
              <Upload className={cn(
                "h-8 w-8",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? "Suelta las imágenes aquí" 
                    : "Arrastra imágenes aquí o haz clic para seleccionar"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxFiles} imágenes, {maxSize}MB cada una
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos: JPEG, PNG, WebP
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay de estado */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                
                {image.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                )}
                
                {!image.uploading && !image.error && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Badge de estado */}
              <div className="absolute bottom-2 left-2">
                {image.uploading && (
                  <Badge variant="secondary" className="text-xs">
                    Subiendo...
                  </Badge>
                )}
                {image.error && (
                  <Badge variant="destructive" className="text-xs">
                    Error
                  </Badge>
                )}
                {!image.uploading && !image.error && (
                  <Badge variant="default" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Listo
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{images.length} de {maxFiles} imágenes</span>
          {isUploading && <span>Subiendo imágenes...</span>}
        </div>
      )}
    </div>
  )
}

// Componente simple para una sola imagen
interface SingleImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  disabled?: boolean
  className?: string
  bucket?: string
  folder?: string
}

export function SingleImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  bucket = 'property-images',
  folder = 'uploads'
}: SingleImageUploadProps) {
  return (
    <ImageUpload
      value={value ? [value] : []}
      onChange={(urls) => onChange(urls[0])}
      maxFiles={1}
      disabled={disabled}
      className={className}
      bucket={bucket}
      folder={folder}
    />
  )
}