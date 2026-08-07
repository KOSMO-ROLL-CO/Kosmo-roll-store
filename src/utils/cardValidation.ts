export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'discover' | 'diners' | 'unknown';

interface CardValidation {
  brand: CardBrand;
  isValid: boolean;
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

// Card brand patterns
const BRAND_PATTERNS: { brand: CardBrand; pattern: RegExp; lengths: number[] }[] = [
  { brand: 'visa', pattern: /^4/, lengths: [13, 16, 19] },
  { brand: 'mastercard', pattern: /^(5[1-5]|2[2-7])/, lengths: [16] },
  { brand: 'elo', pattern: /^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/, lengths: [16] },
  { brand: 'amex', pattern: /^3[47]/, lengths: [15] },
  { brand: 'discover', pattern: /^(6011|65|644|645|646|647|648|649)/, lengths: [16, 19] },
  { brand: 'diners', pattern: /^(30[0-5]|36|38|39)/, lengths: [14, 16] },
];

// Brand display info
export const BRAND_INFO: Record<CardBrand, { name: string; color: string; maxLength: number; cvvLength: number }> = {
  visa: { name: 'Visa', color: '#1A1F71', maxLength: 16, cvvLength: 3 },
  mastercard: { name: 'Mastercard', color: '#EB001B', maxLength: 16, cvvLength: 3 },
  elo: { name: 'Elo', color: '#00A4E4', maxLength: 16, cvvLength: 3 },
  amex: { name: 'American Express', color: '#006FCF', maxLength: 15, cvvLength: 4 },
  discover: { name: 'Discover', color: '#FF6000', maxLength: 16, cvvLength: 3 },
  diners: { name: 'Diners Club', color: '#004080', maxLength: 16, cvvLength: 3 },
  unknown: { name: 'Cartão', color: '#6B7280', maxLength: 16, cvvLength: 3 },
};

// Detect card brand from number
export function detectCardBrand(number: string): CardBrand {
  const cleaned = number.replace(/\D/g, '');
  for (const { brand, pattern } of BRAND_PATTERNS) {
    if (pattern.test(cleaned)) return brand;
  }
  return 'unknown';
}

// Luhn algorithm for card number validation
export function luhnCheck(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const brand = detectCardBrand(cleaned);
  const maxLength = BRAND_INFO[brand].maxLength;

  // Amex: 4-6-5 pattern
  if (brand === 'amex') {
    const limited = cleaned.slice(0, maxLength);
    const parts = [limited.slice(0, 4), limited.slice(4, 10), limited.slice(10)];
    return parts.filter(Boolean).join(' ');
  }

  // Default: 4-4-4-4 pattern
  const limited = cleaned.slice(0, maxLength);
  return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Format expiry date (MM/YY)
export function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) {
    // If first digit > 1, it must be 0X
    if (parseInt(cleaned) > 1) return `0${cleaned}/`;
    return cleaned;
  }

  let month = cleaned.slice(0, 2);
  const year = cleaned.slice(2, 4);

  // Validate month
  if (parseInt(month) > 12) month = '12';
  if (parseInt(month) === 0) month = '01';

  if (year) return `${month}/${year}`;
  return month;
}

// Validate expiry date
export function isValidExpiry(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length < 4) return false;

  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt(`20${cleaned.slice(2, 4)}`, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

// Validate CVV
export function isValidCVV(value: string, brand: CardBrand): boolean {
  const cleaned = value.replace(/\D/g, '');
  const expectedLength = BRAND_INFO[brand].cvvLength;
  return cleaned.length === expectedLength;
}

// Validate card name
export function isValidCardName(value: string): boolean {
  const trimmed = value.trim();
  // At least 2 words with at least 2 characters each
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2;
}

// Get card validation summary
export function validateCard(
  number: string,
  name: string,
  expiry: string,
  cvv: string
): CardValidation {
  const brand = detectCardBrand(number);
  const cleanedNumber = number.replace(/\D/g, '');
  const expectedLength = BRAND_INFO[brand].maxLength;

  return {
    brand,
    isValid:
      cleanedNumber.length === expectedLength &&
      luhnCheck(number) &&
      isValidCardName(name) &&
      isValidExpiry(expiry) &&
      isValidCVV(cvv, brand),
    number: cleanedNumber.length === expectedLength ? cleanedNumber : '',
    expiry: isValidExpiry(expiry) ? expiry : '',
    cvv: isValidCVV(cvv, brand) ? cvv : '',
    name: isValidCardName(name) ? name : '',
  };
}

// Get brand icon SVG path (simplified)
export function getBrandIcon(brand: CardBrand): string {
  switch (brand) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '🔴';
    case 'elo':
      return '🔵';
    case 'amex':
      return '💙';
    case 'discover':
      return '🟠';
    case 'diners':
      return '⬜';
    default:
      return '💳';
  }
}
