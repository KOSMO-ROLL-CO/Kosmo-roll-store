import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCouponDiscount,
  getCouponInfo,
  estimateShipping,
  formatCurrency,
  formatCEP,
  formatInstallment,
  resetCouponOverrides,
  saveCouponOverride,
} from '../../utils/commerce'

describe('commerce Utils', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCouponOverrides()
  })

  describe('getCouponDiscount', () => {
    it('returns discount rate for valid coupon codes', () => {
      expect(getCouponDiscount('KOSMO10')).toBe(0.1)
      expect(getCouponDiscount('  cosmo20 ')).toBe(0.2)
      expect(getCouponDiscount('COSMICO15')).toBe(0.15)
    })

    it('returns null for invalid coupon code', () => {
      expect(getCouponDiscount('INVALID100')).toBeNull()
    })

    it('respects coupon overrides from localStorage', () => {
      saveCouponOverride('KOSMO10', { active: false })
      expect(getCouponDiscount('KOSMO10')).toBeNull()

      saveCouponOverride('COSMICO15', { discount: 0.3, active: true })
      expect(getCouponDiscount('COSMICO15')).toBe(0.3)
    })
  })

  describe('getCouponInfo', () => {
    it('returns detailed coupon information', () => {
      const info = getCouponInfo('KOSMO10')
      expect(info).not.toBeNull()
      expect(info?.title).toBe('10% na primeira compra')
      expect(info?.rules.length).toBeGreaterThan(0)
    })

    it('returns null for unknown coupon', () => {
      expect(getCouponInfo('UNKNOWN')).toBeNull()
    })
  })

  describe('estimateShipping', () => {
    it('returns shipping price and delivery days based on CEP first digit', () => {
      // SP capital CEP starting with 0
      const sp = estimateShipping('01310-100')
      expect(sp.price).toBe(19.9)
      expect(sp.days).toBe(2)

      // RJ CEP starting with 2
      const rj = estimateShipping('20000-000')
      expect(rj.price).toBe(24.9)
      expect(rj.days).toBe(4)
    })

    it('returns 0 price and 0 days for incomplete CEP', () => {
      expect(estimateShipping('123')).toEqual({ price: 0, days: 0 })
    })
  })

  describe('Formatting Utils', () => {
    it('formats currency in BRL', () => {
      expect(formatCurrency(199.9)).toBe('R$ 199,90')
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('formats CEP string with hyphen', () => {
      expect(formatCEP('01310100')).toBe('01310-100')
      expect(formatCEP('01310-100')).toBe('01310-100')
    })

    it('formats installment calculation', () => {
      expect(formatInstallment(120, 12)).toBe('12x de R$ 10,00')
    })
  })
})
