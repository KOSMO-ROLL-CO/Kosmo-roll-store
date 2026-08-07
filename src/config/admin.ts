export const ADMIN_EMAILS = ['admin@kosmoroll.co', 'ceo@kosmoroll.co'];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
