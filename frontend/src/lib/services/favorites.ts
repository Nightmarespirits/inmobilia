import { supabase } from '@/lib/supabase'
import type { Favorite, Property } from '@/lib/supabase'

export const favoritesService = {
  // Obtener favoritos del usuario actual
  async getUserFavorites(): Promise<(Favorite & { property: Property })[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        property:properties (
          *,
          profiles:agent_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Agregar propiedad a favoritos
  async addToFavorites(propertyId: string): Promise<Favorite> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar si ya está en favoritos
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (existing) {
      throw new Error('La propiedad ya está en favoritos')
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        property_id: propertyId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remover propiedad de favoritos
  async removeFromFavorites(propertyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)

    if (error) throw error
  },

  // Verificar si una propiedad está en favoritos
  async isFavorite(propertyId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Obtener IDs de propiedades favoritas del usuario
  async getFavoritePropertyIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id)

    if (error) throw error
    return data?.map(fav => fav.property_id) || []
  },

  // Toggle favorito (agregar si no existe, remover si existe)
  async toggleFavorite(propertyId: string): Promise<boolean> {
    const isFav = await this.isFavorite(propertyId)
    
    if (isFav) {
      await this.removeFromFavorites(propertyId)
      return false
    } else {
      await this.addToFavorites(propertyId)
      return true
    }
  }
}

// Exportar funciones individuales para compatibilidad
export const getUserFavorites = favoritesService.getUserFavorites
export const addToFavorites = favoritesService.addToFavorites
export const removeFromFavorites = favoritesService.removeFromFavorites
export const getFavoritePropertyIds = favoritesService.getFavoritePropertyIds

// Función isFavorite que acepta userId y propertyId
export const isFavorite = async (userId: string, propertyId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Función toggleFavorite que acepta userId y propertyId y retorna objeto con estado
export const toggleFavorite = async (userId: string, propertyId: string): Promise<{ added: boolean }> => {
  const isFav = await isFavorite(userId, propertyId)
  
  if (isFav) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
    
    if (error) throw error
    return { added: false }
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        property_id: propertyId,
      })
    
    if (error) throw error
    return { added: true }
  }
}
