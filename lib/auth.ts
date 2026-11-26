// Edge (middleware) va Node (API) muhitlarida ishlaydi — faqat Web Crypto ishlatiladi.
export const SESSION_COOKIE = 'fm_session';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 kun

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data: string) {
  const secret = process.env.SESSION_SECRET || `fm::${process.env.ADMIN_PASSWORD || ''}::${process.env.ADMIN_LOGIN || ''}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(new Uint8Array(sig));
}

export function safeEqual(a: string, b: string) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSession() {
  const payload = `admin.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(token?: string | null) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const [role, exp] = payload.split('.');
  if (role !== 'admin' || !(Number(exp) > Date.now())) return false;
  return safeEqual(sig, await hmac(payload));
}

export function sessionCookieOptions() {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: prod,
    // Telegram Web ichida (iframe) ham login ishlashi uchun productionda SameSite=None
    sameSite: (prod ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: MAX_AGE,
  };
}

/** API route'lar ichida qo'shimcha tekshiruv (middleware'dan tashqari) */
export async function isAdminRequest(req: { cookies: { get(name: string): { value: string } | undefined } }) {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}
