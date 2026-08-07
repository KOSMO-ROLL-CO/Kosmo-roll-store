export type CouponType = 'primeira-compra' | 'geral';

export interface CouponInfo {
  code: string;
  discount: number;
  type: CouponType;
  title: string;
  description: string;
  rules: string[];
  active?: boolean;
}

export interface CouponOverride {
  discount?: number;
  title?: string;
  active?: boolean;
}

const COUPON_STORAGE_KEY = 'kosmo-admin-coupons';

export function getCouponOverrides(): Record<string, CouponOverride> {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCouponOverride(code: string, override: CouponOverride) {
  const next = { ...getCouponOverrides(), [code]: override };
  localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(next));
}

export function resetCouponOverrides() {
  localStorage.removeItem(COUPON_STORAGE_KEY);
}

export const COUPON_INFO: Record<string, CouponInfo> = {
  KOSMO10: {
    code: 'KOSMO10',
    discount: 0.1,
    type: 'primeira-compra',
    title: '10% na primeira compra',
    description:
      'Cupom de boas-vindas para novos tripulantes. Válido apenas na primeira compra do cliente.',
    rules: [
      'Válido somente na PRIMEIRA compra da conta cadastrada.',
      'É obrigatório estar logado (ou ter criado uma conta) para usar o cupom.',
      'Se o cliente já realizou qualquer compra, mesmo sem ter usado o cupom, o benefício é perdido automaticamente.',
      'Cada conta pode utilizar o cupom apenas uma vez, de forma vitalícia.',
      'Não é cumulativo com vale-presente.',
      'O desconto é aplicado no momento da confirmação do pedido.',
    ],
  },
  COSMO20: {
    code: 'COSMO20',
    discount: 0.2,
    type: 'geral',
    title: '20% OFF no catálogo',
    description:
      'Cupom de oferta relâmpago com 20% de desconto em produtos selecionados.',
    rules: [
      'Válido para qualquer cliente, logado ou não.',
      'Não se aplica a vales-presente.',
      'Disponível apenas em períodos promocionais.',
      'Não acumula com outros cupons de desconto.',
    ],
  },
  COSMICO15: {
    code: 'COSMICO15',
    discount: 0.15,
    type: 'geral',
    title: '15% OFF na comunidade',
    description:
      'Cupom exclusivo da comunidade Kosmo Roll, liberado em datas especiais.',
    rules: [
      'Válido para qualquer cliente, logado ou não.',
      'Não se aplica a vales-presente.',
      'Disponível apenas em períodos promocionais.',
      'Não acumula com outros cupons de desconto.',
    ],
  },
};

export const COUPONS: Record<string, number> = Object.fromEntries(
  Object.values(COUPON_INFO).map((c) => [c.code, c.discount])
);

export const FREE_SHIPPING_THRESHOLD = 299;

export function getCouponDiscount(code: string): number | null {
  const normalized = code.trim().toUpperCase();
  if (COUPONS[normalized] == null) return null;
  const override = getCouponOverrides()[normalized];
  if (override && override.active === false) return null;
  return override?.discount ?? COUPONS[normalized];
}

export function getCouponInfo(code: string): CouponInfo | null {
  const normalized = code.trim().toUpperCase();
  const base = COUPON_INFO[normalized];
  if (!base) return null;
  const override = getCouponOverrides()[normalized];
  if (!override) return base;
  return {
    ...base,
    discount: override.discount ?? base.discount,
    title: override.title ?? base.title,
    active: override.active ?? true,
  };
}

export function estimateShipping(cep: string): { price: number; days: number } {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return { price: 0, days: 0 };

  const first = parseInt(digits[0], 10);

  const table: Record<number, [number, number]> = {
    0: [19.9, 2],   // SP capital e região metropolitana
    1: [21.9, 3],   // Interior de SP
    2: [24.9, 4],   // RJ e ES
    3: [26.9, 4],   // MG
    4: [29.9, 5],   // BA, SE e AL
    5: [29.9, 5],   // PE, PB, RN
    6: [32.9, 6],   // CE, PI, PA
    7: [27.9, 5],   // DF, GO, TO
    8: [24.9, 4],   // PR e SC
    9: [31.9, 6],   // RS, RO, AC, AM
  };

  const [price, days] = table[first] ?? [34.9, 7];
  return { price, days };
}

export const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

export const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatInstallment = (price: number, times = 12) => {
  const value = price / times;
  return `${times}x de ${formatCurrency(value)}`;
};
