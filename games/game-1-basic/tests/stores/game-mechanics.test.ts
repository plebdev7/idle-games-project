/**
 * Core Game Mechanics Tests
 * Tests for resource generation, upgrade system, and game loop
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '@/stores/resources'
import { useUpgradeStore, UPGRADE_DEFINITIONS } from '@/stores/upgrades'
import { useGameStore } from '@/stores/game'

describe('Resource Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useResourceStore()
    store.initialize()
    
    expect(store.primary).toBe(0)
    expect(store.generationRate).toBe(0)
    expect(store.clickPower).toBe(1)
    expect(store.totalEarned).toBe(0)
    expect(store.lifetimeClicks).toBe(0)
  })

  it('should add resources correctly', () => {
    const store = useResourceStore()
    store.initialize()
    
    store.addResources(100)
    
    expect(store.primary).toBe(100)
    expect(store.totalEarned).toBe(100)
  })

  it('should handle click actions correctly', () => {
    const store = useResourceStore()
    store.initialize()
    
    store.handleClick()
    
    expect(store.primary).toBe(1)
    expect(store.totalEarned).toBe(1)
    expect(store.lifetimeClicks).toBe(1)
  })

  it('should calculate passive generation correctly', () => {
    const store = useResourceStore()
    store.initialize()
    store.addGenerationRate(10) // 10 per second
    
    store.calculatePassiveGeneration(5000) // 5 seconds
    
    expect(store.primary).toBe(50)
    expect(store.totalEarned).toBe(50)
  })

  it('should spend resources correctly', () => {
    const store = useResourceStore()
    store.initialize()
    store.addResources(100)
    
    const success = store.spendResources(50)
    
    expect(success).toBe(true)
    expect(store.primary).toBe(50)
  })

  it('should not allow spending more resources than available', () => {
    const store = useResourceStore()
    store.initialize()
    store.addResources(50)
    
    const success = store.spendResources(100)
    
    expect(success).toBe(false)
    expect(store.primary).toBe(50)
  })

  it('should format numbers correctly', () => {
    const store = useResourceStore()
    store.initialize()
    
    store.addResources(1234567)
    
    expect(store.formattedPrimary).toBe('1.23M')
  })

  it('should check affordability correctly', () => {
    const store = useResourceStore()
    store.initialize()
    store.addResources(100)
    
    expect(store.canAfford(50)).toBe(true)
    expect(store.canAfford(150)).toBe(false)
  })
})

describe('Upgrade Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty owned upgrades', () => {
    const store = useUpgradeStore()
    store.initialize()
    
    expect(Object.keys(store.owned)).toHaveLength(0)
    // Note: Some upgrades may be auto-unlocked if they have no requirements
    expect(store.unlocked['clickPower1']).toBe(true) // No requirements = auto-unlocked
  })

  it('should calculate upgrade costs with exponential scaling', () => {
    const store = useUpgradeStore()
    store.initialize()
    
    const cost0 = store.getUpgradeCost('clickPower1')
    store.owned['clickPower1'] = 1
    const cost1 = store.getUpgradeCost('clickPower1')
    
    expect(cost0).toBe(10) // Base cost
    expect(cost1).toBe(11) // 10 * 1.15^1 = 11.5, floored to 11
  })

  it('should unlock upgrades based on requirements', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    
    resourceStore.initialize()
    upgradeStore.initialize()
    
    // Should start with no upgrades unlocked
    expect(upgradeStore.unlocked['clickPower1']).toBe(true) // No requirement = always unlocked
    expect(upgradeStore.unlocked['autoClicker']).toBeFalsy()
    
    // Add resources to meet autoClicker requirement (25 primary)
    resourceStore.addResources(25)
    upgradeStore.checkUnlocks()
    
    expect(upgradeStore.unlocked['autoClicker']).toBe(true)
  })

  it('should purchase upgrades correctly', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    
    resourceStore.initialize()
    upgradeStore.initialize()
    resourceStore.addResources(100) // Enough for clickPower1 (cost: 10)
    upgradeStore.checkUnlocks()
    
    const initialClickPower = resourceStore.clickPower
    const success = upgradeStore.purchaseUpgrade('clickPower1')
    
    expect(success).toBe(true)
    expect(upgradeStore.getUpgradeLevel('clickPower1')).toBe(1)
    expect(resourceStore.primary).toBe(90) // 100 - 10 cost
    expect(resourceStore.clickPower).toBe(initialClickPower + 1) // +1 from upgrade
  })

  it('should not allow purchasing unaffordable upgrades', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    
    resourceStore.initialize()
    upgradeStore.initialize()
    resourceStore.addResources(5) // Not enough for clickPower1 (cost: 10)
    
    const success = upgradeStore.purchaseUpgrade('clickPower1')
    
    expect(success).toBe(false)
    expect(upgradeStore.getUpgradeLevel('clickPower1')).toBe(0)
    expect(resourceStore.primary).toBe(5) // Unchanged
  })

  it('should apply upgrade effects correctly', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    
    resourceStore.initialize()
    upgradeStore.initialize()
    
    const upgrade = UPGRADE_DEFINITIONS['clickPower1']
    upgradeStore.applyUpgradeEffect(upgrade)
    
    expect(resourceStore.clickPower).toBe(2) // 1 + 1 from upgrade
  })
})

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize game session correctly', () => {
    const store = useGameStore()
    store.startGameSession()
    
    expect(store.gameStartTime).toBeGreaterThan(0)
    expect(store.isGameRunning).toBe(true)
  })

  it('should calculate session duration correctly', () => {
    const store = useGameStore()
    store.startGameSession()
    
    // Simulate time passing
    const startTime = store.gameStartTime
    store.gameStartTime = startTime - 5000 // 5 seconds ago
    
    expect(store.currentSessionDuration).toBeGreaterThanOrEqual(5000)
  })

  it('should handle offline progress calculation', () => {
    const resourceStore = useResourceStore()
    const gameStore = useGameStore()
    
    resourceStore.initialize()
    gameStore.initialize()
    
    // Set up passive generation
    resourceStore.addGenerationRate(10) // 10 per second
    
    // Simulate offline time
    gameStore.lastSaveTime = Date.now() - 10000 // 10 seconds ago
    gameStore.calculateOfflineProgress()
    
    // Should have generated 10 resources/sec * 10 sec = 100 resources
    expect(resourceStore.primary).toBe(100)
  })

  it('should cap offline time to prevent abuse', () => {
    const resourceStore = useResourceStore()
    const gameStore = useGameStore()
    
    resourceStore.initialize()
    gameStore.initialize()
    
    // Set up passive generation
    resourceStore.addGenerationRate(1) // 1 per second
    
    // Simulate very long offline time (25 hours)
    const longOfflineTime = 25 * 60 * 60 * 1000
    gameStore.lastSaveTime = Date.now() - longOfflineTime
    gameStore.calculateOfflineProgress()
    
    // Should be capped at 8 hours = 8 * 3600 = 28800 resources
    expect(resourceStore.primary).toBe(28800)
  })
})

describe('Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should complete a full gameplay loop', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    const gameStore = useGameStore()
    
    // Initialize game
    resourceStore.initialize()
    upgradeStore.initialize()
    gameStore.initialize()
    
    // Click to earn resources
    resourceStore.handleClick() // +1 resource
    expect(resourceStore.primary).toBe(1)
    expect(resourceStore.lifetimeClicks).toBe(1)
    
    // Click more to afford first upgrade
    for (let i = 0; i < 10; i++) {
      resourceStore.handleClick()
    }
    expect(resourceStore.primary).toBe(11)
    
    // Purchase first upgrade
    upgradeStore.checkUnlocks()
    const success = upgradeStore.purchaseUpgrade('clickPower1')
    expect(success).toBe(true)
    expect(resourceStore.primary).toBe(1) // 11 - 10 cost
    expect(resourceStore.clickPower).toBe(2) // Upgraded
    
    // Click with improved power
    resourceStore.handleClick()
    expect(resourceStore.primary).toBe(3) // 1 + 2 click power
    
    // Save and load game
    gameStore.saveGame()
    
    // Reset state
    resourceStore.reset()
    upgradeStore.reset()
    expect(resourceStore.primary).toBe(0)
    expect(upgradeStore.getUpgradeLevel('clickPower1')).toBe(0)
    
    // Load saved game
    const loaded = gameStore.loadGame()
    expect(loaded).toBe(true)
    expect(resourceStore.primary).toBe(3)
    expect(upgradeStore.getUpgradeLevel('clickPower1')).toBe(1)
  })

  it('should handle progression to automation', () => {
    const resourceStore = useResourceStore()
    const upgradeStore = useUpgradeStore()
    
    resourceStore.initialize()
    upgradeStore.initialize()
    
    // Build up resources for auto-clicker
    resourceStore.addResources(100)
    upgradeStore.checkUnlocks()
    
    // Auto-clicker should be unlocked (requires 25 resources)
    expect(upgradeStore.unlocked['autoClicker']).toBe(true)
    
    // Purchase auto-clicker
    const success = upgradeStore.purchaseUpgrade('autoClicker')
    expect(success).toBe(true)
    expect(resourceStore.generationRate).toBe(1) // +1/sec from auto-clicker
    
    // Simulate passive generation
    resourceStore.calculatePassiveGeneration(10000) // 10 seconds
    expect(resourceStore.primary).toBe(60) // 50 remaining + 10 generated
  })
})
