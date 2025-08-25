'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send,
  User,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { messagesService } from '@/lib/services/messages'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyTitle: string
  agentId: string
  agentName?: string
  agentAvatar?: string
}

export function ContactModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  agentId,
  agentName = 'Agente Inmobiliario',
  agentAvatar
}: ContactModalProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Mensaje predefinido basado en la propiedad
  const defaultMessage = `¡Hola! Estoy interesado en la propiedad "${propertyTitle}". Me gustaría obtener más información. ¿Podrías ayudarme?`

  // Inicializar mensaje predefinido
  React.useEffect(() => {
    if (isOpen && !message) {
      setMessage(defaultMessage)
    }
  }, [isOpen, defaultMessage, message])

  const handleSendMessage = async () => {
    // Verificar autenticación
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar al agente.",
        variant: "destructive",
      })
      router.push('/auth/login')
      return
    }

    if (!message.trim()) {
      toast({
        title: "Mensaje requerido",
        description: "Por favor escribe un mensaje.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Crear o obtener conversación existente
      const conversation = await messagesService.getOrCreateConversation(
        agentId,
        propertyId
      )

      // Enviar mensaje inicial
      await messagesService.sendMessage(conversation.id, message)

      toast({
        title: "¡Mensaje enviado!",
        description: "Tu mensaje ha sido enviado al agente. Te responderá pronto.",
      })

      // Cerrar modal y redirigir al chat
      onClose()
      router.push(`/messages?conversation=${conversation.id}`)

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Contactar Agente
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Agent Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={agentAvatar} alt={agentName} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{agentName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Agente Inmobiliario
                  </Badge>
                </div>
              </div>

              {/* Property Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="font-medium">Propiedad:</span>
                <span className="line-clamp-1">{propertyTitle}</span>
              </div>

              {/* Message Form - Simplified */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tu mensaje
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Edita tu mensaje..."
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
