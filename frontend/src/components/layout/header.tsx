'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  User, 
  Menu, 
  X,
  Bell,
  Settings,
  LogOut,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Propiedades', href: '/properties', icon: Building2 },
  { name: 'Búsqueda', href: '/search', icon: Search },
  { name: 'Favoritos', href: '/favorites', icon: Heart },
  { name: 'Mensajes', href: '/messages', icon: MessageCircle, badge: 3 },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleRegister = () => {
    router.push('/auth/register')
  }

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-responsive">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              PropTech Nexus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    2
                  </Badge>
                </Button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                  </Button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md"
                      >
                        <div className="px-3 py-2 border-b">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Mi Perfil
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-3 py-2 text-sm rounded-sm hover:bg-accent text-red-600"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
                <Button onClick={handleRegister}>
                  Registrarse
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t"
            >
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
                
                {!user && (
                  <div className="px-4 pt-4 border-t space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogin()
                        setIsMenuOpen(false)
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      onClick={() => {
                        handleRegister()
                        setIsMenuOpen(false)
                      }}
                    >
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
