'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  Heart, 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building, 
  Plus,
  Search,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'

// Types for dashboard stats
type BuyerStats = {
  savedProperties: number;
  viewedProperties: number;
  scheduledVisits: number;
  activeOffers: number;
}

type AgentStats = {
  activeListings: number;
  totalViews: number;
  scheduledVisits: number;
  closedDeals: number;
}

// Mock data for dashboard
const mockStats: { buyer: BuyerStats; agent: AgentStats } = {
  buyer: {
    savedProperties: 12,
    viewedProperties: 45,
    scheduledVisits: 3,
    activeOffers: 1,
  },
  agent: {
    activeListings: 23,
    totalViews: 1250,
    scheduledVisits: 8,
    closedDeals: 5,
  }
}

const mockRecentProperties = [
  {
    id: '1',
    title: 'Departamento moderno en Miraflores',
    location: 'Miraflores, Lima',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
    status: 'available' as const
  },
  {
    id: '2',
    title: 'Casa con jardín en San Isidro',
    location: 'San Isidro, Lima',
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    status: 'available' as const
  },
  {
    id: '3',
    title: 'Loft industrial en Barranco',
    location: 'Barranco, Lima',
    price: 320000,
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    status: 'available' as const
  }
]

const mockRecentActivity = [
  {
    id: '1',
    type: 'property_view' as const,
    message: 'Viste "Departamento en Miraflores"',
    time: '2 horas',
    icon: Eye
  },
  {
    id: '2',
    type: 'visit_scheduled' as const,
    message: 'Programaste una visita para mañana',
    time: '5 horas',
    icon: Calendar
  },
  {
    id: '3',
    type: 'offer_made' as const,
    message: 'Hiciste una oferta por S/ 420,000',
    time: '1 día',
    icon: DollarSign
  }
]

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isBuyer = user.role === 'buyer'
  const buyerStats = isBuyer ? mockStats.buyer : null
  const agentStats = !isBuyer ? mockStats.agent : null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isBuyer 
              ? 'Aquí tienes un resumen de tu actividad inmobiliaria'
              : 'Gestiona tus propiedades y clientes desde tu panel de control'
            }
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isBuyer ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Propiedades Guardadas
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{buyerStats?.savedProperties || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 desde la semana pasada
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propiedades Vistas</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{buyerStats?.viewedProperties || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 esta semana
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitas Programadas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{buyerStats?.scheduledVisits || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Esta semana
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{buyerStats?.activeOffers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Esperando respuesta
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propiedades Activas</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.activeListings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 este mes
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizaciones Totales</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +180 esta semana
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitas Programadas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.scheduledVisits || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Esta semana
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Cerradas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.closedDeals || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Este mes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {isBuyer ? 'Propiedades Recientes' : 'Mis Propiedades'}
              </CardTitle>
              <CardDescription>
                {isBuyer ? 'Propiedades que podrían interesarte' : 'Gestiona tus listados activos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentProperties.slice(0, 3).map((property) => (
                <div key={property.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{property.title}</h4>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                    <p className="text-sm font-medium">S/ {property.price.toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary">
                    {property.bedrooms} hab • {property.area}m²
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full">
                Ver todas las propiedades
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Tu actividad de los últimos días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">Hace {activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full">
                Ver toda la actividad
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              {isBuyer ? 'Encuentra tu próximo hogar' : 'Gestiona tu negocio inmobiliario'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isBuyer ? (
                <>
                  <Button className="h-20 flex-col gap-2">
                    <Search className="h-6 w-6" />
                    Buscar Propiedades
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Heart className="h-6 w-6" />
                    Mis Favoritos
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Mis Visitas
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Mensajes
                  </Button>
                </>
              ) : (
                <>
                  <Button className="h-20 flex-col gap-2">
                    <Plus className="h-6 w-6" />
                    Nueva Propiedad
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    Mis Clientes
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Agenda
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Reportes
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
