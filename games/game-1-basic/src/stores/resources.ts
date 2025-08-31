/**
 * Resource Store - Core gameplay implementation
 */
import { defineStore } from 'pinia'
import type { ResourceState } from '@/types/game'
import { formatNumber, formatRate, formatMultiplier } from '@/utils/formatters'

export const useResourceStore = defineStore('resources', {
  state: (): ResourceState => ({
    primary: 0,
    generationRate: 0,
    clickPower: 1,
    totalEarned: 0,
    lifetimeClicks: 0
  }),

  getters: {
    /**
     * Format primary resource for display
     */
    formattedPrimary: (state): string => {
      return formatNumber(state.primary)
    },

    /**
     * Format generation rate for display (per second)
     */
    formattedGenerationRate: (state): string => {
      return formatRate(state.generationRate)
    },

    /**
     * Format click power for display
     */
    formattedClickPower: (state): string => {
      return formatMultiplier(state.clickPower, 'per click')
    },

    /**
     * Check if player can afford a cost
     */
    canAfford: (state) => (cost: number): boolean => {
      return state.primary >= cost
    }
  },

  actions: {
    /**
     * Add resources to primary resource pool
     */
    addResources(amount: number) {
      if (amount <= 0) return
      
      this.primary += amount
      this.totalEarned += amount
    },

    /**
     * Add to click power (resources per click)
     */
    addClickPower(amount: number) {
      if (amount <= 0) return
      
      this.clickPower += amount
    },

    /**
     * Multiply click power by a factor
     */
    multiplyClickPower(multiplier: number) {
      if (multiplier <= 0) return
      
      this.clickPower *= multiplier
    },

    /**
     * Add to passive generation rate
     */
    addGenerationRate(amount: number) {
      if (amount <= 0) return
      
      this.generationRate += amount
    },

    /**
     * Multiply generation rate by a factor
     */
    multiplyGenerationRate(multiplier: number) {
      if (multiplier <= 0) return
      
      this.generationRate *= multiplier
    },

    /**
     * Handle player click action
     */
    handleClick() {
      this.addResources(this.clickPower)
      this.lifetimeClicks++
    },

    /**
     * Calculate and add passive generation for given time period
     */
    calculatePassiveGeneration(deltaTimeMs: number) {
      if (this.generationRate <= 0) return
      
      const deltaTimeSeconds = deltaTimeMs / 1000
      const generatedAmount = this.generationRate * deltaTimeSeconds
      
      this.addResources(generatedAmount)
    },

    /**
     * Spend resources (for purchases)
     */
    spendResources(amount: number): boolean {
      if (!this.canAfford(amount)) return false
      
      this.primary -= amount
      return true
    },

    /**
     * Initialize store with default values
     */
    initialize() {
      this.primary = 0
      this.generationRate = 0
      this.clickPower = 1
      this.totalEarned = 0
      this.lifetimeClicks = 0
    },

    /**
     * Reset all resources to initial state
     */
    reset() {
      this.initialize()
    },

    /**
     * Load state from save data
     */
    loadState(savedState: Partial<ResourceState>) {
      Object.assign(this.$state, savedState)
    }
  }
})