/**
 * FormatUtils - Number and text formatting utilities
 */
export class FormatUtils {
  private static readonly NUMBER_SUFFIXES = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'
  ]

  private static readonly SCIENTIFIC_SUFFIXES = [
    '', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'
  ]

  /**
   * Format number with appropriate suffix (1234 -> 1.23K)
   */
  static formatNumber(num: number, style: 'short' | 'scientific' | 'full' = 'short'): string {
    if (isNaN(num) || num === 0) return '0'
    
    if (style === 'full') {
      return num.toLocaleString()
    }

    const suffixes = style === 'scientific' ? this.SCIENTIFIC_SUFFIXES : this.NUMBER_SUFFIXES
    const tier = Math.log10(Math.abs(num)) / 3 | 0
    
    if (tier < 1) {
      // Numbers less than 1000
      if (num < 10) return num.toFixed(1)
      if (num < 100) return num.toFixed(0)
      return num.toLocaleString()
    }
    
    if (tier >= suffixes.length) {
      // Very large numbers - use scientific notation
      return num.toExponential(2)
    }

    const scale = Math.pow(10, tier * 3)
    const scaled = num / scale
    const suffix = suffixes[tier]

    if (scaled < 10) {
      return scaled.toFixed(2) + suffix
    } else if (scaled < 100) {
      return scaled.toFixed(1) + suffix
    } else {
      return scaled.toFixed(0) + suffix
    }
  }

  /**
   * Format number as currency ($1,234.56)
   */
  static formatCurrency(num: number, symbol = '$', decimals = 2): string {
    return symbol + num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  /**
   * Format percentage (0.15 -> 15%)
   */
  static formatPercentage(decimal: number, decimals = 1): string {
    return (decimal * 100).toFixed(decimals) + '%'
  }

  /**
   * Format time duration in a human-readable way
   */
  static formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Format rate (per second/minute/hour)
   */
  static formatRate(amount: number, timeUnit: 'second' | 'minute' | 'hour' = 'second'): string {
    const formattedAmount = this.formatNumber(amount)
    const unitAbbrev = timeUnit === 'second' ? '/s' : timeUnit === 'minute' ? '/m' : '/h'
    return formattedAmount + unitAbbrev
  }

  /**
   * Parse formatted number back to actual value
   */
  static parseNumber(formatted: string): number {
    const cleaned = formatted.replace(/[,\s$%]/g, '')
    
    // Check for suffix
    const lastChar = cleaned.slice(-1).toLowerCase()
    const suffixes = this.NUMBER_SUFFIXES.map(s => s.toLowerCase())
    const suffixIndex = suffixes.indexOf(lastChar)
    
    if (suffixIndex > 0) {
      const numberPart = parseFloat(cleaned.slice(0, -1))
      return numberPart * Math.pow(1000, suffixIndex)
    }
    
    return parseFloat(cleaned) || 0
  }

  /**
   * Pluralize a word based on count
   */
  static pluralize(word: string, count: number, pluralForm?: string): string {
    if (count === 1) return word
    return pluralForm || word + 's'
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  /**
   * Format upgrade effect description
   */
  static formatUpgradeEffect(type: 'multiply' | 'add', value: number): string {
    if (type === 'multiply') {
      return `${value}x multiplier`
    } else {
      return `+${this.formatNumber(value)} per second`
    }
  }

  /**
   * Format countdown timer
   */
  static formatCountdown(targetTime: number): string {
    const now = Date.now()
    const remaining = Math.max(0, targetTime - now)
    
    if (remaining === 0) return 'Ready!'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }
}
