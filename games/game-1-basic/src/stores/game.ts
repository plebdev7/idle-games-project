/**
 * Game Store - Core gameplay implementation
 */
import { defineStore } from 'pinia'
import type { GameState } from '@/types/game'
import { useResourceStore } from './resources'
import { useUpgradeStore } from './upgrades'

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    gameStartTime: 0,
    lastSaveTime: 0,
    totalPlayTime: 0,
    isOffline: false,
    backgroundStartTime: 0,
    version: '1.0.0'
  }),

  getters: {
    /**
     * Get current session duration in milliseconds
     */
    currentSessionDuration: (state): number => {
      if (!state.gameStartTime) return 0
      return Date.now() - state.gameStartTime
    },

    /**
     * Get total play time including current session
     */
    totalPlayTimeWithSession: (state): number => {
      return state.totalPlayTime + (state.gameStartTime ? Date.now() - state.gameStartTime : 0)
    },

    /**
     * Check if game is currently running
     */
    isGameRunning: (state): boolean => {
      return state.gameStartTime > 0
    },

    /**
     * Time since last save in milliseconds
     */
    timeSinceLastSave: (state): number => {
      return Date.now() - state.lastSaveTime
    }
  },

  actions: {
    /**
     * Start a new game session
     */
    startGameSession() {
      const now = Date.now()
      this.gameStartTime = now
      
      // If returning from offline, calculate offline progress
      if (this.lastSaveTime > 0) {
        this.calculateOfflineProgress()
      }
      
      this.isOffline = false
      this.backgroundStartTime = 0
    },

    /**
     * Pause the game session
     */
    pauseGame() {
      if (!this.gameStartTime) return
      
      // Add current session time to total
      this.totalPlayTime += Date.now() - this.gameStartTime
      this.gameStartTime = 0
    },

    /**
     * Handle game going to background/tab switching
     */
    handleVisibilityChange(isVisible: boolean) {
      if (isVisible) {
        // Game became visible - resume
        if (this.backgroundStartTime > 0) {
          this.calculateOfflineProgress()
          this.backgroundStartTime = 0
        }
        this.isOffline = false
      } else {
        // Game went to background
        this.backgroundStartTime = Date.now()
        this.isOffline = true
      }
    },

    /**
     * Calculate offline progress when returning to game
     */
    calculateOfflineProgress() {
      const resourceStore = useResourceStore()
      
      let offlineTimeMs = 0
      
      if (this.backgroundStartTime > 0) {
        // Coming back from background
        offlineTimeMs = Date.now() - this.backgroundStartTime
      } else if (this.lastSaveTime > 0) {
        // Loading saved game
        offlineTimeMs = Date.now() - this.lastSaveTime
      }
      
      if (offlineTimeMs > 0 && resourceStore.generationRate > 0) {
        // Cap offline time to prevent abuse (max 8 hours)
        const maxOfflineTime = 8 * 60 * 60 * 1000 // 8 hours in ms
        const cappedOfflineTime = Math.min(offlineTimeMs, maxOfflineTime)
        
        // Calculate offline resources
        resourceStore.calculatePassiveGeneration(cappedOfflineTime)
        
        // Show offline progress notification if significant time passed
        if (cappedOfflineTime > 60000) { // More than 1 minute
          this.showOfflineProgressModal(cappedOfflineTime)
        }
      }
    },

    /**
     * Show offline progress modal (placeholder for UI implementation)
     */
    showOfflineProgressModal(offlineTimeMs: number) {
      const hours = Math.floor(offlineTimeMs / (1000 * 60 * 60))
      const minutes = Math.floor((offlineTimeMs % (1000 * 60 * 60)) / (1000 * 60))
      
      console.log(`Welcome back! You were offline for ${hours}h ${minutes}m`)
      // This will be replaced with actual modal component in UI phase
    },

    /**
     * Save game state to localStorage
     */
    saveGame() {
      const resourceStore = useResourceStore()
      const upgradeStore = useUpgradeStore()
      
      const saveData = {
        resources: resourceStore.$state,
        upgrades: upgradeStore.$state,
        game: {
          ...this.$state,
          lastSaveTime: Date.now()
        }
      }
      
      try {
        localStorage.setItem('idleGame_save', JSON.stringify(saveData))
        this.lastSaveTime = Date.now()
        console.log('Game saved successfully')
      } catch (error) {
        console.error('Failed to save game:', error)
      }
    },

    /**
     * Load game state from localStorage
     */
    loadGame(): boolean {
      try {
        const saveData = localStorage.getItem('idleGame_save')
        if (!saveData) return false
        
        const parsed = JSON.parse(saveData)
        
        // Load each store's state
        const resourceStore = useResourceStore()
        const upgradeStore = useUpgradeStore()
        
        if (parsed.resources) {
          resourceStore.loadState(parsed.resources)
        }
        
        if (parsed.upgrades) {
          upgradeStore.loadState(parsed.upgrades)
        }
        
        if (parsed.game) {
          Object.assign(this.$state, parsed.game)
        }
        
        console.log('Game loaded successfully')
        return true
      } catch (error) {
        console.error('Failed to load game:', error)
        return false
      }
    },

    /**
     * Reset entire game state
     */
    reset() {
      const resourceStore = useResourceStore()
      const upgradeStore = useUpgradeStore()
      
      // Reset all stores
      resourceStore.reset()
      upgradeStore.reset()
      
      // Reset game store
      this.gameStartTime = 0
      this.lastSaveTime = 0
      this.totalPlayTime = 0
      this.isOffline = false
      this.backgroundStartTime = 0
      
      // Clear saved data
      localStorage.removeItem('idleGame_save')
      
      console.log('Game reset successfully')
    },

    /**
     * Initialize game on startup
     */
    initialize() {
      const resourceStore = useResourceStore()
      const upgradeStore = useUpgradeStore()
      
      // Initialize all stores
      resourceStore.initialize()
      upgradeStore.initialize()
      
      // Try to load saved game
      const loaded = this.loadGame()
      
      if (!loaded) {
        // New game
        console.log('Starting new game')
      }
      
      // Start game session
      this.startGameSession()
      
      // Setup auto-save
      this.setupAutoSave()
      
      // Setup visibility change handling
      this.setupVisibilityHandling()
    },

    /**
     * Setup automatic saving every 60 seconds
     */
    setupAutoSave() {
      setInterval(() => {
        if (this.isGameRunning) {
          this.saveGame()
        }
      }, 60000) // Save every 60 seconds
    },

    /**
     * Setup visibility change detection for offline progress
     */
    setupVisibilityHandling() {
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          this.handleVisibilityChange(!document.hidden)
        })
        
        window.addEventListener('beforeunload', () => {
          this.saveGame()
        })
      }
    }
  }
})
