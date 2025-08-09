'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [checkAuth])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Socket Provider Component (placeholder for now)
function SocketProvider({ children }: { children: React.ReactNode }) {
  // TODO: Implement Socket.io connection
  // const [socket, setSocket] = useState<Socket | null>(null)
  // const { token } = useAuth()
  
  // useEffect(() => {
  //   if (token) {
  //     const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  //       auth: { token }
  //     })
  //     setSocket(newSocket)
  //     return () => newSocket.close()
  //   }
  // }, [token])

  return <>{children}</>
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}