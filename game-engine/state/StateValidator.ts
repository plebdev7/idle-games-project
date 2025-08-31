/**
 * StateValidator - Validate and sanitize game state data
 */
export interface ValidationRule<T = any> {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  min?: number
  max?: number
  allowedValues?: T[]
  customValidator?: (value: T) => boolean
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationSchema
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitized: any
}

export class StateValidator {
  /**
   * Validate an object against a schema
   */
  static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = []
    const sanitized = this.sanitizeData(data, schema, errors, '')
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    }
  }

  /**
   * Create a validation schema for common game state structures
   */
  static createGameStateSchema(): ValidationSchema {
    return {
      resources: {
        primary: { required: true, type: 'number', min: 0 },
        generationRate: { required: true, type: 'number', min: 0 },
        clickPower: { required: true, type: 'number', min: 1 },
        totalEarned: { required: true, type: 'number', min: 0 }
      },
      upgrades: {
        owned: { required: true, type: 'object' },
        unlocked: { required: true, type: 'object' },
        costs: { required: true, type: 'object' }
      },
      game: {
        gameStartTime: { required: true, type: 'number', min: 0 },
        lastSaveTime: { required: true, type: 'number', min: 0 },
        totalPlayTime: { required: true, type: 'number', min: 0 },
        isOffline: { required: false, type: 'boolean' }
      },
      settings: {
        audioEnabled: { required: false, type: 'boolean' },
        hapticEnabled: { required: false, type: 'boolean' },
        reducedMotion: { required: false, type: 'boolean' },
        theme: { required: false, type: 'string', allowedValues: ['light', 'dark', 'auto'] }
      }
    }
  }

  /**
   * Sanitize numeric values to prevent cheating
   */
  static sanitizeNumbers(data: any, limits: Record<string, { min?: number; max?: number }> = {}): any {
    if (typeof data !== 'object' || data === null) return data
    
    const sanitized = { ...data }
    
    Object.entries(limits).forEach(([key, { min, max }]) => {
      if (key in sanitized && typeof sanitized[key] === 'number') {
        if (min !== undefined && sanitized[key] < min) {
          console.warn(`Sanitized ${key}: ${sanitized[key]} -> ${min} (below minimum)`)
          sanitized[key] = min
        }
        if (max !== undefined && sanitized[key] > max) {
          console.warn(`Sanitized ${key}: ${sanitized[key]} -> ${max} (above maximum)`)
          sanitized[key] = max
        }
      }
    })
    
    return sanitized
  }

  /**
   * Remove unknown properties from an object
   */
  static stripUnknownProperties<T>(data: any, allowedKeys: (keyof T)[]): Partial<T> {
    if (typeof data !== 'object' || data === null) return {}
    
    const cleaned: Partial<T> = {}
    
    allowedKeys.forEach(key => {
      if (key in data) {
        (cleaned as any)[key] = data[key]
      }
    })
    
    return cleaned
  }

  /**
   * Validate array of objects
   */
  static validateArray<T>(arr: any[], itemValidator: (item: any) => boolean): T[] {
    if (!Array.isArray(arr)) return []
    
    return arr.filter(itemValidator) as T[]
  }

  /**
   * Check if a timestamp is reasonable (not in future, not too old)
   */
  static validateTimestamp(timestamp: number, maxAgeMs = 365 * 24 * 60 * 60 * 1000): boolean {
    const now = Date.now()
    return timestamp > 0 && 
           timestamp <= now && 
           (now - timestamp) <= maxAgeMs
  }

  /**
   * Validate and clamp progress values (0-100%)
   */
  static validateProgress(progress: number): number {
    if (typeof progress !== 'number' || isNaN(progress)) return 0
    return Math.max(0, Math.min(100, progress))
  }

  /**
   * Validate string length and content
   */
  static validateString(str: any, maxLength = 1000, allowedChars?: RegExp): string {
    if (typeof str !== 'string') return ''
    
    let validated = str.substring(0, maxLength)
    
    if (allowedChars && !allowedChars.test(validated)) {
      validated = validated.replace(/[^a-zA-Z0-9\s]/g, '')
    }
    
    return validated
  }

  private static sanitizeData(data: any, schema: ValidationSchema, errors: string[], path: string): any {
    if (typeof data !== 'object' || data === null) {
      errors.push(`${path}: Expected object, got ${typeof data}`)
      return {}
    }

    const sanitized: any = {}

    Object.entries(schema).forEach(([key, rule]) => {
      const currentPath = path ? `${path}.${key}` : key
      const value = data[key]

      if (this.isValidationRule(rule)) {
        // This is a validation rule
        const result = this.validateValue(value, rule, currentPath)
        if (result.errors.length > 0) {
          errors.push(...result.errors)
        }
        if (result.value !== undefined) {
          sanitized[key] = result.value
        }
      } else {
        // This is a nested schema
        const nestedResult = this.sanitizeData(value, rule, errors, currentPath)
        sanitized[key] = nestedResult
      }
    })

    return sanitized
  }

  private static validateValue(value: any, rule: ValidationRule, path: string): { value: any; errors: string[] } {
    const errors: string[] = []

    // Check required
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${path}: Required field is missing`)
      return { value: undefined, errors }
    }

    // If value is undefined and not required, that's OK
    if (value === undefined || value === null) {
      return { value: undefined, errors }
    }

    // Check type
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${path}: Expected ${rule.type}, got ${typeof value}`)
      return { value: undefined, errors }
    }

    // Check numeric constraints
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${path}: Value ${value} is below minimum ${rule.min}`)
        return { value: rule.min, errors: [] } // Auto-correct to minimum
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${path}: Value ${value} is above maximum ${rule.max}`)
        return { value: rule.max, errors: [] } // Auto-correct to maximum
      }
    }

    // Check allowed values
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(`${path}: Value ${value} is not in allowed values: ${rule.allowedValues.join(', ')}`)
      return { value: rule.allowedValues[0], errors: [] } // Auto-correct to first allowed value
    }

    // Run custom validator
    if (rule.customValidator && !rule.customValidator(value)) {
      errors.push(`${path}: Custom validation failed`)
      return { value: undefined, errors }
    }

    return { value, errors }
  }

  private static isValidationRule(obj: ValidationRule | ValidationSchema): obj is ValidationRule {
    return obj.hasOwnProperty('required') || 
           obj.hasOwnProperty('type') || 
           obj.hasOwnProperty('min') || 
           obj.hasOwnProperty('max') || 
           obj.hasOwnProperty('allowedValues') || 
           obj.hasOwnProperty('customValidator')
  }
}
