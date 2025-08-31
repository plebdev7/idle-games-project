/**
 * StorageUtils - localStorage and data persistence utilities
 */
export interface StorageOptions {
  prefix?: string
  compress?: boolean
  encrypt?: boolean
}

export class StorageUtils {
  private static readonly DEFAULT_PREFIX = 'idle-game'

  /**
   * Save data to localStorage with optional compression
   */
  static save<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      let serialized = JSON.stringify(data)
      
      if (options.compress) {
        serialized = this.compress(serialized)
      }
      
      if (options.encrypt) {
        serialized = this.simpleEncrypt(serialized)
      }
      
      localStorage.setItem(fullKey, serialized)
      return true
    } catch (error) {
      console.error('Storage save error:', error)
      return false
    }
  }

  /**
   * Load data from localStorage with automatic decompression
   */
  static load<T>(key: string, defaultValue: T, options: StorageOptions = {}): T {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      let stored = localStorage.getItem(fullKey)
      
      if (!stored) return defaultValue
      
      if (options.encrypt) {
        stored = this.simpleDecrypt(stored)
      }
      
      if (options.compress) {
        stored = this.decompress(stored)
      }
      
      return JSON.parse(stored) as T
    } catch (error) {
      console.error('Storage load error:', error)
      return defaultValue
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string, options: StorageOptions = {}): boolean {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }

  /**
   * Check if item exists in localStorage
   */
  static exists(key: string, options: StorageOptions = {}): boolean {
    const fullKey = this.buildKey(key, options.prefix)
    return localStorage.getItem(fullKey) !== null
  }

  /**
   * Clear all items with matching prefix
   */
  static clearAll(prefix?: string): boolean {
    try {
      const targetPrefix = prefix || this.DEFAULT_PREFIX
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(targetPrefix + '-')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  /**
   * Get storage usage information
   */
  static getUsageInfo(): { used: number; available: number; percentage: number } {
    let used = 0
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ''
          used += key.length + value.length
        }
      }
    } catch (error) {
      console.warn('Could not calculate storage usage:', error)
    }
    
    // Estimate 5-10MB available (varies by browser)
    const estimatedAvailable = 5 * 1024 * 1024 // 5MB
    const percentage = (used / estimatedAvailable) * 100
    
    return {
      used,
      available: Math.max(0, estimatedAvailable - used),
      percentage: Math.min(100, percentage)
    }
  }

  /**
   * Export all game data as JSON
   */
  static exportData(prefix?: string): string {
    const targetPrefix = prefix || this.DEFAULT_PREFIX
    const data: Record<string, any> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(targetPrefix + '-')) {
        const shortKey = key.substring(targetPrefix.length + 1)
        const value = localStorage.getItem(key)
        if (value) {
          try {
            data[shortKey] = JSON.parse(value)
          } catch {
            data[shortKey] = value
          }
        }
      }
    }
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      gameData: data
    }, null, 2)
  }

  /**
   * Import game data from JSON
   */
  static importData(jsonData: string, prefix?: string): boolean {
    try {
      const parsed = JSON.parse(jsonData)
      const targetPrefix = prefix || this.DEFAULT_PREFIX
      
      if (!parsed.gameData) {
        throw new Error('Invalid export format')
      }
      
      // Clear existing data first
      this.clearAll(targetPrefix)
      
      // Import new data
      Object.entries(parsed.gameData).forEach(([key, value]) => {
        const fullKey = this.buildKey(key, targetPrefix)
        localStorage.setItem(fullKey, JSON.stringify(value))
      })
      
      return true
    } catch (error) {
      console.error('Data import error:', error)
      return false
    }
  }

  private static buildKey(key: string, prefix?: string): string {
    const actualPrefix = prefix || this.DEFAULT_PREFIX
    return `${actualPrefix}-${key}`
  }

  // Simple compression using basic run-length encoding for repeated characters
  private static compress(str: string): string {
    return str.replace(/(.)\1+/g, (match, char) => {
      return char + match.length
    })
  }

  private static decompress(str: string): string {
    return str.replace(/(.)(\d+)/g, (match, char, count) => {
      return char.repeat(parseInt(count))
    })
  }

  // Simple XOR encryption (not cryptographically secure, just obfuscation)
  private static simpleEncrypt(str: string): string {
    const key = 42 // Simple key
    return btoa(str.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) ^ key)
    ).join(''))
  }

  private static simpleDecrypt(str: string): string {
    const key = 42 // Same key
    return atob(str).split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) ^ key)
    ).join('')
  }
}
