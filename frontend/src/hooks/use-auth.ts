'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/lib/supabase'

interface AuthState {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  role: 'buyer' | 'agent'
  phone?: string
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setState({
          user: profile,
          supabaseUser: session.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setState({
            user: profile,
            supabaseUser: session.user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            supabaseUser: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }

    // Profile will be loaded by the auth state change listener
    return data
  }

  const register = async (userData: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
        }
      }
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }

    // Create profile in our custom table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single()

    if (error) throw error

    setState(prev => ({
      ...prev,
      user: data,
    }))

    return data
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) throw error
  }

  return {
    user: state.user,
    supabaseUser: state.supabaseUser,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
  }
}

// Mock data for development (mantenemos para compatibilidad)
export const mockUsers = {
  buyer: {
    id: '1',
    email: 'comprador@example.com',
    full_name: 'Juan Pérez',
    role: 'buyer' as const,
    phone: '+51 999 888 777',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  agent: {
    id: '2',
    email: 'agente@example.com',
    full_name: 'María García',
    role: 'agent' as const,
    phone: '+51 999 777 666',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
}
