import { describe, it, expect, beforeEach } from 'vitest'
import {
  createGiftCard,
  getGiftCards,
  getGiftCardByCode,
  setGiftCardUsed,
} from '../../utils/gifts'

describe('gifts Utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates a gift card and persists it', () => {
    const card = createGiftCard({
      amount: 100,
      fromName: 'Alice',
      toEmail: 'bob@example.com',
      message: 'Happy Birthday!',
    })

    expect(card.code).toMatch(/^KR-[A-Z0-9]{6}$/)
    expect(card.amount).toBe(100)
    expect(card.used).toBe(false)

    const all = getGiftCards()
    expect(all.length).toBe(1)
    expect(all[0].code).toBe(card.code)
  })

  it('finds gift card by code case-insensitively', () => {
    const card = createGiftCard({
      amount: 50,
      fromName: 'Charlie',
      toEmail: 'dave@example.com',
      message: 'Enjoy',
    })

    const found = getGiftCardByCode(card.code.toLowerCase())
    expect(found).toBeDefined()
    expect(found?.code).toBe(card.code)
  })

  it('marks a gift card as used', () => {
    const card = createGiftCard({
      amount: 200,
      fromName: 'Eve',
      toEmail: 'frank@example.com',
      message: 'Congrats',
    })

    setGiftCardUsed(card.code, true)
    const updated = getGiftCardByCode(card.code)
    expect(updated?.used).toBe(true)
  })
})
