'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    participant: {
      id: 'agent-1',
      name: 'María González',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      role: 'agent',
      isOnline: true,
    },
    lastMessage: {
      text: 'Perfecto, podemos agendar la visita para mañana a las 3 PM',
      timestamp: '2024-01-20T15:30:00Z',
      senderId: 'agent-1',
      isRead: true,
    },
    unreadCount: 0,
    property: {
      id: '1',
      title: 'Departamento Moderno en San Isidro',
    },
  },
  {
    id: '2',
    participant: {
      id: 'buyer-1',
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'buyer',
      isOnline: false,
    },
    lastMessage: {
      text: '¿Está disponible para una videollamada?',
      timestamp: '2024-01-20T14:15:00Z',
      senderId: 'buyer-1',
      isRead: false,
    },
    unreadCount: 2,
    property: {
      id: '2',
      title: 'Casa Familiar en Miraflores',
    },
  },
  {
    id: '3',
    participant: {
      id: 'agent-2',
      name: 'Ana Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      role: 'agent',
      isOnline: true,
    },
    lastMessage: {
      text: 'Te envío más fotos de la propiedad',
      timestamp: '2024-01-20T12:45:00Z',
      senderId: 'agent-2',
      isRead: true,
    },
    unreadCount: 0,
    property: {
      id: '3',
      title: 'Oficina Comercial en San Borja',
    },
  },
]

// Mock messages for active conversation
const mockMessages = [
  {
    id: '1',
    text: 'Hola, me interesa mucho la propiedad que publicaste',
    timestamp: '2024-01-20T14:00:00Z',
    senderId: 'current-user',
    status: 'read',
  },
  {
    id: '2',
    text: '¡Hola! Me alegra saber de tu interés. ¿Te gustaría agendar una visita?',
    timestamp: '2024-01-20T14:05:00Z',
    senderId: 'agent-1',
    status: 'read',
  },
  {
    id: '3',
    text: 'Sí, me encantaría. ¿Qué días tienes disponible esta semana?',
    timestamp: '2024-01-20T14:10:00Z',
    senderId: 'current-user',
    status: 'read',
  },
  {
    id: '4',
    text: 'Tengo disponibilidad mañana martes a las 3 PM o el miércoles a las 10 AM. ¿Cuál te conviene más?',
    timestamp: '2024-01-20T14:20:00Z',
    senderId: 'agent-1',
    status: 'read',
  },
  {
    id: '5',
    text: 'Mañana a las 3 PM me viene perfecto',
    timestamp: '2024-01-20T15:25:00Z',
    senderId: 'current-user',
    status: 'read',
  },
  {
    id: '6',
    text: 'Perfecto, podemos agendar la visita para mañana a las 3 PM',
    timestamp: '2024-01-20T15:30:00Z',
    senderId: 'agent-1',
    status: 'read',
  },
]

export default function MessagesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [conversations, setConversations] = useState(mockConversations)
  const [activeConversation, setActiveConversation] = useState(mockConversations[0])
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para acceder a los mensajes.",
        variant: "destructive",
      })
      router.push('/auth/login')
    }
  }, [user, router, toast])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderId: 'current-user',
      status: 'sent' as const,
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              lastMessage: {
                text: message.text,
                timestamp: message.timestamp,
                senderId: message.senderId,
                isRead: true,
              },
            }
          : conv
      )
    )

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      )
    }, 1000)

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      )
    }, 3000)
  }

  const handleConversationSelect = (conversation: typeof mockConversations[0]) => {
    setActiveConversation(conversation)
    
    // Mark as read
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv
      )
    )
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Circle className="h-3 w-3 text-gray-400" />
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para acceder a los mensajes.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mensajes
          </h1>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay conversaciones</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  activeConversation.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    {conversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage.text}
                    </p>
                    
                    <p className="text-xs text-gray-500 truncate mt-1">
                      📍 {conversation.property.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={activeConversation.participant.avatar}
                  alt={activeConversation.participant.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              {activeConversation.participant.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">
                {activeConversation.participant.name}
              </h2>
              <p className="text-sm text-gray-600">
                {activeConversation.participant.isOnline ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Property Context */}
        <div className="bg-blue-50 border-b p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span>💬 Conversación sobre:</span>
            <span className="font-medium">{activeConversation.property.title}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'current-user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {message.senderId === 'current-user' && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="pr-10"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
