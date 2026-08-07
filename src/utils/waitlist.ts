const STORAGE_KEY = 'kosmo-waitlist';
const RESTOCK_STORAGE_KEY = 'kosmo-restock-alerts';

export interface WaitlistResult {
  ok: boolean;
  message: string;
}

export interface RestockAlert {
  productId: string;
  email: string;
}

export function getWaitlistEmails(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isOnWaitlist(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getWaitlistEmails().includes(normalized);
}

export function joinWaitlist(email: string): WaitlistResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) {
    return { ok: false, message: 'Digite um e-mail válido.' };
  }
  if (isOnWaitlist(normalized)) {
    return { ok: true, message: 'Você já está na lista. Fique de olho no e-mail!' };
  }
  const next = [...getWaitlistEmails(), normalized];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { ok: true, message: 'Boa! Você entrou na lista de pré-venda. 🚀' };
}

export function getRestockAlerts(): RestockAlert[] {
  try {
    const raw = localStorage.getItem(RESTOCK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isOnRestockAlert(productId: string, email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getRestockAlerts().some(
    (a) => a.productId === productId && a.email === normalized
  );
}

export function joinRestockAlert(productId: string, email: string): WaitlistResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) {
    return { ok: false, message: 'Digite um e-mail válido.' };
  }
  if (isOnRestockAlert(productId, normalized)) {
    return { ok: true, message: 'Você já pediu pra ser avisado(a) sobre essa peça. 🚀' };
  }
  const next = [...getRestockAlerts(), { productId, email: normalized }];
  localStorage.setItem(RESTOCK_STORAGE_KEY, JSON.stringify(next));
  return { ok: true, message: 'Boa! Avisamos você quando essa peça voltar. 🚀' };
}
