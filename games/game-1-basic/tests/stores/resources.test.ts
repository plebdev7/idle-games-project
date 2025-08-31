/**
 * Resource Store Tests - Foundation setup
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '@/stores/resources'

describe('Resource Store - Foundation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useResourceStore()
    
    expect(store.primary).toBe(0)
    expect(store.generationRate).toBe(0)
    expect(store.clickPower).toBe(1)
    expect(store.totalEarned).toBe(0)
    expect(store.lifetimeClicks).toBe(0)
  })

  it('should reset to initial state', () => {
    const store = useResourceStore()
    
    // Modify some values
    store.$patch({
      primary: 100,
      generationRate: 10
    })
    
    // Reset should restore defaults
    store.reset()
    
    expect(store.primary).toBe(0)
    expect(store.generationRate).toBe(0)
    expect(store.clickPower).toBe(1)
  })

  // More detailed tests will be added in Phase 2
})
