/**
 * MathUtils - Mathematical functions for idle game calculations
 */
export class MathUtils {
  /**
   * Calculate exponential cost scaling (1.15^level)
   */
  static calculateExponentialCost(baseCost: number, level: number, multiplier = 1.15): number {
    return Math.floor(baseCost * Math.pow(multiplier, level))
  }

  /**
   * Calculate linear cost scaling
   */
  static calculateLinearCost(baseCost: number, level: number, increment: number): number {
    return baseCost + (level * increment)
  }

  /**
   * Calculate compound effect (multiplicative upgrades)
   */
  static calculateCompoundEffect(baseValue: number, upgradeCount: number, multiplier: number): number {
    return baseValue * Math.pow(multiplier, upgradeCount)
  }

  /**
   * Calculate additive effect (flat bonus upgrades)
   */
  static calculateAdditiveEffect(baseValue: number, upgradeCount: number, bonus: number): number {
    return baseValue + (upgradeCount * bonus)
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + factor * (end - start)
  }

  /**
   * Calculate percentage progress
   */
  static calculateProgress(current: number, target: number): number {
    if (target === 0) return 0
    return Math.min(100, (current / target) * 100)
  }

  /**
   * Calculate time to reach target with given rate
   */
  static calculateTimeToTarget(current: number, target: number, rate: number): number {
    if (rate <= 0 || current >= target) return 0
    return (target - current) / rate
  }

  /**
   * Generate random number between min and max (inclusive)
   */
  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Check if a random chance succeeds (0-1 probability)
   */
  static randomChance(probability: number): boolean {
    return Math.random() < probability
  }

  /**
   * Calculate factorial (useful for complex upgrade formulas)
   */
  static factorial(n: number): number {
    if (n <= 1) return 1
    return n * this.factorial(n - 1)
  }

  /**
   * Calculate nth root
   */
  static nthRoot(value: number, n: number): number {
    return Math.pow(value, 1 / n)
  }

  /**
   * Calculate geometric sum (useful for total upgrade costs)
   */
  static geometricSum(firstTerm: number, ratio: number, terms: number): number {
    if (ratio === 1) return firstTerm * terms
    return firstTerm * (Math.pow(ratio, terms) - 1) / (ratio - 1)
  }
}
