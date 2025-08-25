'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { contactTrackingService } from '@/lib/services/contact-tracking'
import { messagesService } from '@/lib/services/messages'

/**
 * Hook para manejar redirecciones automáticas después del login
 * cuando el usuario tenía intención de contactar a un agente
 */
export function useContactRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (isLoading || !user) return

    const handleContactRedirect = async () => {
      // Verificar si hay intención de contacto pendiente
      const contactIntent = contactTrackingService.getContactIntent()
      if (!contactIntent) return

      try {
        // Crear mensaje predefinido
        const message = `¡Hola! Estoy interesado en la propiedad "${contactIntent.propertyTitle}". Me gustaría obtener más información. ¿Podrías ayudarme?`

        // Crear o obtener conversación
        const conversation = await messagesService.getOrCreateConversation(
          contactIntent.agentId,
          contactIntent.propertyId
        )

        // Enviar mensaje inicial
        await messagesService.sendMessage(conversation.id, message)

        // Limpiar intención guardada
        contactTrackingService.clearContactIntent()

        // Notificar al usuario
        toast({
          title: "¡Conectado con el agente!",
          description: `Tu mensaje sobre "${contactIntent.propertyTitle}" ha sido enviado.`,
        })

        // Redirigir al chat
        router.push(`/messages?conversation=${conversation.id}`)

      } catch (error) {
        console.error('Error processing contact redirect:', error)
        
        // En caso de error, mantener la intención guardada y notificar
        toast({
          title: "Error al conectar",
          description: "Hubo un problema al conectar con el agente. Puedes intentarlo manualmente desde la propiedad.",
          variant: "destructive",
        })
      }
    }

    // Ejecutar después de un pequeño delay para asegurar que el usuario esté completamente logueado
    const timeout = setTimeout(handleContactRedirect, 1000)
    return () => clearTimeout(timeout)
  }, [user, isLoading, router, toast])
}
