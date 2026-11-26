import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { tg, tgEnabled } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Admin paneldagi "Telegram botni ulash" tugmasi shu yerni chaqiradi */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  if (!tgEnabled()) return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN sozlanmagan' }, { status: 400 });

  const base = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '');
  if (!base.startsWith('https://')) {
    return NextResponse.json({ error: 'Telegram faqat https manzil bilan ishlaydi. Avval Vercel\'ga deploy qiling.' }, { status: 400 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const webhook = await tg('setWebhook', {
    url: `${base}/api/telegram/webhook`,
    ...(secret ? { secret_token: secret } : {}),
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
  const menu = await tg('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Fozilov Motors', web_app: { url: base } },
  });
  const commands = await tg('setMyCommands', {
    commands: [
      { command: 'start', description: 'Saytni ochish' },
      { command: 'elon', description: "E'lon joylash" },
      { command: 'id', description: 'Chat ID ni bilish' },
    ],
  });
  const info = await tg('getWebhookInfo', {});

  return NextResponse.json({
    ok: Boolean(webhook?.ok),
    webhook: webhook?.description,
    menu: menu?.ok,
    commands: commands?.ok,
    info: info?.result,
  });
}
