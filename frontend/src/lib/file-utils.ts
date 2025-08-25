// Utilidades para manejo y validación de archivos

export interface FileValidationOptions {
  maxSize?: number // en MB
  allowedTypes?: string[]
  maxFiles?: number
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Tipos de archivo permitidos por defecto
export const DEFAULT_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

export const DEFAULT_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

// Validar un archivo individual
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    maxSize = 5, // 5MB por defecto
    allowedTypes = DEFAULT_IMAGE_TYPES,
    maxFiles = 1
  } = options

  const errors: string[] = []
  const warnings: string[] = []

  // Validar tamaño
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSize) {
    errors.push(`El archivo es demasiado grande (${fileSizeMB.toFixed(2)}MB). Máximo permitido: ${maxSize}MB`)
  }

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido: ${file.type}`)
  }

  // Advertencias por tamaño
  if (fileSizeMB > maxSize * 0.8) {
    warnings.push(`El archivo es bastante grande (${fileSizeMB.toFixed(2)}MB)`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Validar múltiples archivos
export function validateFiles(
  files: File[],
  options: FileValidationOptions = {}
): FileValidationResult {
  const { maxFiles = 10 } = options
  
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // Validar número de archivos
  if (files.length > maxFiles) {
    allErrors.push(`Demasiados archivos seleccionados (${files.length}). Máximo permitido: ${maxFiles}`)
  }

  // Validar cada archivo individualmente
  files.forEach((file, index) => {
    const result = validateFile(file, options)
    
    result.errors.forEach(error => {
      allErrors.push(`Archivo ${index + 1}: ${error}`)
    })
    
    result.warnings.forEach(warning => {
      allWarnings.push(`Archivo ${index + 1}: ${warning}`)
    })
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

// Convertir archivo a base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Redimensionar imagen
export function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Error al redimensionar imagen'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Error al cargar imagen'))
    img.src = URL.createObjectURL(file)
  })
}

// Generar thumbnail
export function generateThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return resizeImage(file, size, size, 0.7)
}

// Formatear tamaño de archivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Obtener extensión de archivo
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// Generar nombre único para archivo
export function generateUniqueFileName(originalName: string, prefix: string = ''): string {
  const extension = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${prefix}${timestamp}-${random}.${extension}`
}

// Comprimir imagen
export function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      let quality = 0.8
      let compressedBlob = await resizeImage(file, maxWidth, maxHeight, quality)
      
      // Reducir calidad hasta alcanzar el tamaño deseado
      while (compressedBlob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
        quality -= 0.1
        compressedBlob = await resizeImage(file, maxWidth, maxHeight, quality)
      }
      
      resolve(compressedBlob)
    } catch (error) {
      reject(error)
    }
  })
}

// Validar si es una imagen
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// Validar si es un documento
export function isDocumentFile(file: File): boolean {
  return DEFAULT_DOCUMENT_TYPES.includes(file.type)
}

// Crear preview URL para archivo
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// Limpiar preview URL
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Descargar archivo desde URL
export async function downloadFile(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Copiar imagen al clipboard (si es soportado)
export async function copyImageToClipboard(imageUrl: string): Promise<void> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
    } else {
      throw new Error('Clipboard API not supported')
    }
  } catch (error) {
    console.error('Error copying image to clipboard:', error)
    throw error
  }
}