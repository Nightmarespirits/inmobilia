import { supabase } from '@/lib/supabase'
import type { Property } from '@/lib/supabase'

export interface PropertyFilters {
  type?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  location?: string
  status?: string
}

export interface CreatePropertyData {
  title: string
  description: string
  price: number
  type: 'apartment' | 'house' | 'commercial' | 'land'
  status: 'available' | 'sold' | 'rented' | 'pending'
  bedrooms: number
  bathrooms: number
  area: number
  location: string
  address: string
  latitude?: number
  longitude?: number
  images: string[]
  features: string[]
}

export const propertiesService = {
  // Obtener todas las propiedades con filtros opcionales
  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select(`
        *,
        profiles:agent_id (
          id,
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('status', 'available')

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters?.bedrooms) {
      query = query.eq('bedrooms', filters.bedrooms)
    }
    if (filters?.bathrooms) {
      query = query.eq('bathrooms', filters.bathrooms)
    }
    if (filters?.minArea) {
      query = query.gte('area', filters.minArea)
    }
    if (filters?.maxArea) {
      query = query.lte('area', filters.maxArea)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener una propiedad por ID
  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles:agent_id (
          id,
          full_name,
          avatar_url,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  // Crear una nueva propiedad
  async createProperty(propertyData: CreatePropertyData): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        agent_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Actualizar una propiedad
  async updateProperty(id: string, updates: Partial<CreatePropertyData>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Eliminar una propiedad
  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obtener propiedades del agente actual
  async getAgentProperties(): Promise<Property[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Búsqueda de propiedades con texto
  async searchProperties(searchTerm: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles:agent_id (
          id,
          full_name,
          avatar_url,
          phone
        )
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener propiedades cercanas (requiere coordenadas)
  async getNearbyProperties(latitude: number, longitude: number, radiusKm: number = 5): Promise<Property[]> {
    const { data, error } = await supabase.rpc('get_nearby_properties', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm
    })

    if (error) throw error
    return data || []
  }
}
