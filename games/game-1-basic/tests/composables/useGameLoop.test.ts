/**
 * Game Loop Composable Tests - Foundation setup
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameLoop } from '@/composables/useGameLoop'

// Mock the game engine
vi.mock('@idle-games/game-engine', () => ({
  GameLoop: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    onUIUpdate: vi.fn(),
    onGameLogic: vi.fn()
  }))
}))

describe('useGameLoop - Foundation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { isRunning, fps } = useGameLoop()
    
    expect(isRunning.value).toBe(false)
    expect(fps.value).toBe(0)
  })

  it('should provide start and stop methods', () => {
    const { start, stop } = useGameLoop()
    
    expect(typeof start).toBe('function')
    expect(typeof stop).toBe('function')
  })

  // More detailed tests will be added in Phase 2
})
