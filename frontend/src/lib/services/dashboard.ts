import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  buyer: {
    savedProperties: number
    viewedProperties: number
    scheduledVisits: number
    activeOffers: number
  }
  agent: {
    activeListings: number
    totalViews: number
    scheduledVisits: number
    closedDeals: number
  }
}

export interface RecentProperty {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  image: string
  status: 'available' | 'sold' | 'rented'
}

export interface RecentActivity {
  id: string
  type: 'property_view' | 'visit_scheduled' | 'offer_made' | 'message_received'
  message: string
  time: string
  property_id?: string
  created_at: string
}

// Servicio para obtener estadísticas del dashboard
export const getDashboardStats = async (userId: string, userRole: 'buyer' | 'agent'): Promise<DashboardStats> => {
  try {
    if (userRole === 'buyer') {
      // Estadísticas para compradores
      const [favoritesResult, conversationsResult] = await Promise.all([
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('conversations')
          .select('id')
          .eq('buyer_id', userId)
      ])

      return {
        buyer: {
          savedProperties: favoritesResult.data?.length || 0,
          viewedProperties: 0, // TODO: Implementar tracking de vistas
          scheduledVisits: 0, // TODO: Implementar sistema de visitas
          activeOffers: 0, // TODO: Implementar sistema de ofertas
        },
        agent: {
          activeListings: 0,
          totalViews: 0,
          scheduledVisits: 0,
          closedDeals: 0,
        }
      }
    } else {
      // Estadísticas para agentes
      const [propertiesResult, conversationsResult] = await Promise.all([
        supabase
          .from('properties')
          .select('id, status')
          .eq('agent_id', userId),
        supabase
          .from('conversations')
          .select('id')
          .eq('agent_id', userId)
      ])

      const activeProperties = propertiesResult.data?.filter(p => p.status === 'available').length || 0
      const soldProperties = propertiesResult.data?.filter(p => p.status === 'sold').length || 0

      return {
        buyer: {
          savedProperties: 0,
          viewedProperties: 0,
          scheduledVisits: 0,
          activeOffers: 0,
        },
        agent: {
          activeListings: activeProperties,
          totalViews: 0, // TODO: Implementar tracking de vistas
          scheduledVisits: 0, // TODO: Implementar sistema de visitas
          closedDeals: soldProperties,
        }
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Retornar stats vacías en caso de error
    return {
      buyer: {
        savedProperties: 0,
        viewedProperties: 0,
        scheduledVisits: 0,
        activeOffers: 0,
      },
      agent: {
        activeListings: 0,
        totalViews: 0,
        scheduledVisits: 0,
        closedDeals: 0,
      }
    }
  }
}

// Servicio para obtener propiedades recientes
export const getRecentProperties = async (userId: string, userRole: 'buyer' | 'agent', limit: number = 3): Promise<RecentProperty[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('id, title, location, price, bedrooms, bathrooms, area, images, status')
      .limit(limit)
      .order('created_at', { ascending: false })

    if (userRole === 'agent') {
      // Para agentes, mostrar sus propias propiedades
      query = query.eq('agent_id', userId)
    } else {
      // Para compradores, mostrar propiedades disponibles
      query = query.eq('status', 'available')
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map(property => ({
      id: property.id,
      title: property.title,
      location: property.location,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      image: property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      status: property.status as 'available' | 'sold' | 'rented'
    })) || []
  } catch (error) {
    console.error('Error fetching recent properties:', error)
    return []
  }
}

// Servicio para obtener actividad reciente
export const getRecentActivity = async (userId: string, userRole: 'buyer' | 'agent', limit: number = 5): Promise<RecentActivity[]> => {
  try {
    // Por ahora, obtener mensajes recientes como actividad
    let query = supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        conversation:conversations (
          id,
          property:properties (
            id,
            title
          )
        )
      `)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (userRole === 'buyer') {
      query = query.eq('conversations.buyer_id', userId)
    } else {
      query = query.eq('conversations.agent_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map(message => ({
      id: message.id,
      type: 'message_received' as const,
      message: `Nuevo mensaje: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`,
      time: formatTimeAgo(message.created_at),
      // Supabase puede devolver relaciones como arrays; accedemos de forma segura
      property_id: message.conversation?.[0]?.property?.[0]?.id,
      created_at: message.created_at
    })) || []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

// Función auxiliar para formatear tiempo relativo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Ahora'
  if (diffInMinutes < 60) return `${diffInMinutes} min`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`
  return `${Math.floor(diffInMinutes / 1440)} días`
}

// Servicio para crear una nueva propiedad (para agentes)
export const createProperty = async (propertyData: {
  title: string
  description: string
  price: number
  type: string
  bedrooms: number
  bathrooms: number
  area: number
  location: string
  address: string
  images: string[]
  features: string[]
  agent_id: string
}) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        ...propertyData,
        status: 'available',
        latitude: -12.0464, // TODO: Obtener coordenadas reales
        longitude: -77.0428
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating property:', error)
    throw error
  }
}
