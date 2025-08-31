/**
 * Game Store - Foundation setup
 */
import { defineStore } from 'pinia'
import type { GameState } from '@/types/game'

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    gameStartTime: 0,
    lastSaveTime: 0,
    totalPlayTime: 0,
    isOffline: false,
    backgroundStartTime: 0,
    version: '1.0.0'
  }),

  actions: {
    // Foundation actions - implementation details for Phase 2
    startGameSession() {
      this.gameStartTime = Date.now()
    },
    
    pauseGame() {
      // Basic pause logic
    },
    
    reset() {
      // Basic reset logic
    }
  }
})
