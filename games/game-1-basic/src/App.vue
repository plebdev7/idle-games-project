<template>
  <div id="app" class="app-container">
    <GameHeader />
    <GameLayout />
  </div>
</template>

<script setup lang="ts">
import GameHeader from '@/components/GameHeader.vue'
import GameLayout from '@/components/GameLayout.vue'
import { useGameStore } from '@/stores/game'
import { onMounted, onUnmounted } from 'vue'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.startGameSession()
})

onUnmounted(() => {
  gameStore.pauseGame()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
