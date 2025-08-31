/**
 * Tests for formatting utilities
 */
import { describe, it, expect } from 'vitest'
import { formatNumber, formatCurrency, formatRate, formatMultiplier } from '@/utils/formatters'

describe('formatNumber', () => {
  describe('Edge Cases', () => {
    it('should handle NaN values gracefully', () => {
      expect(formatNumber(NaN)).toBe('0')
    })

    it('should handle undefined values gracefully', () => {
      expect(formatNumber(undefined)).toBe('0')
    })

    it('should handle null values gracefully', () => {
      expect(formatNumber(null)).toBe('0')
    })

    it('should handle negative infinity', () => {
      expect(formatNumber(-Infinity)).toBe('0')
    })

    it('should handle positive infinity', () => {
      expect(formatNumber(Infinity)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-100)).toBe('0')
    })
  })

  describe('Normal Cases', () => {
    it('should format numbers under 1000 as integers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(1)).toBe('1')
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(999.9)).toBe('999')
    })

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.00K')
      expect(formatNumber(1500)).toBe('1.50K')
      expect(formatNumber(999000)).toBe('999.00K')
    })

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.00M')
      expect(formatNumber(1500000)).toBe('1.50M')
      expect(formatNumber(999000000)).toBe('999.00M')
    })

    it('should format billions with B suffix', () => {
      expect(formatNumber(1000000000)).toBe('1.00B')
      expect(formatNumber(1500000000)).toBe('1.50B')
    })

    it('should handle very large numbers with scientific notation', () => {
      const veryLarge = 1e30
      const result = formatNumber(veryLarge)
      expect(result).toMatch(/\d\.\d{2}e\+\d+/)
    })
  })

  describe('Precision', () => {
    it('should round to 2 decimal places for abbreviated numbers', () => {
      expect(formatNumber(1234)).toBe('1.23K')
      expect(formatNumber(1235)).toBe('1.24K') // Should round up
      expect(formatNumber(1999)).toBe('2.00K') // Should round up
    })
  })
})

describe('formatCurrency', () => {
  it('should add " coins" suffix to formatted number', () => {
    expect(formatCurrency(100)).toBe('100 coins')
    expect(formatCurrency(1500)).toBe('1.50K coins')
    expect(formatCurrency(NaN)).toBe('0 coins')
    expect(formatCurrency(undefined)).toBe('0 coins')
  })
})

describe('formatRate', () => {
  it('should add "/sec" suffix to formatted number', () => {
    expect(formatRate(5)).toBe('5/sec')
    expect(formatRate(1000)).toBe('1.00K/sec')
    expect(formatRate(NaN)).toBe('0/sec')
    expect(formatRate(undefined)).toBe('0/sec')
  })
})

describe('formatMultiplier', () => {
  it('should add custom unit suffix to formatted number', () => {
    expect(formatMultiplier(2, 'per click')).toBe('2 per click')
    expect(formatMultiplier(1500, 'multiplier')).toBe('1.50K multiplier')
    expect(formatMultiplier(NaN, 'per click')).toBe('0 per click')
    expect(formatMultiplier(undefined, 'per click')).toBe('0 per click')
  })
})

describe('Integration with Game Scenarios', () => {
  it('should handle automation upgrade scenarios', () => {
    // Simulate scenarios that might cause NaN in automation upgrades
    const scenarios = [
      { input: 0, expected: '0' },
      { input: 50, expected: '50' }, // Auto clicker base cost
      { input: 57.5, expected: '57' }, // Auto clicker level 1 cost (50 * 1.15)
      { input: 1000000, expected: '1.00M' },
      { input: NaN, expected: '0' }, // The bug scenario
    ]

    scenarios.forEach(({ input, expected }) => {
      expect(formatNumber(input)).toBe(expected)
    })
  })

  it('should handle resource display edge cases', () => {
    // Test cases that might occur in resource calculations
    expect(formatNumber(0 / 0)).toBe('0') // NaN from division
    expect(formatNumber(Math.sqrt(-1))).toBe('0') // NaN from invalid math
    expect(formatNumber(parseFloat('invalid'))).toBe('0') // NaN from parsing
  })
})
