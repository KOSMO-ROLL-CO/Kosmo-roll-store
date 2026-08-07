import { describe, it, expect } from 'vitest'
import {
  detectCardBrand,
  luhnCheck,
  formatCardNumber,
  formatExpiry,
  isValidExpiry,
  isValidCVV,
  isValidCardName,
  validateCard,
  getBrandIcon,
} from '../../utils/cardValidation'

describe('cardValidation Utils', () => {
  describe('detectCardBrand', () => {
    it('detects Visa card brand', () => {
      expect(detectCardBrand('4111 2222 3333 4444')).toBe('visa')
    })

    it('detects Mastercard card brand', () => {
      expect(detectCardBrand('5100 0000 0000 0000')).toBe('mastercard')
      expect(detectCardBrand('2221 0000 0000 0000')).toBe('mastercard')
    })

    it('detects Elo card brand', () => {
      expect(detectCardBrand('5067 1234 5678 9012')).toBe('elo')
      expect(detectCardBrand('6362 0000 0000 0000')).toBe('elo')
    })

    it('detects Amex card brand', () => {
      expect(detectCardBrand('3400 000000 00000')).toBe('amex')
      expect(detectCardBrand('3700 000000 00000')).toBe('amex')
    })

    it('detects Discover card brand', () => {
      expect(detectCardBrand('6011 0000 0000 0000')).toBe('discover')
    })

    it('detects Diners card brand', () => {
      expect(detectCardBrand('3000 0000 0000 00')).toBe('diners')
    })

    it('returns unknown for unrecognized cards', () => {
      expect(detectCardBrand('9999 0000 0000 0000')).toBe('unknown')
    })
  })

  describe('luhnCheck', () => {
    it('validates a correct Luhn card number', () => {
      // 4532 0151 1283 0366 is a valid Luhn test number
      expect(luhnCheck('4532 0151 1283 0366')).toBe(true)
    })

    it('rejects an invalid Luhn card number', () => {
      expect(luhnCheck('4532 0151 1283 0367')).toBe(false)
    })

    it('rejects numbers under 13 digits', () => {
      expect(luhnCheck('123456789012')).toBe(false)
    })
  })

  describe('formatCardNumber', () => {
    it('formats 16-digit cards into 4-4-4-4 groups', () => {
      expect(formatCardNumber('4111222233334444')).toBe('4111 2222 3333 4444')
    })

    it('formats Amex cards into 4-6-5 groups', () => {
      expect(formatCardNumber('340012345678901')).toBe('3400 123456 78901')
    })
  })

  describe('formatExpiry', () => {
    it('adds leading zero if month starts with > 1', () => {
      expect(formatExpiry('5')).toBe('05/')
    })

    it('formats valid month and year', () => {
      expect(formatExpiry('1228')).toBe('12/28')
    })

    it('caps month at 12', () => {
      expect(formatExpiry('9928')).toBe('12/28')
    })
  })

  describe('isValidExpiry', () => {
    it('returns false for past dates', () => {
      expect(isValidExpiry('01/20')).toBe(false)
    })

    it('returns true for future dates', () => {
      const futureYear = (new Date().getFullYear() + 2).toString().slice(2)
      expect(isValidExpiry(`12/${futureYear}`)).toBe(true)
    })

    it('returns false for invalid months', () => {
      expect(isValidExpiry('00/28')).toBe(false)
      expect(isValidExpiry('13/28')).toBe(false)
    })
  })

  describe('isValidCVV', () => {
    it('requires 3 digits for Visa/Mastercard/Elo/etc', () => {
      expect(isValidCVV('123', 'visa')).toBe(true)
      expect(isValidCVV('12', 'visa')).toBe(false)
    })

    it('requires 4 digits for Amex', () => {
      expect(isValidCVV('1234', 'amex')).toBe(true)
      expect(isValidCVV('123', 'amex')).toBe(false)
    })
  })

  describe('isValidCardName', () => {
    it('requires at least 2 words with 2+ characters each', () => {
      expect(isValidCardName('John Doe')).toBe(true)
      expect(isValidCardName('John')).toBe(false)
      expect(isValidCardName('J D')).toBe(false)
    })
  })

  describe('validateCard & getBrandIcon', () => {
    it('validates a complete card object', () => {
      const futureYear = (new Date().getFullYear() + 2).toString().slice(2)
      const res = validateCard(
        '4532 0151 1283 0366',
        'Kosmo User',
        `12/${futureYear}`,
        '123'
      )
      expect(res.brand).toBe('visa')
      expect(res.isValid).toBe(true)
    })

    it('returns emoji icon per brand', () => {
      expect(getBrandIcon('visa')).toBe('💳')
      expect(getBrandIcon('mastercard')).toBe('🔴')
      expect(getBrandIcon('elo')).toBe('🔵')
      expect(getBrandIcon('amex')).toBe('💙')
    })
  })
})
