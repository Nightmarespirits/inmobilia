import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  role: 'buyer' | 'agent' 
  phone?: string
  avatar?: string
  avatar_url?: string
  created_at: string
  updated_at: string 
  bio: string
  location: string
}

export interface Property {
  id: string
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
  fullAddress?: string
  latitude?: number
  longitude?: number
  images: string[]
  features: string[]
  agent_id: string
  views?: number
  created_at: string
  updated_at: string
  
  // Propiedades adicionales para la página de detalle
  isFavorite?: boolean
  parkingSpaces?: number
  floor?: number
  totalFloors?: number
  yearBuilt?: number
  publishedDate?: string
  
  // Información del agente
  agent?: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    rating?: number
    specialization?: string
    verified?: boolean
  }
  
  // Lugares cercanos
  nearbyPlaces?: Array<{
    name: string
    type: string
    distance: string
  }>
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  property_id?: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participants: string[]
  property_id?: string
  last_message?: string
  last_message_at?: string
  created_at: string
}
