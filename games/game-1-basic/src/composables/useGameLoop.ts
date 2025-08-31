/**
 * Game Loop Composable - Foundation setup
 * Basic integration with shared game engine
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { GameLoop } from '@idle-games/game-engine'

export function useGameLoop() {
  const gameLoop = new GameLoop()
  const isRunning = ref(false)
  const fps = ref(0)

  // Foundation setup - basic game loop integration
  const start = () => {
    if (isRunning.value) return
    
    gameLoop.start()
    isRunning.value = true
    
    // Basic UI update callback - implementation details for Phase 2
    gameLoop.onUIUpdate((deltaTime) => {
      // Update FPS counter for development
      fps.value = Math.round(1000 / (deltaTime || 16))
    })
    
    // Basic game logic callback - implementation details for Phase 2
    gameLoop.onGameLogic(() => {
      // Game logic updates will be implemented in Phase 2
    })
  }

  const stop = () => {
    if (!isRunning.value) return
    
    gameLoop.stop()
    isRunning.value = false
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
    stop
  }
}

import { computed, type Ref } from 'vue'

// Helper to make refs readonly
function readonly<T>(ref: Ref<T>) {
  return computed(() => ref.value)
}
