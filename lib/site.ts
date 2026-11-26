/** Saytning to'liq manzili (Telegram tugmalari, OG rasmlar va webhook uchun) */
export function siteUrl(): string {
  const u =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';
  return u.replace(/\/$/, '');
}
