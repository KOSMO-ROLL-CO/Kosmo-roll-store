import { createContext, useContext } from 'react';
import type { GiftCard } from '../utils/gifts';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const REVIEW_REWARD = 5;
export const LOGIN_REWARD = 1;
export const COIN_VALUE = 0.001;
export const COINS_DISCOUNT_CAP = 0.05;

export interface CreateGiftCardInput {
  amount: number;
  fromName: string;
  toEmail: string;
  message: string;
}

export interface AddReviewResult {
  ok: boolean;
  earned: number;
}

export interface KosmoContextType {
  coins: number;
  coinsDiscountRate: number;
  wishlist: string[];
  giftCards: GiftCard[];
  reviews: Review[];
  addCoins: (amount: number) => void;
  redeemLoginCoins: () => number;
  getCoinsDiscount: (total: number) => number;
  getUsableCoins: (total: number) => number;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  createGiftCard: (data: CreateGiftCardInput) => GiftCard;
  getReviews: (productId: string) => Review[];
  addReview: (productId: string, userName: string, rating: number, comment: string, userEmail?: string) => AddReviewResult;
  canReview: (productId: string, userName: string, userEmail?: string) => boolean;
}

export const KosmoContext = createContext<KosmoContextType | null>(null);

export function useKosmo() {
  const context = useContext(KosmoContext);
  if (!context) {
    throw new Error('useKosmo must be used within a KosmoProvider');
  }
  return context;
}
