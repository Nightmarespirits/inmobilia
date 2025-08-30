'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { toggleFavorite, isFavorite } from '@/lib/services/favorites'

export interface UseFavoritesReturn {
  favorites: Set<string>
  isLoading: boolean
  toggleFavorite: (propertyId: string) => Promise<void>
  isFavorite: (propertyId: string) => boolean
  canUseFavorites: boolean
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Solo los compradores pueden usar favoritos
  const canUseFavorites = user && (user.role === 'buyer' || !user.role)

  // Cargar favoritos del usuario
  const loadFavorites = useCallback(async () => {
    if (!user || !canUseFavorites) {
      setFavorites(new Set())
      return
    }

    try {
      setIsLoading(true)
      // Obtener todas las propiedades visibles en la página actual
      const propertyElements = document.querySelectorAll('[data-property-id]')
      const propertyIds = Array.from(propertyElements).map(el => 
        el.getAttribute('data-property-id')
      ).filter(Boolean) as string[]

      if (propertyIds.length > 0) {
        const favoriteChecks = await Promise.all(
          propertyIds.map(async (propertyId) => {
            const isFav = await isFavorite(user.id, propertyId)
            return { id: propertyId, isFavorite: isFav }
          })
        )

        const favoritesSet = new Set(
          favoriteChecks.filter(f => f.isFavorite).map(f => f.id)
        )
        setFavorites(favoritesSet)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, canUseFavorites])

  // Cargar favoritos cuando cambie el usuario
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Toggle favorito
  const handleToggleFavorite = useCallback(async (propertyId: string) => {
    console.log('=== INICIO TOGGLE FAVORITE ===')
    console.log('🔄 Property ID:', propertyId)
    console.log('👤 User object:', user)
    console.log('🔑 User ID:', user?.id)
    console.log('👥 User role:', user?.role)
    console.log('✅ Can use favorites:', canUseFavorites)
    console.log('🔐 Is authenticated:', !!user)

    // Verificar que el usuario puede usar favoritos
    if (!user) {
      console.log('❌ NO USER - Showing login toast')
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar favoritos.",
        variant: "destructive",
      })
      console.log('⚠️ RETORNANDO SIN REDIRECCIÓN')
      return
    }

    if (!canUseFavorites) {
      console.log('❌ CANT USE FAVORITES - Showing permission toast')
      toast({
        title: "Función no disponible",
        description: "Solo los compradores pueden agregar propiedades a favoritos.",
        variant: "destructive",
      })
      console.log('⚠️ RETORNANDO SIN REDIRECCIÓN')
      return
    }

    console.log('✅ PASÓ TODAS LAS VALIDACIONES - Procediendo con toggle')

    try {
      setIsLoading(true)
      
      // Actualización optimista
      const wasFavorite = favorites.has(propertyId)
      const newFavorites = new Set(favorites)
      
      if (wasFavorite) {
        newFavorites.delete(propertyId)
      } else {
        newFavorites.add(propertyId)
      }
      
      setFavorites(newFavorites)

      // Llamada al servidor
      const result = await toggleFavorite(user.id, propertyId)

      toast({
        title: result.added ? "Agregado a favoritos" : "Removido de favoritos",
        description: `La propiedad ha sido ${result.added ? 'agregada a' : 'removida de'} tus favoritos.`,
      })

    } catch (error) {
      console.error('❌ ERROR EN TOGGLE FAVORITE:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      // Revertir cambio optimista en caso de error
      setFavorites(favorites)
      
      // Distinguir entre errores de autenticación y errores de base de datos
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log('🔍 Analizando mensaje de error:', errorMessage)
      
      if (errorMessage.includes('406') || errorMessage.includes('RLS') || errorMessage.includes('policy')) {
        console.warn('🔒 DETECTADO ERROR DE POLITICAS DB')
        toast({
          title: "Funcionalidad no disponible",
          description: "Los favoritos están temporalmente deshabilitados. Inténtalo más tarde.",
          variant: "destructive",
        })
      } else {
        console.warn('🔗 ERROR GENERICO DE CONEXION')
        toast({
          title: "Error al actualizar favoritos",
          description: "No se pudo actualizar los favoritos. Verifica tu conexión.",
          variant: "destructive",
        })
      }
      
      console.log('⚠️ NO HAY REDIRECCIÓN PROGRAMADA EN ESTE CATCH')
    } finally {
      setIsLoading(false)
      console.log('=== FIN TOGGLE FAVORITE ===')
    }
  }, [user, canUseFavorites, favorites, toast])

  // Verificar si una propiedad es favorita
  const checkIsFavorite = useCallback((propertyId: string): boolean => {
    return favorites.has(propertyId)
  }, [favorites])

  return {
    favorites,
    isLoading,
    toggleFavorite: handleToggleFavorite,
    isFavorite: checkIsFavorite,
    canUseFavorites
  }
}
