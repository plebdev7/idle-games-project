<template>
  <div class="resource-display">
    <div class="resource-header">
      <h2 class="resource-title">Resources</h2>
    </div>
    
    <div class="resource-main">
      <div class="primary-resource">
        <div class="resource-icon">💰</div>
        <div class="resource-value">
          {{ resourceStore.formattedPrimary }}
        </div>
        <div class="resource-label">Coins</div>
      </div>
    </div>
    
    <div class="resource-stats">
      <div class="stat-item">
        <div class="stat-label">Per Second</div>
        <div class="stat-value">{{ resourceStore.formattedGenerationRate }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Per Click</div>
        <div class="stat-value">{{ resourceStore.formattedClickPower }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Total Earned</div>
        <div class="stat-value">{{ formatNumber(resourceStore.totalEarned) }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Total Clicks</div>
        <div class="stat-value">{{ resourceStore.lifetimeClicks.toLocaleString() }}</div>
      </div>
    </div>
    
    <!-- Progress indicator for next milestone -->
    <div v-if="nextMilestone" class="milestone-progress">
      <div class="milestone-label">
        Next Goal: {{ formatNumber(nextMilestone.target) }} coins
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: milestoneProgress + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        {{ milestoneProgress.toFixed(1) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResourceStore } from '@/stores/resources'
import { formatNumber } from '@/utils/formatters'

const resourceStore = useResourceStore()

// Milestone targets for progress tracking
const MILESTONES = [
  { target: 100, label: 'First Hundred' },
  { target: 500, label: 'Getting Started' },
  { target: 1000, label: 'First Thousand' },
  { target: 5000, label: 'Building Up' },
  { target: 10000, label: 'Ten Thousand' },
  { target: 50000, label: 'Fifty Thousand' },
  { target: 100000, label: 'One Hundred Thousand' },
  { target: 500000, label: 'Half Million' },
  { target: 1000000, label: 'Millionaire' },
  { target: 10000000, label: 'Ten Million' },
  { target: 100000000, label: 'Hundred Million' },
  { target: 1000000000, label: 'Billionaire' }
]

// Find next milestone
const nextMilestone = computed(() => {
  const current = resourceStore.primary
  return MILESTONES.find(milestone => milestone.target > current)
})

// Calculate progress to next milestone
const milestoneProgress = computed(() => {
  if (!nextMilestone.value) return 100
  
  const current = resourceStore.primary
  const target = nextMilestone.value.target
  
  // Find previous milestone
  const currentMilestoneIndex = MILESTONES.indexOf(nextMilestone.value)
  const previousTarget = currentMilestoneIndex > 0 ? MILESTONES[currentMilestoneIndex - 1]?.target || 0 : 0
  
  const progress = ((current - previousTarget) / (target - previousTarget)) * 100
  return Math.max(0, Math.min(100, progress))
})

// formatNumber is now imported from shared utilities
</script>

<style scoped>
.resource-display {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.15s ease-in-out;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  opacity: 0.7;
}

/* Removed container hover to prevent double hover with stat items */

.resource-header {
  text-align: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.resource-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
}

.resource-main {
  text-align: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.primary-resource {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff, rgba(255, 215, 0, 0.05));
  border-radius: 0.75rem;
  border: 2px solid #ffd700;
  box-shadow: 
    0 4px 8px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.primary-resource::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.resource-icon {
  font-size: 1.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.15));
  z-index: 1;
  position: relative;
}

.resource-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  color: #111827;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  font-family: var(--font-family-mono);
  z-index: 1;
  position: relative;
  letter-spacing: -0.02em;
}

.resource-label {
  font-size: 1rem;
  color: #4b5563;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
  position: relative;
}

.resource-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  flex: 1;
  align-content: start;
}

.stat-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 0.75rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: all 0.15s ease-in-out;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.stat-item:hover::before {
  opacity: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  position: relative;
  z-index: 1;
}

.milestone-progress {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: auto;
}

.milestone-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-success), var(--color-primary));
}

.milestone-label {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), #20c997, var(--color-primary));
  transition: width 0.6s ease;
  border-radius: 9999px;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 0.75rem;
  color: #4b5563;
  text-align: center;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  position: relative;
  z-index: 1;
}

/* Mobile optimizations - Ultra compact */
@media (max-width: 768px) {
  .resource-display {
    padding: 0.5rem;
    height: auto;
  }
  
  .resource-header {
    margin-bottom: 0.25rem;
  }
  
  .resource-title {
    font-size: 0.875rem;
  }
  
  .resource-main {
    margin-bottom: 0.25rem;
  }
  
  .primary-resource {
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  .resource-value {
    font-size: 1.125rem;
  }
  
  .resource-icon {
    font-size: 1.125rem;
  }
  
  .resource-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    margin-bottom: 0.25rem;
  }
  
  .stat-item {
    padding: 2px;
  }
  
  .stat-label {
    font-size: 0.5rem;
    margin-bottom: 1px;
  }
  
  .stat-value {
    font-size: 0.6rem;
  }
  
  .milestone-progress {
    padding: var(--spacing-1);
  }
  
  .milestone-label {
    font-size: 0.6rem;
    margin-bottom: 2px;
  }
  
  .progress-text {
    font-size: 0.5rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .resource-display,
  .stat-item,
  .milestone-progress {
    background: white;
    border: 2px solid black;
    backdrop-filter: none;
  }
  
  .primary-resource {
    border: 2px solid black;
    background: #ffff00;
  }
  
  .resource-value,
  .stat-value {
    color: black;
    text-shadow: none;
  }
  
  .progress-fill {
    background: black;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .resource-display,
  .stat-item,
  .progress-fill {
    transition: none;
    animation: none;
  }
  
  .stat-item:hover {
    transform: none;
  }
  
  .primary-resource::before,
  .progress-fill::after {
    animation: none;
  }
}
</style>
