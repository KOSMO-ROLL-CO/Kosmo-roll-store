import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthProvider'
import { OrderProvider } from '../../context/OrderProvider'
import { KosmoProvider } from '../../context/KosmoProvider'
import { CartProvider } from '../../context/CartProvider'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'

const mockProduct: Product = {
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <OrderProvider>
      <KosmoProvider>
        <CartProvider>{children}</CartProvider>
      </KosmoProvider>
    </OrderProvider>
  </AuthProvider>
)

describe('CartContext & CartProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.state.items).toEqual([])
    expect(result.current.totalItems).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct, 'M', mockProduct.colors[0], 1)
    })

    expect(result.current.totalItems).toBe(1)
    expect(result.current.subtotal).toBe(199.9)
    expect(result.current.state.items[0].product.id).toBe('prod-1')
  })

  it('updates item quantity and increments total', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct, 'M', mockProduct.colors[0], 1)
    })

    act(() => {
      result.current.updateQuantity('prod-1', 'M', 'Preto', 3)
    })

    expect(result.current.totalItems).toBe(3)
    expect(result.current.subtotal).toBe(599.7)
  })

  it('removes item when quantity updated to 0 or explicitly removed', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct, 'M', mockProduct.colors[0], 2)
    })

    act(() => {
      result.current.removeItem('prod-1', 'M', 'Preto')
    })

    expect(result.current.totalItems).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('applies coupon and calculates discount', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct, 'M', mockProduct.colors[0], 1)
    })

    act(() => {
      const res = result.current.applyCoupon('COSMICO15')
      expect(res.ok).toBe(true)
    })

    expect(result.current.couponApplied).toBe(true)
    expect(result.current.couponDiscount).toBeCloseTo(29.985, 2)
  })

  it('calculates shipping costs', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.calculateShipping('01310-100')
    })

    expect(result.current.shippingCalculated).toBe(true)
    expect(result.current.shippingPrice).toBe(19.9)
  })
})
