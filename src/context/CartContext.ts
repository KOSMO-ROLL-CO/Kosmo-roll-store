import { createContext, useContext } from 'react';
import type { CartItem, Product, Size, ProductColor } from '../types';

export interface AppliedGiftCard {
  code: string;
  amount: number;
}

export interface CouponApplyResult {
  ok: boolean;
  reason?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: { code: string; applied: boolean };
  shipping: { cep: string; price: number; days: number; calculated: boolean };
  giftCards: AppliedGiftCard[];
}

export interface CartContextType {
  state: CartState;
  addItem: (product: Product, size: Size, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, size: Size, colorName: string) => void;
  updateQuantity: (productId: string, size: Size, colorName: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  applyCoupon: (code: string) => CouponApplyResult;
  removeCoupon: () => void;
  couponCode: string;
  couponApplied: boolean;
  couponDiscount: number;
  calculateShipping: (cep: string) => void;
  shippingCep: string;
  shippingPrice: number;
  shippingDays: number;
  shippingCalculated: boolean;
  freeShipping: boolean;
  applyGiftCard: (code: string) => boolean;
  removeGiftCard: (code: string) => void;
  giftCardDiscount: number;
  total: number;
}

export const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
