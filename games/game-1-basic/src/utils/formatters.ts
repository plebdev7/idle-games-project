/**
 * Shared formatting utilities
 */

/**
 * Format numbers for display with proper error handling
 */
export function formatNumber(value: number | undefined | null): string {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return '0'
  }
  
  // Handle NaN and invalid numbers
  if (isNaN(value) || !isFinite(value)) {
    console.warn('🔍 [DEBUG] formatNumber: NaN/infinite detected', { value })
    return '0'
  }
  
  // Handle negative numbers (should not display negatives in idle games)
  if (value < 0) {
    return '0'
  }
  
  // Handle small numbers
  if (value < 1000) {
    return Math.floor(value).toString()
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'S', 'Sp']
  const magnitude = Math.floor(Math.log10(value) / 3)
  const scaledValue = value / Math.pow(1000, magnitude)
  
  // Handle very large numbers
  if (magnitude >= suffixes.length) {
    return value.toExponential(2)
  }
  
  return scaledValue.toFixed(2) + suffixes[magnitude]
}

/**
 * Format currency specifically (adds coin symbol/text)
 */
export function formatCurrency(value: number | undefined | null): string {
  return formatNumber(value) + ' coins'
}

/**
 * Format rate (per second)
 */
export function formatRate(value: number | undefined | null): string {
  return formatNumber(value) + '/sec'
}

/**
 * Format multiplier (for click power, etc.)
 */
export function formatMultiplier(value: number | undefined | null, unit: string): string {
  return formatNumber(value) + ' ' + unit
}
