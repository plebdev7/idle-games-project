/**
 * Vitest test setup - Foundation
 */
import { config } from '@vue/test-utils'

// Global test configuration
config.global.stubs = {
  // Add component stubs as needed in Phase 2
}

// Mock game engine for tests
vi.mock('@idle-games/game-engine', () => ({
  GameLoop: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    onUIUpdate: vi.fn(),
    onGameLogic: vi.fn()
  })),
  TimeManager: vi.fn(),
  EventManager: vi.fn(),
  SaveManager: vi.fn()
}))

// Setup DOM environment
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now()
  }
})

Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true
})

Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true
})
