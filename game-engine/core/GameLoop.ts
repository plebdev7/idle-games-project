/**
 * GameLoop - Core game loop management with dual timing system
 * Provides both high-frequency UI updates (60fps) and low-frequency game logic (1fps)
 */
export class GameLoop {
  private isRunning = false
  private lastUpdateTime = 0
  private uiLoopId?: number
  private gameLogicIntervalId?: ReturnType<typeof setInterval>

  private readonly UI_TARGET_FPS = 60
  private readonly GAME_LOGIC_INTERVAL = 1000 // 1 second

  private uiUpdateCallbacks: Array<(deltaTime: number) => void> = []
  private gameLogicCallbacks: Array<() => void> = []

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
  }

  /**
   * Start the dual game loop system
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastUpdateTime = performance.now()

    // Start high-frequency UI update loop (60fps)
    this.startUILoop()

    // Start low-frequency game logic loop (1fps)
    this.startGameLogicLoop()

    // Handle tab visibility changes for performance optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /**
   * Stop both game loops
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    if (this.uiLoopId) {
      cancelAnimationFrame(this.uiLoopId)
      this.uiLoopId = undefined
    }

    if (this.gameLogicIntervalId) {
      clearInterval(this.gameLogicIntervalId)
      this.gameLogicIntervalId = undefined
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /**
   * Register callback for UI updates (60fps)
   */
  onUIUpdate(callback: (deltaTime: number) => void): () => void {
    this.uiUpdateCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.uiUpdateCallbacks.indexOf(callback)
      if (index > -1) {
        this.uiUpdateCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Register callback for game logic updates (1fps)
   */
  onGameLogic(callback: () => void): () => void {
    this.gameLogicCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.gameLogicCallbacks.indexOf(callback)
      if (index > -1) {
        this.gameLogicCallbacks.splice(index, 1)
      }
    }
  }

  private startUILoop(): void {
    const updateUI = (currentTime: number) => {
      if (!this.isRunning) return

      const deltaTime = currentTime - this.lastUpdateTime
      this.lastUpdateTime = currentTime

      // Execute all UI update callbacks
      this.uiUpdateCallbacks.forEach(callback => {
        try {
          callback(deltaTime)
        } catch (error) {
          console.error('UI update callback error:', error)
        }
      })

      this.uiLoopId = requestAnimationFrame(updateUI)
    }

    this.uiLoopId = requestAnimationFrame(updateUI)
  }

  private startGameLogicLoop(): void {
    this.gameLogicIntervalId = setInterval(() => {
      if (!this.isRunning) return

      // Execute all game logic callbacks
      this.gameLogicCallbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error('Game logic callback error:', error)
        }
      })
    }, this.GAME_LOGIC_INTERVAL)
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Tab is now hidden - pause UI updates but keep game logic running
      if (this.uiLoopId) {
        cancelAnimationFrame(this.uiLoopId)
        this.uiLoopId = undefined
      }
    } else {
      // Tab is now visible - resume UI updates
      if (this.isRunning && !this.uiLoopId) {
        this.lastUpdateTime = performance.now()
        this.startUILoop()
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): { fps: number; isVisible: boolean } {
    return {
      fps: document.hidden ? 0 : this.UI_TARGET_FPS,
      isVisible: !document.hidden
    }
  }
}
