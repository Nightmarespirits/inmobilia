'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'buyer' | 'seller' | 'agent' | 'agency_admin' | 'super_admin'
  phone?: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  checkAuth: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'buyer' | 'agent'
  phone?: string
}

type AuthStore = AuthState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // TODO: Replace with actual API call
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error('Invalid credentials')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        
        try {
          // TODO: Replace with actual API call
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            throw new Error('Registration failed')
          }

          const result = await response.json()
          
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...data }
          })
        }
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          return
        }

        set({ isLoading: true })

        try {
          // TODO: Replace with actual API call
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Token invalid')
          }

          const user = await response.json()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook for components
export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateUser: store.updateUser,
    checkAuth: store.checkAuth,
  }
}

// Mock data for development
export const mockUsers = {
  buyer: {
    id: '1',
    email: 'comprador@example.com',
    name: 'Juan Pérez',
    role: 'buyer' as const,
    phone: '+51 999 888 777',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  agent: {
    id: '2',
    email: 'agente@example.com',
    name: 'María García',
    role: 'agent' as const,
    phone: '+51 999 777 666',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
}

// Mock login function for development
export const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (email === 'comprador@example.com' && password === 'password') {
    return {
      user: mockUsers.buyer,
      token: 'mock-token-buyer',
    }
  }
  
  if (email === 'agente@example.com' && password === 'password') {
    return {
      user: mockUsers.agent,
      token: 'mock-token-agent',
    }
  }
  
  throw new Error('Credenciales inválidas')
}
