/**
 * Integration test specifically for the automation upgrade "NaNundefined" bug
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '@/stores/resources'
import { useUpgradeStore } from '@/stores/upgrades'
import { formatNumber } from '@/utils/formatters'

describe('Automation Upgrade Bug Fix', () => {
  let resourceStore: any
  let upgradeStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    resourceStore = useResourceStore()
    upgradeStore = useUpgradeStore()
    
    // Reset stores
    resourceStore.initialize()
    upgradeStore.initialize()
  })

  it('should handle automation upgrade purchase without NaN display', () => {
    // Set up initial resources to afford auto clicker
    resourceStore.addResources(100)
    upgradeStore.checkUnlocks()
    
    // Verify auto clicker is unlocked and affordable
    expect(upgradeStore.unlocked['autoClicker']).toBe(true)
    expect(upgradeStore.canAffordUpgrade('autoClicker')).toBe(true)
    
    // Get initial values
    const initialCoins = resourceStore.primary
    const initialCoinDisplay = resourceStore.formattedPrimary
    
    // Verify initial display is not corrupted
    expect(initialCoinDisplay).not.toContain('NaN')
    expect(initialCoinDisplay).not.toContain('undefined')
    expect(initialCoinDisplay).toBe('100')
    
    // Purchase auto clicker
    const purchaseSuccess = upgradeStore.purchaseUpgrade('autoClicker')
    expect(purchaseSuccess).toBe(true)
    
    // Verify resources were spent correctly
    const expectedRemainingCoins = initialCoins - 50 // Auto clicker base cost is 50
    expect(resourceStore.primary).toBe(expectedRemainingCoins)
    
    // Verify coin display is not corrupted after purchase
    const postPurchaseCoinDisplay = resourceStore.formattedPrimary
    expect(postPurchaseCoinDisplay).not.toContain('NaN')
    expect(postPurchaseCoinDisplay).not.toContain('undefined')
    expect(postPurchaseCoinDisplay).toBe('50')
    
    // Verify generation rate was updated correctly
    expect(resourceStore.generationRate).toBe(1)
    const generationDisplay = resourceStore.formattedGenerationRate
    expect(generationDisplay).not.toContain('NaN')
    expect(generationDisplay).not.toContain('undefined')
    expect(generationDisplay).toBe('1/sec')
  })

  it('should handle edge cases that could cause NaN in formatting', () => {
    // Test scenarios that might produce NaN values
    const edgeCases = [
      NaN,
      undefined,
      null,
      Infinity,
      -Infinity,
      0 / 0,
      Math.sqrt(-1),
      parseFloat('invalid')
    ]

    edgeCases.forEach((testValue) => {
      const result = formatNumber(testValue as any)
      expect(result).not.toContain('NaN')
      expect(result).not.toContain('undefined')
      expect(result).toBe('0')
    })
  })

  it('should handle multiple automation upgrade purchases correctly', () => {
    // Give enough resources for multiple purchases
    resourceStore.addResources(1000)
    upgradeStore.checkUnlocks()
    
    // Purchase auto clicker multiple times
    let purchaseCount = 0
    while (upgradeStore.canAffordUpgrade('autoClicker') && purchaseCount < 5) {
      const success = upgradeStore.purchaseUpgrade('autoClicker')
      expect(success).toBe(true)
      purchaseCount++
      
      // Verify display is not corrupted after each purchase
      const coinDisplay = resourceStore.formattedPrimary
      expect(coinDisplay).not.toContain('NaN')
      expect(coinDisplay).not.toContain('undefined')
      
      const generationDisplay = resourceStore.formattedGenerationRate
      expect(generationDisplay).not.toContain('NaN')
      expect(generationDisplay).not.toContain('undefined')
      
      // Verify generation rate increases
      expect(resourceStore.generationRate).toBe(purchaseCount)
    }
    
    expect(purchaseCount).toBeGreaterThan(0)
  })

  it('should handle passive generation calculations correctly', () => {
    // Set up automation
    resourceStore.addResources(100)
    upgradeStore.checkUnlocks()
    upgradeStore.purchaseUpgrade('autoClicker')
    
    // Simulate passive generation
    const deltaTimeMs = 5000 // 5 seconds
    resourceStore.calculatePassiveGeneration(deltaTimeMs)
    
    // Verify calculated resources are properly formatted
    const coinDisplay = resourceStore.formattedPrimary
    expect(coinDisplay).not.toContain('NaN')
    expect(coinDisplay).not.toContain('undefined')
    
    // Should have gained ~5 resources (1/sec * 5 seconds)
    expect(resourceStore.primary).toBeCloseTo(55, 0) // 50 remaining + 5 generated
  })
})
