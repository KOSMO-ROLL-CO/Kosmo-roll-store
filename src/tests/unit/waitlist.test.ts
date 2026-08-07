import { describe, it, expect, beforeEach } from 'vitest'
import {
  joinWaitlist,
  isOnWaitlist,
  joinRestockAlert,
  isOnRestockAlert,
} from '../../utils/waitlist'

describe('waitlist Utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('joinWaitlist', () => {
    it('validates email format', () => {
      const res = joinWaitlist('invalid-email')
      expect(res.ok).toBe(false)
      expect(res.message).toBe('Digite um e-mail válido.')
    })

    it('adds valid email to waitlist', () => {
      const res = joinWaitlist('user@example.com')
      expect(res.ok).toBe(true)
      expect(isOnWaitlist('user@example.com')).toBe(true)
    })

    it('prevents duplicate entries gracefully', () => {
      joinWaitlist('user@example.com')
      const res = joinWaitlist('USER@example.com')
      expect(res.ok).toBe(true)
      expect(res.message).toContain('Você já está na lista')
    })
  })

  describe('joinRestockAlert', () => {
    it('adds restock alert per product ID', () => {
      const res = joinRestockAlert('prod-1', 'alert@example.com')
      expect(res.ok).toBe(true)
      expect(isOnRestockAlert('prod-1', 'alert@example.com')).toBe(true)
      expect(isOnRestockAlert('prod-2', 'alert@example.com')).toBe(false)
    })
  })
})
