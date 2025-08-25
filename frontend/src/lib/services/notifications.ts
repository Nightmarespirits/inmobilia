import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  type: 'message' | 'new_property' | 'agent_response'
  title: string
  message: string
  read: boolean
  created_at: string
  user_id: string
  data?: {
    conversation_id?: string
    property_id?: string
    agent_id?: string
  }
}

class NotificationsService {
  // Obtener notificaciones del usuario actual
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Crear notificación para nuevo mensaje (para agentes)
  async createMessageNotification(
    agentId: string,
    senderId: string,
    senderName: string,
    propertyTitle: string,
    conversationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: agentId,
          type: 'message',
          title: 'Nuevo mensaje',
          message: `${senderName} está interesado en "${propertyTitle}"`,
          read: false,
          data: {
            conversation_id: conversationId,
            sender_id: senderId
          }
        })

      if (error) {
        console.error('Error creating message notification:', error)
      }
    } catch (error) {
      console.error('Error creating message notification:', error)
    }
  }

  // Crear notificación para nueva propiedad (para compradores)
  async createNewPropertyNotification(
    buyerId: string,
    propertyTitle: string,
    propertyId: string,
    agentName: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'new_property',
          title: 'Nueva propiedad disponible',
          message: `${agentName} ha publicado: "${propertyTitle}"`,
          read: false,
          data: {
            property_id: propertyId
          }
        })

      if (error) {
        console.error('Error creating property notification:', error)
      }
    } catch (error) {
      console.error('Error creating property notification:', error)
    }
  }

  // Crear notificación para respuesta de agente (para compradores)
  async createAgentResponseNotification(
    buyerId: string,
    agentName: string,
    propertyTitle: string,
    conversationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: buyerId,
          type: 'agent_response',
          title: 'Respuesta del agente',
          message: `${agentName} respondió sobre "${propertyTitle}"`,
          read: false,
          data: {
            conversation_id: conversationId
          }
        })

      if (error) {
        console.error('Error creating agent response notification:', error)
      }
    } catch (error) {
      console.error('Error creating agent response notification:', error)
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Obtener contador de notificaciones no leídas por tipo
  async getUnreadCount(userId: string, userRole: 'buyer' | 'agent'): Promise<number> {
    try {
      let types: string[] = []
      
      if (userRole === 'agent') {
        types = ['message']
      } else {
        types = ['new_property', 'agent_response']
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false)
        .in('type', types)

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Suscribirse a notificaciones en tiempo real
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

export const notificationsService = new NotificationsService()
