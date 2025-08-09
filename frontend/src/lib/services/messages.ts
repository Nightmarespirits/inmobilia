import { supabase } from '@/lib/supabase'
import type { Message, Conversation } from '@/lib/supabase'

export const messagesService = {
  // Obtener conversaciones del usuario actual
  async getUserConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          content,
          created_at,
          sender_id,
          read
        )
      `)
      .contains('participants', [user.id])
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener mensajes de una conversación
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Crear una nueva conversación
  async createConversation(
    participantId: string, 
    propertyId?: string
  ): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar si ya existe una conversación entre estos usuarios para esta propiedad
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [user.id, participantId])
      .eq('property_id', propertyId || null)
      .single()

    if (existing) {
      return existing
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participants: [user.id, participantId],
        property_id: propertyId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Enviar un mensaje
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) throw error

    // Actualizar la conversación con el último mensaje
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return data
  },

  // Marcar mensajes como leídos
  async markMessagesAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id) // Solo marcar como leídos los mensajes que no son del usuario actual

    if (error) throw error
  },

  // Obtener conversación entre dos usuarios para una propiedad específica
  async getOrCreateConversation(
    participantId: string,
    propertyId?: string
  ): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Buscar conversación existente
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [user.id, participantId])
      .eq('property_id', propertyId || null)
      .single()

    if (existing) {
      return existing
    }

    // Crear nueva conversación si no existe
    return this.createConversation(participantId, propertyId)
  },

  // Obtener mensajes no leídos del usuario
  async getUnreadMessagesCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    // Obtener conversaciones del usuario
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .contains('participants', [user.id])

    if (!conversations) return 0

    const conversationIds = conversations.map(c => c.id)

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  // Suscribirse a nuevos mensajes en tiempo real
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message)
        }
      )
      .subscribe()
  },

  // Suscribirse a cambios en conversaciones
  subscribeToConversations(
    userId: string,
    onConversationUpdate: (conversation: Conversation) => void
  ) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participants.cs.{${userId}}`,
        },
        (payload) => {
          onConversationUpdate(payload.new as Conversation)
        }
      )
      .subscribe()
  }
}
