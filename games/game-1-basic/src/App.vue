<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-light via-primary to-secondary">
    <!-- Decorative background -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 pointer-events-none"></div>
    
    <GameHeader />
    
    <main class="relative z-10 p-6 lg:p-8 w-full flex justify-center">
      <!-- Centered Container -->
      <div class="w-full max-w-4xl space-y-8 lg:space-y-10 min-h-[calc(100vh-120px)]">
        <!-- Resources Panel -->
        <div class="w-full flex justify-center">
          <div class="w-full max-w-lg">
            <ResourceDisplay />
          </div>
        </div>
        
        <!-- Click Action Panel -->
        <div class="flex justify-center">
          <ClickButton />
        </div>
        
        <!-- Upgrades Panel -->
        <div class="w-full">
          <UpgradeList />
        </div>
      </div>
      
      <!-- Debug Panel (development only) -->
      <div v-if="showDebug" class="mt-8 bg-black/90 text-white p-6 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl">
        <h3 class="text-lg font-semibold text-yellow-400 mb-4">Debug Info</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 font-mono text-sm">
          <div>FPS: {{ gameLoop.fps.value }}</div>
          <div>Game Running: {{ gameLoop.isRunning.value }}</div>
          <div>Resources: {{ resourceStore.primary.toFixed(2) }}</div>
          <div>Generation Rate: {{ resourceStore.generationRate.toFixed(2) }}/sec</div>
          <div>Click Power: {{ resourceStore.clickPower.toFixed(2) }}</div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="gameLoop.saveGame()" class="bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl transition-colors">Save Game</button>
          <button @click="gameLoop.loadGame()" class="bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl transition-colors">Load Game</button>
          <button @click="gameLoop.restart()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-colors">Reset Game</button>
          <button @click="addTestResources" class="bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl transition-colors">+1000 Resources</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameHeader from './components/GameHeader.vue'
import ResourceDisplay from './components/ResourceDisplay.vue'
import ClickButton from './components/ClickButton.vue'
import UpgradeList from './components/UpgradeList.vue'
import { useGameLoop } from './composables/useGameLoop'
import { useResourceStore } from './stores/resources'

// Initialize game systems
const gameLoop = useGameLoop()
const resourceStore = useResourceStore()

// Debug mode (toggle with Shift+D)
const showDebug = ref(false)

// Debug functions
function addTestResources() {
  resourceStore.addResources(1000)
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (event.shiftKey && event.key === 'D') {
    showDebug.value = !showDebug.value
  }
}

// Setup keyboard listeners
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyDown)
}
</script>

<style>
/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid theme('colors.primary.DEFAULT');
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .debug-panel {
    display: none;
  }
}
</style>
