/**
 * EventManager - Simple event system for game components
 */
export type EventCallback<T = any> = (data: T) => void

export interface GameEvent<T = any> {
  type: string
  data: T
  timestamp: number
}

export class EventManager {
  private listeners = new Map<string, Set<EventCallback>>()
  private eventHistory: GameEvent[] = []
  private readonly MAX_HISTORY = 100

  /**
   * Subscribe to an event type
   */
  on<T = any>(eventType: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    const callbacks = this.listeners.get(eventType)!
    callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  /**
   * Subscribe to an event type but only fire once
   */
  once<T = any>(eventType: string, callback: EventCallback<T>): () => void {
    const unsubscribe = this.on(eventType, (data: T) => {
      unsubscribe()
      callback(data)
    })
    return unsubscribe
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(eventType: string, data?: T): void {
    const event: GameEvent<T> = {
      type: eventType,
      data: data as T,
      timestamp: Date.now()
    }

    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift()
    }

    // Notify all listeners
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Event callback error for ${eventType}:`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event type
   */
  off(eventType: string): void {
    this.listeners.delete(eventType)
  }

  /**
   * Remove all event listeners
   */
  clear(): void {
    this.listeners.clear()
    this.eventHistory = []
  }

  /**
   * Get recent event history
   */
  getHistory(eventType?: string, limit = 10): GameEvent[] {
    let events = this.eventHistory
    
    if (eventType) {
      events = events.filter(event => event.type === eventType)
    }
    
    return events.slice(-limit)
  }

  /**
   * Get all active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.listeners.keys())
  }
}
