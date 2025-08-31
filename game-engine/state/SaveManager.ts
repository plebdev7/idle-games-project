/**
 * SaveManager - Handle game save/load operations with data validation
 */
import { StorageUtils } from '../utils/StorageUtils'

export interface SaveData {
  version: string
  timestamp: number
  gameState: Record<string, any>
  statistics: Record<string, number>
  checksum: string
}

export interface SaveOptions {
  autoSave?: boolean
  compress?: boolean
  encrypt?: boolean
  validateChecksum?: boolean
}

export class SaveManager {
  private readonly SAVE_KEY = 'game-save'
  private readonly AUTO_SAVE_INTERVAL = 60000 // 60 seconds
  private readonly CURRENT_VERSION = '1.0.0'
  
  private autoSaveTimer?: number
  private isAutoSaveEnabled = false
  private saveOptions: SaveOptions = {
    autoSave: true,
    compress: true,
    encrypt: false,
    validateChecksum: true
  }

  constructor(options: Partial<SaveOptions> = {}) {
    this.saveOptions = { ...this.saveOptions, ...options }
  }

  /**
   * Start automatic saving
   */
  startAutoSave(): void {
    if (!this.saveOptions.autoSave || this.isAutoSaveEnabled) return
    
    this.isAutoSaveEnabled = true
    this.autoSaveTimer = setInterval(() => {
      this.autoSave()
    }, this.AUTO_SAVE_INTERVAL)
  }

  /**
   * Stop automatic saving
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
    this.isAutoSaveEnabled = false
  }

  /**
   * Manually save game state
   */
  saveGame(gameState: Record<string, any>, statistics: Record<string, number> = {}): boolean {
    try {
      const saveData: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        gameState,
        statistics,
        checksum: this.generateChecksum(gameState, statistics)
      }

      const success = StorageUtils.save(this.SAVE_KEY, saveData, {
        compress: this.saveOptions.compress,
        encrypt: this.saveOptions.encrypt
      })

      if (success) {
        this.emitSaveEvent('manual-save', true)
      }

      return success
    } catch (error) {
      console.error('Manual save failed:', error)
      this.emitSaveEvent('manual-save', false)
      return false
    }
  }

  /**
   * Load game state
   */
  loadGame(): { success: boolean; data?: SaveData; error?: string } {
    try {
      const defaultSave: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        gameState: {},
        statistics: {},
        checksum: ''
      }

      const saveData = StorageUtils.load<SaveData>(this.SAVE_KEY, defaultSave, {
        compress: this.saveOptions.compress,
        encrypt: this.saveOptions.encrypt
      })

      // Check if this is a new game (no actual save data)
      if (Object.keys(saveData.gameState).length === 0) {
        return { success: true, data: undefined }
      }

      // Validate save data
      const validation = this.validateSaveData(saveData)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Handle version migration if needed
      const migrated = this.migrateSaveData(saveData)

      this.emitSaveEvent('load', true)
      return { success: true, data: migrated }
    } catch (error) {
      const errorMessage = `Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMessage)
      this.emitSaveEvent('load', false)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Delete save data
   */
  deleteSave(): boolean {
    try {
      const success = StorageUtils.remove(this.SAVE_KEY)
      if (success) {
        this.emitSaveEvent('delete', true)
      }
      return success
    } catch (error) {
      console.error('Delete save failed:', error)
      this.emitSaveEvent('delete', false)
      return false
    }
  }

  /**
   * Export save data as JSON string
   */
  exportSave(): string | null {
    try {
      const result = this.loadGame()
      if (result.success && result.data) {
        return JSON.stringify(result.data, null, 2)
      }
      return null
    } catch (error) {
      console.error('Export failed:', error)
      return null
    }
  }

  /**
   * Import save data from JSON string
   */
  importSave(jsonData: string): { success: boolean; error?: string } {
    try {
      const saveData: SaveData = JSON.parse(jsonData)
      
      const validation = this.validateSaveData(saveData)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      const success = StorageUtils.save(this.SAVE_KEY, saveData, {
        compress: this.saveOptions.compress,
        encrypt: this.saveOptions.encrypt
      })

      if (success) {
        this.emitSaveEvent('import', true)
      }

      return { success }
    } catch (error) {
      const errorMessage = `Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`
      this.emitSaveEvent('import', false)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get save file information
   */
  getSaveInfo(): { exists: boolean; timestamp?: number; version?: string; size?: number } {
    const exists = StorageUtils.exists(this.SAVE_KEY)
    
    if (!exists) {
      return { exists: false }
    }

    const result = this.loadGame()
    if (result.success && result.data) {
      return {
        exists: true,
        timestamp: result.data.timestamp,
        version: result.data.version,
        size: JSON.stringify(result.data).length
      }
    }

    return { exists: true }
  }

  /**
   * Calculate offline progress based on save timestamp
   */
  calculateOfflineProgress(resourcesPerSecond: number): {
    timeOffline: number
    resourcesGained: number
    cappedAt: boolean
  } {
    const saveInfo = this.getSaveInfo()
    
    if (!saveInfo.exists || !saveInfo.timestamp) {
      return { timeOffline: 0, resourcesGained: 0, cappedAt: false }
    }

    const now = Date.now()
    const offlineTime = now - saveInfo.timestamp
    
    // Cap offline time at 4 hours
    const maxOfflineTime = 4 * 60 * 60 * 1000
    const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime)
    
    const offlineSeconds = effectiveOfflineTime / 1000
    const resourcesGained = Math.floor(offlineSeconds * resourcesPerSecond)
    
    return {
      timeOffline: effectiveOfflineTime,
      resourcesGained,
      cappedAt: offlineTime > maxOfflineTime
    }
  }

  private autoSave(): void {
    // This would typically be called by the game's state management system
    // For now, we'll emit an event that the game can listen to
    this.emitSaveEvent('auto-save-trigger', true)
  }

  private validateSaveData(saveData: SaveData): { isValid: boolean; error?: string } {
    if (!saveData.version) {
      return { isValid: false, error: 'Missing version information' }
    }

    if (!saveData.timestamp || typeof saveData.timestamp !== 'number') {
      return { isValid: false, error: 'Invalid timestamp' }
    }

    if (!saveData.gameState || typeof saveData.gameState !== 'object') {
      return { isValid: false, error: 'Invalid game state' }
    }

    // Validate checksum if enabled
    if (this.saveOptions.validateChecksum && saveData.checksum) {
      const expectedChecksum = this.generateChecksum(saveData.gameState, saveData.statistics || {})
      if (expectedChecksum !== saveData.checksum) {
        return { isValid: false, error: 'Save data corrupted (checksum mismatch)' }
      }
    }

    return { isValid: true }
  }

  private migrateSaveData(saveData: SaveData): SaveData {
    // Handle version migrations here
    // For now, just update to current version
    if (saveData.version !== this.CURRENT_VERSION) {
      console.log(`Migrating save from version ${saveData.version} to ${this.CURRENT_VERSION}`)
      saveData.version = this.CURRENT_VERSION
    }
    
    return saveData
  }

  private generateChecksum(gameState: Record<string, any>, statistics: Record<string, number>): string {
    // Simple checksum generation (in a real game, you'd use a proper hash function)
    const dataString = JSON.stringify(gameState) + JSON.stringify(statistics)
    let hash = 0
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash.toString(16)
  }

  private emitSaveEvent(type: string, success: boolean): void {
    // Emit custom events that the game can listen to
    const event = new CustomEvent('game-save-event', {
      detail: { type, success, timestamp: Date.now() }
    })
    window.dispatchEvent(event)
  }
}
