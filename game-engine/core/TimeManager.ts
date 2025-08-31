/**
 * TimeManager - Handles time-related calculations and session tracking
 */
export class TimeManager {
  private sessionStartTime = 0
  private totalPlayTime = 0
  private lastActiveTime = 0
  private isActive = false

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
  }

  /**
   * Start a new game session
   */
  startSession(): void {
    this.sessionStartTime = Date.now()
    this.lastActiveTime = this.sessionStartTime
    this.isActive = true
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /**
   * End the current session and accumulate play time
   */
  endSession(): void {
    if (this.isActive) {
      this.accumulatePlayTime()
      this.isActive = false
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /**
   * Pause the session (tab becomes inactive)
   */
  pauseSession(): void {
    if (this.isActive) {
      this.accumulatePlayTime()
      this.isActive = false
    }
  }

  /**
   * Resume the session (tab becomes active again)
   */
  resumeSession(): number {
    const offlineTime = this.isActive ? 0 : Date.now() - this.lastActiveTime
    this.lastActiveTime = Date.now()
    this.isActive = true
    
    return offlineTime
  }

  /**
   * Get current session duration in milliseconds
   */
  getSessionDuration(): number {
    if (!this.isActive) return 0
    return Date.now() - this.sessionStartTime
  }

  /**
   * Get total accumulated play time in milliseconds
   */
  getTotalPlayTime(): number {
    let totalTime = this.totalPlayTime
    if (this.isActive) {
      totalTime += Date.now() - this.sessionStartTime
    }
    return totalTime
  }

  /**
   * Set the total play time (used when loading save data)
   */
  setTotalPlayTime(totalTime: number): void {
    this.totalPlayTime = totalTime
  }

  /**
   * Calculate offline progress time and resources
   */
  calculateOfflineProgress(offlineTimeMs: number, resourcesPerSecond: number): {
    timeOffline: number
    resourcesGained: number
    cappedAt: boolean
  } {
    const maxOfflineHours = 4
    const maxOfflineMs = maxOfflineHours * 60 * 60 * 1000
    
    const effectiveOfflineTime = Math.min(offlineTimeMs, maxOfflineMs)
    const offlineSeconds = effectiveOfflineTime / 1000
    const resourcesGained = Math.floor(offlineSeconds * resourcesPerSecond)
    
    return {
      timeOffline: effectiveOfflineTime,
      resourcesGained,
      cappedAt: offlineTimeMs > maxOfflineMs
    }
  }

  /**
   * Format time duration for display
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  private accumulatePlayTime(): void {
    if (this.sessionStartTime > 0) {
      this.totalPlayTime += Date.now() - this.sessionStartTime
      this.sessionStartTime = Date.now()
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pauseSession()
    } else {
      this.resumeSession()
    }
  }

  /**
   * Get serializable state for saving
   */
  getState(): { totalPlayTime: number; lastActiveTime: number } {
    return {
      totalPlayTime: this.getTotalPlayTime(),
      lastActiveTime: this.lastActiveTime
    }
  }

  /**
   * Restore state from save data
   */
  setState(state: { totalPlayTime: number; lastActiveTime: number }): void {
    this.totalPlayTime = state.totalPlayTime
    this.lastActiveTime = state.lastActiveTime
  }
}
