import { NextRequest, NextResponse } from 'next/server';
import { createSession, safeEqual, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const login = process.env.ADMIN_LOGIN;
  const password = process.env.ADMIN_PASSWORD;
  if (!login || !password) {
    return NextResponse.json({ error: 'ADMIN_LOGIN / ADMIN_PASSWORD sozlanmagan' }, { status: 500 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const okLogin = safeEqual(String(body.login ?? '').trim(), login);
  const okPass = safeEqual(String(body.password ?? ''), password);

  // Parol terib ko'rishni sekinlashtirish
  await new Promise((r) => setTimeout(r, 500));

  if (!okLogin || !okPass) {
    return NextResponse.json({ error: "Login yoki parol noto'g'ri" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions());
  return res;
}
