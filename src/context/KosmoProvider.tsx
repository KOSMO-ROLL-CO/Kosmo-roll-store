import { useState, useCallback, type ReactNode } from 'react';
import { getGiftCards, createGiftCard as persistGiftCard, type GiftCard } from '../utils/gifts';
import { useOrders } from './OrderContext';
import {
  KosmoContext,
  REVIEW_REWARD,
  LOGIN_REWARD,
  COIN_VALUE,
  COINS_DISCOUNT_CAP,
  type Review,
  type CreateGiftCardInput,
  type AddReviewResult,
} from './KosmoContext';

const COINS_KEY = 'kosmo-coins';
const WISHLIST_KEY = 'kosmo-wishlist';
const REVIEWS_KEY = 'kosmo-reviews';
const LAST_LOGIN_KEY = 'kosmo-last-login';

function loadCoins(): number {
  try {
    const raw = localStorage.getItem(COINS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLastLogin(): string {
  try {
    return localStorage.getItem(LAST_LOGIN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function KosmoProvider({ children }: { children: ReactNode }) {
  const { orders } = useOrders();
  const [coins, setCoins] = useState<number>(loadCoins);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);
  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => getGiftCards());
  const [reviews, setReviews] = useState<Review[]>(loadReviews);

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      localStorage.setItem(COINS_KEY, String(next));
      return next;
    });
  }, []);

  const redeemLoginCoins = useCallback((): number => {
    const today = new Date().toISOString().slice(0, 10);
    if (getLastLogin() === today) return 0;
    localStorage.setItem(LAST_LOGIN_KEY, today);
    addCoins(LOGIN_REWARD);
    return LOGIN_REWARD;
  }, [addCoins]);

  const coinsDiscountRate = Math.min(coins * COIN_VALUE, COINS_DISCOUNT_CAP);
  const getUsableCoins = useCallback(
    (total: number) => Math.min(coins, Math.floor((total * COINS_DISCOUNT_CAP) / COIN_VALUE)),
    [coins]
  );
  const getCoinsDiscount = useCallback(
    (total: number) => getUsableCoins(total) * COIN_VALUE,
    [getUsableCoins]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const createGiftCard = useCallback((data: CreateGiftCardInput): GiftCard => {
    const card = persistGiftCard(data);
    setGiftCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const getReviews = useCallback(
    (productId: string) =>
      reviews.filter((r) => r.productId === productId).sort((a, b) => b.date.localeCompare(a.date)),
    [reviews]
  );

  const hasPurchased = useCallback(
    (productId: string, userEmail?: string) =>
      !!userEmail &&
      orders.some(
        (o) =>
          o.userEmail === userEmail &&
          o.status !== 'cancelled' &&
          o.paymentStatus !== 'pending' &&
          o.items.some((i) => i.productId === productId)
      ),
    [orders]
  );

  const canReview = useCallback(
    (productId: string, userName: string, userEmail?: string) =>
      hasPurchased(productId, userEmail) &&
      !reviews.some((r) => r.productId === productId && r.userName === userName),
    [reviews, hasPurchased]
  );

  const addReview = useCallback(
    (productId: string, userName: string, rating: number, comment: string, userEmail?: string): AddReviewResult => {
      if (!canReview(productId, userName, userEmail)) {
        return { ok: false, earned: 0 };
      }
      const review: Review = {
        id: crypto.randomUUID(),
        productId,
        userName,
        rating,
        comment,
        date: new Date().toISOString(),
      };
      const next = [review, ...reviews];
      setReviews(next);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
      addCoins(REVIEW_REWARD);
      return { ok: true, earned: REVIEW_REWARD };
    },
    [reviews, canReview, addCoins]
  );

  return (
    <KosmoContext.Provider
      value={{
        coins,
        coinsDiscountRate,
        wishlist,
        giftCards,
        reviews,
        addCoins,
        redeemLoginCoins,
        getCoinsDiscount,
        getUsableCoins,
        toggleWishlist,
        isWishlisted,
        createGiftCard,
        getReviews,
        addReview,
        canReview,
      }}
    >
      {children}
    </KosmoContext.Provider>
  );
}
