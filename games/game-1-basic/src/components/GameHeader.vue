<template>
  <header class="game-header">
    <a href="#main" class="skip-link">Skip to main content</a>
    
    <div class="header-content">
      <div class="header-brand">
        <div class="brand-icon">💰</div>
        <div class="brand-text">
          <h1 class="game-title">Coin Clicker</h1>
          <p class="game-subtitle">Idle Game Adventure</p>
        </div>
      </div>
      
      <nav class="header-nav" aria-label="Game navigation">
        <div class="nav-stats">
          <div class="stat-item">
            <span class="stat-label">Session Time</span>
            <span class="stat-value">{{ formatSessionTime(sessionTime) }}</span>
          </div>
          <div class="stat-separator">•</div>
          <div class="stat-item">
            <span class="stat-label">Save Status</span>
            <span class="stat-value" :class="saveStatusClass">{{ saveStatus }}</span>
          </div>
        </div>
      </nav>
      
      <div class="header-controls">
        <button 
          class="control-button" 
          @click="saveGame"
          :disabled="isSaving"
          title="Save Game"
          aria-label="Save game progress"
        >
          <span v-if="isSaving">⏳</span>
          <span v-else>💾</span>
          <span class="button-text">Save</span>
        </button>
        
        <button 
          class="control-button secondary" 
          @click="toggleSettings"
          title="Settings"
          aria-label="Open settings"
        >
          ⚙️
          <span class="button-text">Settings</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameLoop } from '@/composables/useGameLoop'

const gameLoop = useGameLoop()

// Session tracking
const sessionStartTime = ref(Date.now())
const sessionTime = ref(0)
const isSaving = ref(false)
const saveStatus = ref('Auto-saved')

// Update session time every second
let sessionInterval: number | null = null

onMounted(() => {
  sessionInterval = window.setInterval(() => {
    sessionTime.value = Date.now() - sessionStartTime.value
  }, 1000)
})

onUnmounted(() => {
  if (sessionInterval) {
    clearInterval(sessionInterval)
  }
})

// Format session time
function formatSessionTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Save status styling
const saveStatusClass = computed(() => ({
  'status-saved': saveStatus.value === 'Saved',
  'status-saving': saveStatus.value === 'Saving...',
  'status-auto': saveStatus.value === 'Auto-saved'
}))

// Game actions
async function saveGame() {
  if (isSaving.value) return
  
  isSaving.value = true
  saveStatus.value = 'Saving...'
  
  try {
    await gameLoop.saveGame()
    saveStatus.value = 'Saved'
    
    // Reset to auto-saved after 2 seconds
    setTimeout(() => {
      if (saveStatus.value === 'Saved') {
        saveStatus.value = 'Auto-saved'
      }
    }, 2000)
  } catch (error) {
    console.error('Save failed:', error)
    saveStatus.value = 'Error'
  } finally {
    isSaving.value = false
  }
}

function toggleSettings() {
  // TODO: Implement settings modal
  console.log('Settings not yet implemented')
}
</script>

<style scoped>
.game-header {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  z-index: 10;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 1rem; /* left-4 equivalent */
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem; /* px-4 py-2 equivalent */
  text-decoration: none;
  border-radius: 12px; /* rounded-xl equivalent */
  z-index: 1000;
  transition: top 0.1s ease-in-out;
}

.skip-link:focus {
  top: 0.5rem; /* top-2 equivalent */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem; /* gap-4 equivalent */
  padding: 0.5rem 1rem; /* px-4 py-2 equivalent */
  max-width: 1400px;
  margin: 0 auto;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 equivalent */
  text-decoration: none;
  color: inherit;
}

.brand-icon {
  font-size: 1.25rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
  animation: pulse 3s infinite;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* gap-1 equivalent */
}

.game-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
}

.game-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-stats {
  display: flex;
  align-items: center;
  gap: 1rem; /* gap-4 equivalent */
  background: rgba(255, 255, 255, 0.7);
  padding: 0.75rem 1.25rem; /* px-3 py-5 equivalent */
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem; /* gap-1 equivalent */
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.stat-separator {
  color: #9ca3af;
  font-weight: 700;
}

.status-saved {
  color: var(--color-success) !important;
}

.status-saving {
  color: var(--color-warning) !important;
}

.status-auto {
  color: #4b5563 !important;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 equivalent */
}

.control-button {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* gap-1 equivalent */
  padding: 0.5rem 1rem; /* px-4 py-2 equivalent */
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px; /* rounded-xl equivalent */
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  min-height: 32px;
}

.control-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.control-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.control-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.control-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.control-button.secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.button-text {
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 0.25rem 0.5rem; /* px-2 py-1 equivalent */
    gap: 0.25rem; /* gap-1 equivalent */
  }
  
  .header-brand {
    gap: 0.25rem; /* gap-1 equivalent */
  }
  
  .header-nav {
    display: none; /* Hide nav stats on mobile to save space */
  }
  
  .header-controls {
    gap: 0.25rem; /* gap-1 equivalent */
  }
  
  .control-button {
    padding: 0.25rem 0.5rem; /* px-2 py-1 equivalent */
    min-height: 28px;
  }
  
  .button-text {
    display: none;
  }
  
  .game-title {
    font-size: 0.875rem;
  }
  
  .game-subtitle {
    display: none;
  }
  
  .brand-icon {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .stat-item {
    gap: 0;
  }
  
  .nav-stats {
    flex-direction: column;
    gap: 0.5rem; /* gap-2 equivalent */
    padding: 0.5rem; /* p-2 equivalent */
  }
  
  .stat-separator {
    display: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .game-header {
    background: white;
    border-bottom: 2px solid black;
  }
  
  .nav-stats {
    background: white;
    border: 2px solid black;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .brand-icon {
    animation: none;
  }
  
  .control-button:hover {
    transform: none;
  }
}
</style>
