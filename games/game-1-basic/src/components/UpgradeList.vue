<template>
  <div class="bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-sm rounded-xl border border-gray-200/60 !p-8 h-full shadow-lg">
    <!-- Enhanced Header -->
    <div class="flex items-center justify-between !pb-6 !mb-8 border-b border-gray-200/60">
      <h2 class="text-xl font-bold text-gray-900 tracking-tight">Upgrades</h2>
      <span class="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 !px-6 !py-3 rounded-full text-sm font-medium border border-blue-200/50 shadow-sm">
        {{ unlockedUpgrades.length }} available
      </span>
    </div>
    
    <!-- Categories Container -->
    <div class="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="border-b border-gray-100/60 pb-6 last:border-b-0"
      >
        <h3 class="text-lg font-bold text-gray-800 !mb-6 flex items-center !gap-4 !px-2">
          <span class="text-xl">{{ category.icon }}</span>
          <span class="tracking-tight">{{ category.name }}</span>
        </h3>
        
        <!-- Responsive Upgrade Grid - Enhanced Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 !gap-6">
          <div
            v-for="upgrade in getCategoryUpgrades(category.id)"
            :key="upgrade.id"
            class="rounded-xl !p-6 flex flex-col shadow-md backdrop-blur-sm border transition-all duration-300"
            :class="{
              'bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-emerald-100/70 border-emerald-300/60 shadow-emerald-200/50': canAfford(upgrade.id) && isUnlocked(upgrade.id) && !isMaxLevel(upgrade.id),
              'bg-gradient-to-br from-gray-50/60 to-gray-100/40 border-gray-300/50 opacity-60 grayscale': !isUnlocked(upgrade.id),
              'bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/70 border-amber-300/60 shadow-amber-200/50': isMaxLevel(upgrade.id),
              'bg-gradient-to-br from-white/90 via-gray-50/60 to-white/80 border-gray-300/50 shadow-gray-200/50': !canAfford(upgrade.id) && isUnlocked(upgrade.id) && !isMaxLevel(upgrade.id)
            }"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between !mb-5">
              <div class="flex-1 min-w-0 !pr-3">
                <h4 class="font-semibold text-gray-900 text-base truncate leading-tight !mb-3">{{ upgrade.name }}</h4>
                <div class="text-sm text-gray-600 leading-relaxed">{{ getEffectText(upgrade) }}</div>
              </div>
              <span class="bg-gradient-to-r from-slate-100 to-slate-200 !px-4 !py-2.5 rounded-full text-xs font-bold text-slate-700 border border-slate-300/50 shadow-sm !ml-4 flex-shrink-0">
                Lv {{ getUpgradeLevel(upgrade.id) }}<span v-if="upgrade.maxLevel">/{{ upgrade.maxLevel }}</span>
              </span>
            </div>
            
            <!-- Cost -->
            <div class="bg-gradient-to-r from-amber-50/80 to-yellow-50/60 !px-5 !py-4 rounded-xl border border-amber-200/60 text-base font-bold text-amber-900 font-mono flex items-center !gap-3 shadow-sm !mb-5 backdrop-blur-sm">
              <span class="text-base">💰</span>
              {{ formatNumber(getUpgradeCost(upgrade.id)) }}
            </div>
            
            <!-- Enhanced Button -->
            <button
              @click="purchaseUpgrade(upgrade.id)"
              :disabled="!canPurchase(upgrade.id)"
              class="w-full !px-5 !py-4 text-base font-bold rounded-xl border-2 mt-auto transition-all duration-300 shadow-lg"
              :class="{
                'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-emerald-400 hover:border-emerald-500 hover:shadow-emerald-300/50 hover:-translate-y-0.5': canAfford(upgrade.id) && isUnlocked(upgrade.id) && !isMaxLevel(upgrade.id),
                'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed border-gray-300': !isUnlocked(upgrade.id),
                'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-800 cursor-default border-amber-400 shadow-amber-200/50': isMaxLevel(upgrade.id),
                'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 cursor-not-allowed border-gray-300': !canAfford(upgrade.id) && isUnlocked(upgrade.id) && !isMaxLevel(upgrade.id)
              }"
            >
              <span v-if="!isUnlocked(upgrade.id)">Locked</span>
              <span v-else-if="isMaxLevel(upgrade.id)">Max</span>
              <span v-else-if="canAfford(upgrade.id)">Buy</span>
              <span v-else>---</span>
            </button>
            
            <!-- Enhanced Unlock requirement -->
            <div v-if="!isUnlocked(upgrade.id) && upgrade.unlockRequirement" class="!mt-5 bg-gradient-to-r from-orange-50/80 to-red-50/60 border border-orange-200/60 rounded-xl !p-5 backdrop-blur-sm shadow-sm">
              <div class="text-sm text-orange-700 font-medium">
                <span class="font-bold">🔒 Requires:</span> {{ getRequirementText(upgrade.unlockRequirement) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResourceStore } from '@/stores/resources'
import { useUpgradeStore, UPGRADE_DEFINITIONS } from '@/stores/upgrades'
import type { UpgradeDefinition } from '@/types/game'
import { formatNumber } from '@/utils/formatters'

const resourceStore = useResourceStore()
const upgradeStore = useUpgradeStore()

// Categories for organizing upgrades
const categories = [
  { id: 'clicking', name: 'Click Upgrades', icon: '👆' },
  { id: 'generators', name: 'Generators', icon: '⚡' },
  { id: 'multipliers', name: 'Multipliers', icon: '💎' }
]

// Get unlocked upgrades
const unlockedUpgrades = computed(() => {
  return upgradeStore.unlockedUpgrades
})

// Get upgrades by category
function getCategoryUpgrades(category: string): UpgradeDefinition[] {
  return Object.values(UPGRADE_DEFINITIONS).filter(upgrade => 
    upgrade.category === category && upgradeStore.unlocked[upgrade.id]
  )
}

// Check if upgrade is unlocked
function isUnlocked(upgradeId: string): boolean {
  return upgradeStore.unlocked[upgradeId] === true
}

// Check if player can afford upgrade
function canAfford(upgradeId: string): boolean {
  return upgradeStore.canAffordUpgrade(upgradeId)
}

// Check if player can purchase upgrade
function canPurchase(upgradeId: string): boolean {
  return isUnlocked(upgradeId) && canAfford(upgradeId) && !isMaxLevel(upgradeId)
}

// Check if upgrade is at max level
function isMaxLevel(upgradeId: string): boolean {
  const upgrade = UPGRADE_DEFINITIONS[upgradeId]
  if (!upgrade || !upgrade.maxLevel) return false
  return upgradeStore.getUpgradeLevel(upgradeId) >= upgrade.maxLevel
}

// Get upgrade level
function getUpgradeLevel(upgradeId: string): number {
  return upgradeStore.getUpgradeLevel(upgradeId)
}

// Get upgrade cost
function getUpgradeCost(upgradeId: string): number {
  return upgradeStore.getUpgradeCost(upgradeId)
}

// Purchase upgrade
function purchaseUpgrade(upgradeId: string) {
  if (canPurchase(upgradeId)) {
    const success = upgradeStore.purchaseUpgrade(upgradeId)
    if (success) {
      console.log(`Purchased upgrade: ${UPGRADE_DEFINITIONS[upgradeId]?.name || upgradeId}`)
    }
  }
}

// Get effect description text
function getEffectText(upgrade: UpgradeDefinition): string {
  switch (upgrade.effect.type) {
    case 'add_click':
      return `+${upgrade.effect.value} click power`
    case 'multiply_click':
      return `×${upgrade.effect.value} click power`
    case 'add_generation':
      return `+${upgrade.effect.value}/sec generation`
    case 'multiply_generation':
      return `×${upgrade.effect.value} generation rate`
    default:
      return 'Unknown effect'
  }
}

// Get unlock requirement text
function getRequirementText(requirement: any): string {
  switch (requirement.type) {
    case 'resource_amount':
      return `${formatNumber(requirement.value)} ${requirement.target} resources`
    case 'upgrade_level':
      const targetUpgrade = UPGRADE_DEFINITIONS[requirement.target]
      return `${targetUpgrade?.name || requirement.target} level ${requirement.value}`
    case 'total_earned':
      return `${formatNumber(requirement.value)} total earned`
    default:
      return 'Unknown requirement'
  }
}

// formatNumber is now imported from shared utilities
</script>


