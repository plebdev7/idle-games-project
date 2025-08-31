/**
 * Game Engine - Main exports
 * Shared game engine for idle game development
 */

// Core engine classes
export { GameLoop } from './core/GameLoop'
export { TimeManager } from './core/TimeManager'
export { EventManager } from './core/EventManager'
export type { EventCallback, GameEvent } from './core/EventManager'

// Utility classes
export { MathUtils } from './utils/MathUtils'
export { FormatUtils } from './utils/FormatUtils'
export { StorageUtils } from './utils/StorageUtils'
export type { StorageOptions } from './utils/StorageUtils'

// State management
export { SaveManager } from './state/SaveManager'
export type { SaveData, SaveOptions } from './state/SaveManager'
export { StateValidator } from './state/StateValidator'
export type { ValidationRule, ValidationSchema, ValidationResult } from './state/StateValidator'
export { BaseStore } from './state/BaseStore'
export type { BaseStoreState, BaseStoreOptions } from './state/BaseStore'

// Import classes for factory function
import { GameLoop } from './core/GameLoop'
import { TimeManager } from './core/TimeManager'
import { EventManager } from './core/EventManager'
import { SaveManager } from './state/SaveManager'

/**
 * Game Engine version
 */
export const GAME_ENGINE_VERSION = '1.0.0'

/**
 * Create a new game instance with default configuration
 */
export function createGameEngine(options: {
  autoSave?: boolean
  debugMode?: boolean
  saveKey?: string
} = {}) {
  const gameLoopInstance = new GameLoop()
  const timeManagerInstance = new TimeManager()
  const eventManagerInstance = new EventManager()
  const saveManagerInstance = new SaveManager({
    autoSave: options.autoSave ?? true,
    compress: true,
    encrypt: false,
    validateChecksum: true
  })

  return {
    gameLoop: gameLoopInstance,
    timeManager: timeManagerInstance,
    eventManager: eventManagerInstance,
    saveManager: saveManagerInstance,
    version: GAME_ENGINE_VERSION,
    
    // Convenience methods
    start() {
      gameLoopInstance.start()
      timeManagerInstance.startSession()
      saveManagerInstance.startAutoSave()
    },
    
    stop() {
      gameLoopInstance.stop()
      timeManagerInstance.endSession()
      saveManagerInstance.stopAutoSave()
    },
    
    reset() {
      eventManagerInstance.clear()
      // Note: Individual stores should handle their own reset logic
    }
  }
}
