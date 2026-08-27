export const ADMIN_EMAILS = [
  'uddipangoswami4@gmail.com',
  'zeng07292@gmail.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.map((e) => e.toLowerCase().trim()).includes(normalized);
}

export function isProOrAdmin(email?: string | null, plan?: string | null): boolean {
  if (isAdminEmail(email)) return true;
  if (!plan) return false;
  const p = plan.toLowerCase().trim();
  return p === 'pro' || p === 'agency' || p === 'admin' || p === 'unlimited' || p === 'premium';
}
