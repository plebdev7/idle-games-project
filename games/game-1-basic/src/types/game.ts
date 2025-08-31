/**
 * Game type definitions
 */

// Resource management types
export interface ResourceState {
  primary: number
  generationRate: number
  clickPower: number
  totalEarned: number
  lifetimeClicks: number
}

// Upgrade system types
export interface UpgradeDefinition {
  id: string
  name: string
  description: string
  category: 'production' | 'automation' | 'efficiency'
  baseCost: number
  costMultiplier: number
  effect: {
    type: 'multiply_generation' | 'multiply_click' | 'add_generation' | 'add_click'
    value: number
  }
  maxLevel?: number
  unlockRequirement?: {
    type: 'resource_amount' | 'upgrade_level' | 'total_earned'
    target: string
    value: number
  }
}

export interface UpgradeState {
  owned: Record<string, number>
  unlocked: Record<string, boolean>
  costs: Record<string, number>
}

// Game session types
export interface GameState {
  gameStartTime: number
  lastSaveTime: number
  totalPlayTime: number
  isOffline: boolean
  backgroundStartTime: number
  version: string
}

// Settings types
export interface SettingsState {
  audioEnabled: boolean
  hapticEnabled: boolean
  reducedMotion: boolean
  theme: 'light' | 'dark' | 'auto'
  numberFormat: 'short' | 'scientific' | 'full'
  autoSaveInterval: number
  showFPS: boolean
  compactMode: boolean
}

// Statistics types
export interface GameStatistics {
  totalClicks: number
  totalResourcesEarned: number
  totalUpgradesPurchased: number
  totalPlayTime: number
  averageResourcesPerSecond: number
  highestResourcesPerSecond: number
  sessionsPlayed: number
  offlineProgressClaimed: number
}

// Notification types
export interface GameNotification {
  id: string
  type: 'achievement' | 'milestone' | 'upgrade' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Achievement types
export interface Achievement {
  id: string
  name: string
  description: string
  category: string
  requirement: {
    type: 'resource_total' | 'click_count' | 'upgrade_count' | 'play_time'
    value: number
  }
  reward?: {
    type: 'resource_bonus' | 'click_multiplier' | 'generation_multiplier'
    value: number
  }
  unlocked: boolean
  dateUnlocked?: number
}

// Offline progress types
export interface OfflineProgress {
  timeOffline: number
  resourcesGained: number
  cappedAt: boolean
  summary: string
}

// Save data types
export interface GameSaveData {
  version: string
  timestamp: number
  resources: ResourceState
  upgrades: UpgradeState
  game: GameState
  settings: SettingsState
  statistics: GameStatistics
  achievements: Record<string, Achievement>
}

// Game engine integration types
export interface GameEngineConfig {
  targetFPS: number
  autoSaveInterval: number
  maxOfflineHours: number
  enablePerformanceMonitoring: boolean
}
