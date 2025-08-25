'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>Algo salió mal</CardTitle>
          <CardDescription>
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar nuevamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para usar con React Query y otros casos
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Componente de error específico para páginas
export function PageError({ 
  title = "Página no encontrada",
  description = "La página que buscas no existe o ha ocurrido un error.",
  onRetry
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <AlertTriangle className="h-24 w-24 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}