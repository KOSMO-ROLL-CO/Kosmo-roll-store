import { useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { Product, Size, ProductColor } from '../types';
import { getCouponDiscount, getCouponInfo, estimateShipping, FREE_SHIPPING_THRESHOLD } from '../utils/commerce';
import { getGiftCardByCode, setGiftCardUsed } from '../utils/gifts';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';
import { CartContext, type CartState, type CouponApplyResult } from './CartContext';

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: Size; color: ProductColor; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string; size: Size; colorName: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: Size; colorName: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'APPLY_COUPON'; code: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_SHIPPING'; cep: string; price: number; days: number }
  | { type: 'APPLY_GIFT_CARD'; code: string; amount: number }
  | { type: 'REMOVE_GIFT_CARD'; code: string };

const CART_STORAGE_KEY = 'kosmo-cart-v2';

function loadCartState(): Pick<CartState, 'items' | 'coupon' | 'shipping' | 'giftCards'> {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return { items: [], coupon: { code: '', applied: false }, shipping: { cep: '', price: 0, days: 0, calculated: false }, giftCards: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      coupon: parsed.coupon ?? { code: '', applied: false },
      shipping: parsed.shipping ?? { cep: '', price: 0, days: 0, calculated: false },
      giftCards: Array.isArray(parsed.giftCards) ? parsed.giftCards : [],
    };
  } catch {
    return { items: [], coupon: { code: '', applied: false }, shipping: { cep: '', price: 0, days: 0, calculated: false }, giftCards: [] };
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === action.product.id &&
          item.size === action.size &&
          item.color.name === action.color.name
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.quantity,
        };
        return { ...state, items: updated, isOpen: true };
      }

      return {
        ...state,
        items: [...state.items, { product: action.product, size: action.size, color: action.color, quantity: action.quantity }],
        isOpen: true,
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(item.product.id === action.productId && item.size === action.size && item.color.name === action.colorName)
        ),
      };

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) =>
              !(item.product.id === action.productId && item.size === action.size && item.color.name === action.colorName)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId && item.size === action.size && item.color.name === action.colorName
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        coupon: { code: '', applied: false },
        shipping: { cep: '', price: 0, days: 0, calculated: false },
        giftCards: [],
      };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'APPLY_COUPON':
      return { ...state, coupon: { code: action.code, applied: true } };

    case 'REMOVE_COUPON':
      return { ...state, coupon: { code: '', applied: false } };

    case 'SET_SHIPPING':
      return {
        ...state,
        shipping: { cep: action.cep, price: action.price, days: action.days, calculated: true },
      };

    case 'APPLY_GIFT_CARD':
      if (state.giftCards.some((g) => g.code === action.code)) return state;
      return {
        ...state,
        giftCards: [...state.giftCards, { code: action.code, amount: action.amount }],
      };

    case 'REMOVE_GIFT_CARD':
      return {
        ...state,
        giftCards: state.giftCards.filter((g) => g.code !== action.code),
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { orders } = useOrders();
  const initial = loadCartState();
  const [state, dispatch] = useReducer(cartReducer, {
    items: initial.items,
    isOpen: false,
    coupon: initial.coupon,
    shipping: initial.shipping,
    giftCards: initial.giftCards,
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: state.items, coupon: state.coupon, shipping: state.shipping, giftCards: state.giftCards }));
  }, [state.items, state.coupon, state.shipping, state.giftCards]);

  const userHasOrders = !!user && orders.some((o) => o.userEmail === user.email);

  const addItem = useCallback((product: Product, size: Size, color: ProductColor, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, size, color, quantity });
  }, []);

  const removeItem = useCallback((productId: string, size: Size, colorName: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId, size, colorName });
  }, []);

  const updateQuantity = useCallback((productId: string, size: Size, colorName: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, size, colorName, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  const applyCoupon = useCallback(
    (code: string): CouponApplyResult => {
      const normalized = code.trim().toUpperCase();
      const info = getCouponInfo(normalized);
      if (!info) return { ok: false, reason: 'Cupom inválido ou expirado.' };
      if (info.active === false) return { ok: false, reason: 'Cupom pausado. Tente novamente mais tarde.' };

      if (info.type === 'primeira-compra') {
        if (!user) {
          return { ok: false, reason: 'Este cupom exige uma conta. Crie sua conta ou faça login.' };
        }
        if (userHasOrders) {
          return { ok: false, reason: 'Este cupom vale somente para a primeira compra.' };
        }
      }

      dispatch({ type: 'APPLY_COUPON', code: normalized });
      return { ok: true };
    },
    [user, userHasOrders]
  );

  const removeCoupon = useCallback(() => dispatch({ type: 'REMOVE_COUPON' }), []);

  const calculateShipping = useCallback((cep: string) => {
    const { price, days } = estimateShipping(cep);
    dispatch({ type: 'SET_SHIPPING', cep: cep.trim(), price, days });
  }, []);

  const applyGiftCard = useCallback((code: string): boolean => {
    const card = getGiftCardByCode(code);
    if (!card || card.used) return false;
    setGiftCardUsed(card.code, true);
    dispatch({ type: 'APPLY_GIFT_CARD', code: card.code, amount: card.amount });
    return true;
  }, []);

  const removeGiftCard = useCallback((code: string) => {
    setGiftCardUsed(code, false);
    dispatch({ type: 'REMOVE_GIFT_CARD', code });
  }, []);

  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const couponDiscount = state.coupon.applied ? subtotal * (getCouponDiscount(state.coupon.code) ?? 0) : 0;
  const giftCardDiscount = state.giftCards.reduce((sum, g) => sum + g.amount, 0);

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingPrice = state.shipping.calculated && state.shipping.price > 0 && !freeShipping ? state.shipping.price : 0;

  const total = Math.max(0, subtotal - couponDiscount - giftCardDiscount) + shippingPrice;

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        applyCoupon,
        removeCoupon,
        couponCode: state.coupon.code,
        couponApplied: state.coupon.applied,
        couponDiscount,
        calculateShipping,
        shippingCep: state.shipping.cep,
        shippingPrice,
        shippingDays: state.shipping.days,
        shippingCalculated: state.shipping.calculated,
        freeShipping,
        applyGiftCard,
        removeGiftCard,
        giftCardDiscount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
