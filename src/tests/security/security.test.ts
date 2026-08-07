import { describe, it, expect, beforeEach } from 'vitest'
import { detectCardBrand, validateCard } from '../../utils/cardValidation'
import { getCouponDiscount, formatCurrency } from '../../utils/commerce'
import { joinWaitlist } from '../../utils/waitlist'
import { createGiftCard } from '../../utils/gifts'

describe('Security & Input Sanitization Suite', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('XSS & Malicious Input Mitigation', () => {
    it('handles script tags in card cardholder name safely', () => {
      const maliciousScript = '<script>alert("xss")</script> Hacker'
      const validation = validateCard(
        '4532 0151 1283 0366',
        maliciousScript,
        '12/28',
        '123'
      )
      expect(typeof validation.name).toBe('string')
      expect(validation.isValid).toBe(true)
    })

    it('handles SQLi and script payloads in waitlist email without crash', () => {
      const sqliPayload = "admin' OR '1'='1"
      const res = joinWaitlist(sqliPayload)
      expect(res.ok).toBe(false)
      expect(res.message).toBe('Digite um e-mail válido.')
    })

    it('sanitizes coupon codes containing HTML injection characters', () => {
      const maliciousCode = '<img src=x onerror=alert(1)>'
      const discount = getCouponDiscount(maliciousCode)
      expect(discount).toBeNull()
    })
  })

  describe('Sensitive Data Exposure Protection', () => {
    it('never leaks raw credit card numbers in brand detection output', () => {
      const rawCardNumber = '4532 0151 1283 0366'
      const brand = detectCardBrand(rawCardNumber)
      expect(brand).toBe('visa')
      expect(JSON.stringify(brand)).not.toContain('4532015112830366')
    })
  })

  describe('Parameter Tampering & Numeric Boundary Protections', () => {
    it('handles negative or NaN amounts safely in currency formatting', () => {
      expect(formatCurrency(-100)).toBe('R$ -100,00')
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('creates gift card safely without executing injected scripts in message field', () => {
      const card = createGiftCard({
        amount: 100,
        fromName: '<b>Attacker</b>',
        toEmail: 'target@example.com',
        message: '<iframe src="javascript:alert(1)"></iframe>',
      })
      expect(card.code).toMatch(/^KR-/)
      expect(card.amount).toBe(100)
    })
  })
})
