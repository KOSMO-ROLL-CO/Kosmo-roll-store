import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthProvider'
import { OrderProvider } from '../../context/OrderProvider'
import { KosmoProvider } from '../../context/KosmoProvider'
import { CartProvider } from '../../context/CartProvider'
import { useCart } from '../../context/CartContext'
import { useKosmo, REVIEW_REWARD, LOGIN_REWARD } from '../../context/KosmoContext'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrderContext'
import type { Product } from '../../types'

const product: Product = {
  id: 'prod-1',
  name: 'Camiseta Kosmo Roll Over',
  slug: 'camiseta-kosmo-roll-over',
  description: 'Camiseta premium',
  shortDescription: 'Camiseta',
  price: 199.9,
  images: ['/test.jpg'],
  category: 'camisetas',
  sizes: ['P', 'M', 'G', 'GG'],
  colors: [{ name: 'Preto', hex: '#000000', available: true }],
  edition: { current: 1, total: 100, isLimited: false },
  tags: ['camiseta'],
  isNew: true,
  isFeatured: true,
  stock: 10,
}

function useEverything() {
  return {
    ...useCart(),
    ...useKosmo(),
    ...useAuth(),
    ...useOrders(),
  }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <OrderProvider>
      <KosmoProvider>
        <CartProvider>{children}</CartProvider>
      </KosmoProvider>
    </OrderProvider>
  </AuthProvider>
)

describe('Persistência de Estado no localStorage (sobrevive a reload)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('carrinho persiste em kosmo-cart-v2 e é restaurado após remontar', () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    act(() => {
      result.current.addItem(product, 'M', product.colors[0], 2)
    })

    const raw = JSON.parse(localStorage.getItem('kosmo-cart-v2') ?? '{}')
    expect(raw.items).toHaveLength(1)
    expect(raw.items[0].quantity).toBe(2)

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.totalItems).toBe(2)
    expect(restored.current.state.items[0].product.id).toBe('prod-1')
  })

  it('favoritos persistem em kosmo-wishlist e são restaurados', () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    act(() => {
      result.current.toggleWishlist('prod-1')
    })

    expect(JSON.parse(localStorage.getItem('kosmo-wishlist') ?? '[]')).toEqual(['prod-1'])

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.isWishlisted('prod-1')).toBe(true)
  })

  it('moedas persistem em kosmo-coins e são restauradas', () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    act(() => {
      result.current.addCoins(30)
    })

    expect(localStorage.getItem('kosmo-coins')).toBe('30')

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.coins).toBe(30)
  })

  it('recompensa de login diária é concedida apenas uma vez por dia', () => {
    const { result } = renderHook(() => useEverything(), { wrapper })

    let earned = -1
    act(() => {
      earned = result.current.redeemLoginCoins()
    })
    expect(earned).toBe(LOGIN_REWARD)
    expect(localStorage.getItem('kosmo-last-login')).toBe(new Date().toISOString().slice(0, 10))

    act(() => {
      earned = result.current.redeemLoginCoins()
    })
    expect(earned).toBe(0)
  })

  it('endereços persistem em kosmo-addresses e são restaurados', () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    act(() => {
      result.current.addAddress({
        label: 'Casa',
        zipCode: '01310-100',
        address: 'Rua das Estrelas',
        number: '42',
        complement: '',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        isDefault: true,
      })
    })

    expect(JSON.parse(localStorage.getItem('kosmo-addresses') ?? '[]')).toHaveLength(1)

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.savedAddresses).toHaveLength(1)
    expect(restored.current.savedAddresses[0].city).toBe('São Paulo')
  })

  it('gift cards persistem em kosmo-gift-cards e são restaurados', () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    act(() => {
      result.current.createGiftCard({ amount: 100, fromName: 'Ana', toEmail: 'ana@test.com', message: 'Presente!' })
    })

    expect(JSON.parse(localStorage.getItem('kosmo-gift-cards') ?? '[]')).toHaveLength(1)

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.giftCards).toHaveLength(1)
    expect(restored.current.giftCards[0].amount).toBe(100)
  })

  it('avaliações persistem em kosmo-reviews, premiando moedas apenas na primeira vez', async () => {
    const { result, unmount } = renderHook(() => useEverything(), { wrapper })

    await act(async () => {
      await result.current.login('ana@test.com', 'senha')
    })

    act(() => {
      result.current.addOrder({
        userEmail: 'ana@test.com',
        items: [{ productId: 'prod-1', productName: product.name, size: 'M', color: 'Preto', price: 199.9, quantity: 1 }],
        total: 199.9,
        paymentMethod: 'card',
        address: {
          street: 'Rua das Estrelas',
          number: '42',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
        },
      })
    })

    expect(result.current.canReview('prod-1', 'Ana', 'ana@test.com')).toBe(true)

    let reviewResult: { ok: boolean; earned: number } | null = null
    act(() => {
      reviewResult = result.current.addReview('prod-1', 'Ana', 5, 'Camiseta incrível!', 'ana@test.com')
    })
    expect(reviewResult).toEqual({ ok: true, earned: REVIEW_REWARD })
    expect(result.current.coins).toBe(REVIEW_REWARD)

    act(() => {
      reviewResult = result.current.addReview('prod-1', 'Ana', 4, 'Tentativa duplicada', 'ana@test.com')
    })
    expect(reviewResult).toEqual({ ok: false, earned: 0 })

    expect(JSON.parse(localStorage.getItem('kosmo-reviews') ?? '[]')).toHaveLength(1)

    unmount()

    const { result: restored } = renderHook(() => useEverything(), { wrapper })
    expect(restored.current.getReviews('prod-1')).toHaveLength(1)
    expect(restored.current.coins).toBe(REVIEW_REWARD)
    expect(restored.current.canReview('prod-1', 'Ana', 'ana@test.com')).toBe(false)
  })
})
