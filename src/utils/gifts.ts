export interface GiftCard {
  code: string;
  amount: number;
  fromName: string;
  toEmail: string;
  message: string;
  used: boolean;
  createdAt: string;
}

export const GIFT_CARD_AMOUNTS = [50, 100, 200];

const STORAGE_KEY = 'kosmo-gift-cards';

function loadGiftCards(): GiftCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGiftCards(cards: GiftCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `KR-${code}`;
}

export function getGiftCards(): GiftCard[] {
  return loadGiftCards();
}

export function createGiftCard(data: {
  amount: number;
  fromName: string;
  toEmail: string;
  message: string;
}): GiftCard {
  const card: GiftCard = {
    ...data,
    code: generateCode(),
    used: false,
    createdAt: new Date().toISOString(),
  };
  saveGiftCards([card, ...loadGiftCards()]);
  return card;
}

export function getGiftCardByCode(code: string): GiftCard | undefined {
  const normalized = code.trim().toUpperCase();
  return loadGiftCards().find((c) => c.code === normalized);
}

export function setGiftCardUsed(code: string, used: boolean) {
  const cards = loadGiftCards();
  const next = cards.map((c) => (c.code === code ? { ...c, used } : c));
  saveGiftCards(next);
}
