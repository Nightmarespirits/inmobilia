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
