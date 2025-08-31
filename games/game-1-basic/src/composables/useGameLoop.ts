/**
 * Game Loop Composable - Core gameplay implementation
 */
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import { GameLoop, TimeManager, EventManager } from '@idle-games/game-engine'
import { useResourceStore } from '@/stores/resources'
import { useUpgradeStore } from '@/stores/upgrades'
import { useGameStore } from '@/stores/game'

export function useGameLoop() {
  const gameLoop = new GameLoop()
  const isRunning = ref(false)
  const fps = ref(0)
  const timeManager = new TimeManager()
  const eventManager = new EventManager()

  // Store references
  const resourceStore = useResourceStore()
  const upgradeStore = useUpgradeStore()
  const gameStore = useGameStore()

  // Game loop implementation
  const start = () => {
    if (isRunning.value) return
    
    // Initialize game stores
    gameStore.initialize()
    
    // Start time tracking
    timeManager.startSession()
    
    gameLoop.start()
    isRunning.value = true
    
    // UI update callback (60fps)
    gameLoop.onUIUpdate((deltaTime) => {
      // Update FPS counter for development
      fps.value = Math.round(1000 / (deltaTime || 16))
      
      // TimeManager doesn't need update() calls - it handles time automatically
    })
    
    // Game logic callback (10fps for efficiency)
    gameLoop.onGameLogic((deltaTime) => {
      if (!gameStore.isGameRunning) return

      // Calculate passive resource generation
      if (resourceStore.generationRate > 0) {
        resourceStore.calculatePassiveGeneration(deltaTime)
      }

      // Check for newly unlocked upgrades
      upgradeStore.checkUnlocks()

      // Emit game tick event for any listeners
      eventManager.emit('gameTick', {
        deltaTime,
        sessionDuration: timeManager.getSessionDuration(),
        resources: resourceStore.primary,
        generationRate: resourceStore.generationRate
      })
    })
  }

  const stop = () => {
    if (!isRunning.value) return
    
    // End time tracking
    timeManager.endSession()
    
    gameLoop.stop()
    isRunning.value = false
  }

  const restart = () => {
    stop()
    gameStore.reset()
    start()
  }

  // Manual save/load functions
  const saveGame = () => {
    gameStore.saveGame()
  }

  const loadGame = () => {
    return gameStore.loadGame()
  }

  // Auto-start game loop when component mounts
  onMounted(() => {
    start()
  })

  // Clean up when component unmounts
  onUnmounted(() => {
    stop()
  })

  return {
    isRunning: readonly(isRunning),
    fps: readonly(fps),
    start,
    stop,
    restart,
    saveGame,
    loadGame
  }
}

// Helper to make refs readonly
function readonly<T>(ref: Ref<T>) {
  return computed(() => ref.value)
}
