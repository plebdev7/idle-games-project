/**
 * Settings Store - Foundation setup
 */
import { defineStore } from 'pinia'
import type { SettingsState } from '@/types/game'

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    audioEnabled: true,
    hapticEnabled: false,
    reducedMotion: false,
    theme: 'auto',
    numberFormat: 'short',
    autoSaveInterval: 60000,
    showFPS: false,
    compactMode: false
  }),

  actions: {
    // Foundation actions - implementation details for Phase 2
    initialize() {
      // Basic initialization
    },
    
    reset() {
      // Basic reset to defaults
    }
  }
})
