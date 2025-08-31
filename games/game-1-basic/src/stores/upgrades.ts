/**
 * Upgrade Store - Core gameplay implementation
 */
import { defineStore } from 'pinia'
import { MathUtils } from '@idle-games/game-engine'
import type { UpgradeDefinition, UpgradeState } from '@/types/game'
import { useResourceStore } from './resources'

// Upgrade definitions with exponential cost scaling
export const UPGRADE_DEFINITIONS: Record<string, UpgradeDefinition> = {
  clickPower1: {
    id: 'clickPower1',
    name: 'Stronger Clicks',
    description: 'Increase click power by +1',
    category: 'clicking',
    baseCost: 10,
    costMultiplier: 1.15,
    effect: {
      type: 'add_click',
      value: 1
    }
  },
  clickPower2: {
    id: 'clickPower2',
    name: 'Click Multiplier',
    description: 'Double your click power',
    category: 'clicking',
    baseCost: 100,
    costMultiplier: 1.15,
    effect: {
      type: 'multiply_click',
      value: 2
    },
    unlockRequirement: {
      type: 'upgrade_level',
      target: 'clickPower1',
      value: 5
    }
  },
  autoClicker: {
    id: 'autoClicker',
    name: 'Auto Clicker',
    description: 'Automatically generates 1 resource per second',
    category: 'generators',
    baseCost: 50,
    costMultiplier: 1.15,
    effect: {
      type: 'add_generation',
      value: 1
    },
    unlockRequirement: {
      type: 'resource_amount',
      target: 'primary',
      value: 25
    }
  },
  generator1: {
    id: 'generator1',
    name: 'Basic Generator',
    description: 'Generates 5 resources per second',
    category: 'generators',
    baseCost: 200,
    costMultiplier: 1.15,
    effect: {
      type: 'add_generation',
      value: 5
    },
    unlockRequirement: {
      type: 'upgrade_level',
      target: 'autoClicker',
      value: 3
    }
  },
  generatorMultiplier: {
    id: 'generatorMultiplier',
    name: 'Generator Efficiency',
    description: 'Double all passive generation',
    category: 'multipliers',
    baseCost: 1000,
    costMultiplier: 1.15,
    effect: {
      type: 'multiply_generation',
      value: 2
    },
    unlockRequirement: {
      type: 'upgrade_level',
      target: 'generator1',
      value: 5
    }
  },
  megaGenerator: {
    id: 'megaGenerator',
    name: 'Mega Generator',
    description: 'Generates 50 resources per second',
    category: 'generators',
    baseCost: 5000,
    costMultiplier: 1.15,
    effect: {
      type: 'add_generation',
      value: 50
    },
    unlockRequirement: {
      type: 'total_earned',
      target: 'primary',
      value: 10000
    }
  },
  superMultiplier: {
    id: 'superMultiplier',
    name: 'Super Efficiency',
    description: 'Triple all resource generation',
    category: 'multipliers',
    baseCost: 25000,
    costMultiplier: 1.15,
    effect: {
      type: 'multiply_generation',
      value: 3
    },
    unlockRequirement: {
      type: 'upgrade_level',
      target: 'megaGenerator',
      value: 10
    }
  }
}

export const useUpgradeStore = defineStore('upgrades', {
  state: (): UpgradeState => ({
    owned: {},
    unlocked: {},
    costs: {}
  }),

  getters: {
    /**
     * Get all available upgrade definitions
     */
    allUpgrades: (): UpgradeDefinition[] => {
      return Object.values(UPGRADE_DEFINITIONS)
    },

    /**
     * Get upgrades that are currently unlocked
     */
    unlockedUpgrades: (state): UpgradeDefinition[] => {
      return Object.values(UPGRADE_DEFINITIONS).filter(upgrade => 
        state.unlocked[upgrade.id] === true
      )
    },

    /**
     * Get current level of an upgrade
     */
    getUpgradeLevel: (state) => (upgradeId: string): number => {
      return state.owned[upgradeId] || 0
    },

    /**
     * Get current cost of an upgrade
     */
    getUpgradeCost: (state) => (upgradeId: string): number => {
      const upgrade = UPGRADE_DEFINITIONS[upgradeId]
      if (!upgrade) return 0
      
      const currentLevel = state.owned[upgradeId] || 0
      return MathUtils.calculateExponentialCost(
        upgrade.baseCost,
        currentLevel,
        upgrade.costMultiplier
      )
    },

    /**
     * Check if player can afford an upgrade
     */
    canAffordUpgrade() {
      return (upgradeId: string): boolean => {
        const resourceStore = useResourceStore()
        const cost = this.getUpgradeCost(upgradeId)
        return resourceStore.canAfford(cost)
      }
    }
  },

  actions: {
    /**
     * Purchase an upgrade
     */
    purchaseUpgrade(upgradeId: string): boolean {
      const upgrade = UPGRADE_DEFINITIONS[upgradeId]
      if (!upgrade) return false

      const resourceStore = useResourceStore()
      const cost = this.getUpgradeCost(upgradeId)

      // Check if unlocked and affordable
      if (!this.unlocked[upgradeId] || !resourceStore.canAfford(cost)) {
        return false
      }

      // Check max level
      if (upgrade.maxLevel && this.getUpgradeLevel(upgradeId) >= upgrade.maxLevel) {
        return false
      }

      // Purchase upgrade
      if (!resourceStore.spendResources(cost)) return false

      // Increase owned count
      this.owned[upgradeId] = (this.owned[upgradeId] || 0) + 1

      // Apply upgrade effect
      this.applyUpgradeEffect(upgrade)

      // Check for newly unlocked upgrades
      this.checkUnlocks()

      return true
    },

    /**
     * Apply upgrade effects to game state
     */
    applyUpgradeEffect(upgrade: UpgradeDefinition) {
      const resourceStore = useResourceStore()

      switch (upgrade.effect.type) {
        case 'add_click':
          resourceStore.addClickPower(upgrade.effect.value)
          break
        case 'multiply_click':
          resourceStore.multiplyClickPower(upgrade.effect.value)
          break
        case 'add_generation':
          resourceStore.addGenerationRate(upgrade.effect.value)
          break
        case 'multiply_generation':
          resourceStore.multiplyGenerationRate(upgrade.effect.value)
          break
      }
    },

    /**
     * Check and unlock upgrades based on requirements
     */
    checkUnlocks() {
      const resourceStore = useResourceStore()

      for (const upgrade of Object.values(UPGRADE_DEFINITIONS)) {
        if (this.unlocked[upgrade.id]) continue

        const requirement = upgrade.unlockRequirement
        if (!requirement) {
          // No requirement means always unlocked
          this.unlocked[upgrade.id] = true
          continue
        }

        let isUnlocked = false

        switch (requirement.type) {
          case 'resource_amount':
            if (requirement.target === 'primary') {
              isUnlocked = resourceStore.primary >= requirement.value
            }
            break
          case 'upgrade_level':
            const currentLevel = this.getUpgradeLevel(requirement.target)
            isUnlocked = currentLevel >= requirement.value
            break
          case 'total_earned':
            if (requirement.target === 'primary') {
              isUnlocked = resourceStore.totalEarned >= requirement.value
            }
            break
        }

        if (isUnlocked) {
          this.unlocked[upgrade.id] = true
        }
      }
    },

    /**
     * Initialize upgrade store
     */
    initialize() {
      this.owned = {}
      this.unlocked = {}
      this.costs = {}

      // Check for initially unlocked upgrades
      this.checkUnlocks()
    },

    /**
     * Reset all upgrades
     */
    reset() {
      this.initialize()
    },

    /**
     * Load state from save data
     */
    loadState(savedState: Partial<UpgradeState>) {
      Object.assign(this.$state, savedState)
      this.checkUnlocks()
    }
  }
})
