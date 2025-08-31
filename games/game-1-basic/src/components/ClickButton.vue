<template>
  <div class="click-button-container">
    <button
      class="click-button"
      @click="handleClick"
      @mousedown="startClickAnimation"
      @mouseup="endClickAnimation"
      @mouseleave="endClickAnimation"
      @touchstart="startClickAnimation"
      @touchend="endClickAnimation"
      :class="{ 'clicking': isClicking }"
    >
      <div class="click-button-inner">
        <div class="click-button-icon">
          🪙
        </div>
        <div class="click-button-text">
          Click for {{ resourceStore.formattedClickPower }}
        </div>
      </div>
      
      <!-- Click effect animation -->
      <div 
        v-if="showClickEffect"
        class="click-effect"
        :key="clickEffectKey"
      >
        +{{ resourceStore.formattedClickPower }}
      </div>
    </button>
    
    <div class="click-stats">
      <div class="total-clicks">
        Total Clicks: {{ resourceStore.lifetimeClicks.toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResourceStore } from '@/stores/resources'

const resourceStore = useResourceStore()

// Animation states
const isClicking = ref(false)
const showClickEffect = ref(false)
const clickEffectKey = ref(0)

function handleClick() {
  // Handle the click action
  resourceStore.handleClick()
  
  // Trigger click effect animation
  showClickEffect.value = true
  clickEffectKey.value++
  
  // Hide effect after animation
  setTimeout(() => {
    showClickEffect.value = false
  }, 600)
}

function startClickAnimation() {
  isClicking.value = true
}

function endClickAnimation() {
  isClicking.value = false
}
</script>

<style scoped>
.click-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  height: 100%;
}

.click-button {
  position: relative;
  width: clamp(120px, 15vw, 200px);
  height: clamp(120px, 15vw, 200px);
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #ffed4e);
  box-shadow: 
    0 8px 16px rgba(255, 215, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  transform: translateY(0);
  overflow: hidden;
}

.click-button:hover {
  background: linear-gradient(145deg, #ffed4e, #ffd700);
  box-shadow: 
    0 10px 20px rgba(255, 215, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.click-button.clicking {
  transform: translateY(4px) scale(0.95);
  box-shadow: 
    0 4px 8px rgba(255, 215, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

.click-button:active {
  transform: translateY(4px) scale(0.95);
}

.click-button-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.5rem;
}

.click-button-icon {
  font-size: clamp(1.5rem, 4vw, 3rem);
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.click-button-text {
  font-size: clamp(0.6rem, 1.5vw, 0.9rem);
  font-weight: 600;
  color: #8b4513;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
  text-align: center;
  line-height: 1.2;
}

.click-effect {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  animation: clickEffect 0.6s ease-out forwards;
}

@keyframes clickEffect {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-40px) scale(1.2);
  }
}

.click-stats {
  text-align: center;
  color: #666;
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
}

.total-clicks {
  font-weight: 500;
}

/* Large screens optimization */
@media (min-width: 1440px) {
  .click-button-container {
    padding: 2rem;
    gap: 1rem;
  }
  
  .click-button {
    width: 220px;
    height: 220px;
  }
  
  .click-button-icon {
    font-size: 3.5rem;
  }
  
  .click-button-text {
    font-size: 1rem;
  }
}

/* Mobile optimizations - Ultra compact */
@media (max-width: 768px) {
  .click-button-container {
    padding: 0.5rem;
    gap: 0.25rem;
    height: auto;
  }
  
  .click-button {
    width: 100px;
    height: 100px;
  }
  
  .click-button-icon {
    font-size: 1.8rem;
  }
  
  .click-button-text {
    font-size: 0.65rem;
  }
  
  .click-stats {
    font-size: 0.65rem;
  }
  
  .total-clicks {
    margin-top: 0.25rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .click-button {
    background: #ffff00;
    border: 2px solid #000;
  }
  
  .click-button-text {
    color: #000;
    text-shadow: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .click-button,
  .click-effect {
    transition: none;
    animation: none;
  }
  
  .click-button:hover,
  .click-button.clicking {
    transform: none;
  }
}
</style>
