/**
 * BaseStore - Base class for Pinia stores with common functionality
 */
import type { StateValidator, ValidationSchema } from './StateValidator'

export interface BaseStoreState {
  initialized: boolean
  lastUpdated: number
}

export interface BaseStoreOptions {
  validationSchema?: ValidationSchema
  autoSave?: boolean
  debug?: boolean
}

/**
 * Base functionality that all game stores should extend
 */
export abstract class BaseStore {
  protected options: BaseStoreOptions
  protected validator?: typeof StateValidator

  constructor(options: BaseStoreOptions = {}) {
    this.options = {
      autoSave: true,
      debug: false,
      ...options
    }
  }

  /**
   * Initialize store with default values
   */
  abstract initialize(): void

  /**
   * Reset store to initial state
   */
  abstract reset(): void

  /**
   * Get serializable state for saving
   */
  abstract getSerializableState(): Record<string, any>

  /**
   * Load state from save data
   */
  abstract loadState(state: Record<string, any>): void

  /**
   * Validate current state
   */
  protected validateState(state: any): boolean {
    if (!this.options.validationSchema || !this.validator) return true
    
    const result = this.validator.validate(state, this.options.validationSchema)
    
    if (!result.isValid && this.options.debug) {
      console.warn('Store validation errors:', result.errors)
    }
    
    return result.isValid
  }

  /**
   * Log debug information
   */
  protected debug(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[${this.constructor.name}] ${message}`, ...args)
    }
  }

  /**
   * Emit store change event
   */
  protected emitChange(type: string, data?: any): void {
    const event = new CustomEvent('store-change', {
      detail: {
        store: this.constructor.name,
        type,
        data,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * Sanitize numeric values to prevent cheating
   */
  protected sanitizeNumber(value: any, min = 0, max = Number.MAX_SAFE_INTEGER): number {
    if (typeof value !== 'number' || isNaN(value)) return min
    return Math.max(min, Math.min(max, Math.floor(value)))
  }

  /**
   * Safely increment a value with overflow protection
   */
  protected safeIncrement(current: number, increment: number, max = Number.MAX_SAFE_INTEGER): number {
    const result = current + increment
    return result > max ? max : result
  }

  /**
   * Safely decrement a value with underflow protection
   */
  protected safeDecrement(current: number, decrement: number, min = 0): number {
    const result = current - decrement
    return result < min ? min : result
  }

  /**
   * Check if enough time has passed for an operation
   */
  protected canPerformOperation(lastTime: number, cooldownMs: number): boolean {
    return Date.now() - lastTime >= cooldownMs
  }

  /**
   * Deep clone an object to prevent mutations
   */
  protected deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as unknown as T
    
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = this.deepClone((obj as any)[key])
    })
    
    return cloned
  }

  /**
   * Merge partial state updates safely
   */
  protected mergeState<T extends Record<string, any>>(current: T, updates: Partial<T>): T {
    const merged = { ...current }
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (merged as any)[key] = value
      }
    })
    
    return merged
  }

  /**
   * Get store statistics
   */
  getStats(): Record<string, number> {
    return {
      initialized: this.getSerializableState().initialized ? 1 : 0,
      lastUpdated: this.getSerializableState().lastUpdated || 0,
      stateSize: JSON.stringify(this.getSerializableState()).length
    }
  }
}
