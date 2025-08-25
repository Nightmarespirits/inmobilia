// Servicio para rastrear intenciones de contacto antes del login
export interface ContactIntent {
  propertyId: string
  agentId: string
  propertyTitle: string
  timestamp: number
}

const CONTACT_INTENT_KEY = 'contact_intent'

export const contactTrackingService = {
  // Guardar intención de contacto antes del login
  saveContactIntent(propertyId: string, agentId: string, propertyTitle: string) {
    const intent: ContactIntent = {
      propertyId,
      agentId,
      propertyTitle,
      timestamp: Date.now()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONTACT_INTENT_KEY, JSON.stringify(intent))
    }
  },

  // Obtener intención de contacto guardada
  getContactIntent(): ContactIntent | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(CONTACT_INTENT_KEY)
      if (!stored) return null
      
      const intent: ContactIntent = JSON.parse(stored)
      
      // Verificar que no sea muy antigua (24 horas)
      const ONE_DAY = 24 * 60 * 60 * 1000
      if (Date.now() - intent.timestamp > ONE_DAY) {
        this.clearContactIntent()
        return null
      }
      
      return intent
    } catch {
      this.clearContactIntent()
      return null
    }
  },

  // Limpiar intención de contacto
  clearContactIntent() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONTACT_INTENT_KEY)
    }
  },

  // Verificar si hay intención pendiente
  hasContactIntent(): boolean {
    return this.getContactIntent() !== null
  }
}
