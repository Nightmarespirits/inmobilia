'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { getDashboardStats, getRecentProperties, getRecentActivity, type DashboardStats, type RecentProperty, type RecentActivity } from '@/lib/services/dashboard'

// Iconos para tipos de actividad
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'property_view': return Eye
    case 'visit_scheduled': return Calendar
    case 'offer_made': return DollarSign
    case 'message_received': return MessageSquare
    default: return Eye
  }
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      setIsLoadingData(true)
      try {
        const [stats, properties, activity] = await Promise.all([
          getDashboardStats(user.id, user.role),
          getRecentProperties(user.id, user.role),
          getRecentActivity(user.id, user.role)
        ])
        
        setDashboardStats(stats)
        setRecentProperties(properties)
        setRecentActivity(activity)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadDashboardData()
  }, [user])

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
  const buyerStats = dashboardStats?.buyer
  const agentStats = dashboardStats?.agent

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
            ¡Hola, {user.full_name}! 👋
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (buyerStats?.savedProperties || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Propiedades guardadas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (buyerStats?.viewedProperties || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Propiedades vistas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (buyerStats?.scheduledVisits || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Visitas programadas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (buyerStats?.activeOffers || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Ofertas activas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (agentStats?.activeListings || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Propiedades activas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (agentStats?.totalViews || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Visualizaciones totales'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (agentStats?.scheduledVisits || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Visitas programadas'}
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
                  <div className="text-2xl font-bold">{isLoadingData ? '...' : (agentStats?.closedDeals || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingData ? 'Cargando...' : 'Ventas cerradas'}
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
              {recentProperties.slice(0, 3).map((property) => (
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {React.createElement(getActivityIcon(activity.type), { className: "h-4 w-4 text-primary" })}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isBuyer ? (
                <>
                  <Link href="/properties">
                    <Button className="h-20 flex-col gap-2 w-full">
                      <Search className="h-6 w-6" />
                      Buscar Propiedades
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                      <Heart className="h-6 w-6" />
                      Mis Favoritos
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                      <MessageSquare className="h-6 w-6" />
                      Mensajes
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col gap-2 w-full" disabled>
                    <Calendar className="h-6 w-6" />
                    Mis Visitas
                    <span className="text-xs opacity-50">Próximamente</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/properties/create">
                    <Button className="h-20 flex-col gap-2 w-full">
                      <Plus className="h-6 w-6" />
                      Nueva Propiedad
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col gap-2 w-full" disabled>
                    <Users className="h-6 w-6" />
                    Mis Clientes
                    <span className="text-xs opacity-50">Próximamente</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 w-full" disabled>
                    <Calendar className="h-6 w-6" />
                    Agenda
                    <span className="text-xs opacity-50">Próximamente</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 w-full" disabled>
                    <BarChart3 className="h-6 w-6" />
                    Reportes
                    <span className="text-xs opacity-50">Próximamente</span>
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
