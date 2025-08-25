import { supabase } from '@/lib/supabase'
import { 
  generateUniqueFileName, 
  validateFile, 
  compressImage, 
  isImageFile,
  type FileValidationOptions 
} from '@/lib/file-utils'

export interface UploadOptions {
  bucket?: string
  folder?: string
  compress?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
  validation?: FileValidationOptions
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

export const storageService = {
  // Subir un archivo individual
  async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      bucket = 'property-images',
      folder = 'uploads',
      compress = true,
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      validation = {}
    } = options

    try {
      // Validar archivo
      const validationResult = validateFile(file, validation)
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join(', ')
        }
      }

      // Generar nombre único
      const fileName = generateUniqueFileName(file.name, `${folder}/`)
      
      let fileToUpload: File | Blob = file

      // Comprimir imagen si es necesario
      if (isImageFile(file) && compress) {
        try {
          fileToUpload = await compressImage(file, 5, maxWidth, maxHeight) // máx 5MB
        } catch (compressionError) {
          console.warn('Error compressing image, uploading original:', compressionError)
          // Continuar con el archivo original si falla la compresión
        }
      }

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return {
        success: true,
        url: publicUrl,
        fileName
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al subir archivo'
      }
    }
  },

  // Subir múltiples archivos
  async uploadFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options))
    return Promise.all(uploadPromises)
  },

  // Eliminar archivo
  async deleteFile(fileName: string, bucket: string = 'property-images'): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      return !error
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  },

  // Eliminar múltiples archivos
  async deleteFiles(fileNames: string[], bucket: string = 'property-images'): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(fileNames)

      return !error
    } catch (error) {
      console.error('Error deleting files:', error)
      return false
    }
  },

  // Obtener URL firmada (para archivos privados)
  async getSignedUrl(
    fileName: string, 
    expiresIn: number = 3600, 
    bucket: string = 'property-images'
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, expiresIn)

      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return null
    }
  },

  // Listar archivos en un bucket/folder
  async listFiles(
    folder: string = '',
    bucket: string = 'property-images'
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error listing files:', error)
      return []
    }
  },

  // Mover archivo
  async moveFile(
    fromPath: string,
    toPath: string,
    bucket: string = 'property-images'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      return !error
    } catch (error) {
      console.error('Error moving file:', error)
      return false
    }
  },

  // Copiar archivo
  async copyFile(
    fromPath: string,
    toPath: string,
    bucket: string = 'property-images'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath)

      return !error
    } catch (error) {
      console.error('Error copying file:', error)
      return false
    }
  },

  // Obtener información de archivo
  async getFileInfo(fileName: string, bucket: string = 'property-images') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', {
          search: fileName
        })

      if (error) throw error
      return data?.[0] || null
    } catch (error) {
      console.error('Error getting file info:', error)
      return null
    }
  },

  // Subir avatar de usuario
  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: `avatars/${userId}`,
      compress: true,
      maxWidth: 400,
      maxHeight: 400,
      validation: {
        maxSize: 2, // 2MB máximo para avatares
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    })
  },

  // Subir imágenes de propiedad
  async uploadPropertyImages(files: File[], propertyId?: string): Promise<UploadResult[]> {
    const folder = propertyId ? `properties/${propertyId}` : 'properties/temp'
    
    return this.uploadFiles(files, {
      folder,
      compress: true,
      maxWidth: 1920,
      maxHeight: 1080,
      validation: {
        maxSize: 10, // 10MB máximo por imagen
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 20
      }
    })
  },

  // Subir documentos
  async uploadDocuments(files: File[], folder: string = 'documents'): Promise<UploadResult[]> {
    return this.uploadFiles(files, {
      folder,
      compress: false, // No comprimir documentos
      validation: {
        maxSize: 50, // 50MB máximo por documento
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      }
    })
  },

  // Limpiar archivos temporales
  async cleanupTempFiles(olderThanHours: number = 24): Promise<boolean> {
    try {
      const files = await this.listFiles('temp')
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000)
      
      const filesToDelete = files
        .filter(file => {
          const fileTime = new Date(file.created_at).getTime()
          return fileTime < cutoffTime
        })
        .map(file => `temp/${file.name}`)

      if (filesToDelete.length > 0) {
        return this.deleteFiles(filesToDelete)
      }

      return true
    } catch (error) {
      console.error('Error cleaning up temp files:', error)
      return false
    }
  }
}

// Funciones de conveniencia exportadas
export const uploadFile = storageService.uploadFile.bind(storageService)
export const uploadFiles = storageService.uploadFiles.bind(storageService)
export const deleteFile = storageService.deleteFile.bind(storageService)
export const uploadAvatar = storageService.uploadAvatar.bind(storageService)
export const uploadPropertyImages = storageService.uploadPropertyImages.bind(storageService)

export default storageService