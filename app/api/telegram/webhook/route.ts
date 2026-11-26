import { NextRequest, NextResponse } from 'next/server';
import { getCar, setCarStatus } from '@/lib/db';
import { openButton, tg } from '@/lib/telegram';
import { safeEqual } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Fozilov Motors webhook ishlayapti' });
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && !safeEqual(req.headers.get('x-telegram-bot-api-secret-token') || '', secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Har doim 200 qaytaramiz — aks holda Telegram bir xil xabarni qayta-qayta yuboradi
  try {
    if (update.callback_query) await onCallback(update.callback_query);
    else if (update.message) await onMessage(update.message);
  } catch (e) {
    console.error('[webhook]', e);
  }
  return NextResponse.json({ ok: true });
}

async function onMessage(msg: any) {
  const chatId = msg.chat?.id;
  const text: string = (msg.text || '').trim();
  if (!chatId) return;

  if (text.startsWith('/id')) {
    return tg('sendMessage', { chat_id: chatId, text: `Sizning chat ID: <code>${chatId}</code>`, parse_mode: 'HTML' });
  }
  if (text.startsWith('/elon')) {
    return tg('sendMessage', {
      chat_id: chatId,
      text: "📝 Avtomobilingizni sotish uchun e'lon joylang:",
      reply_markup: { inline_keyboard: [[openButton("➕ E'lon joylash", '/elon')]] },
    });
  }
  return tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text:
      "<b>Fozilov Motors</b>ga xush kelibsiz! 🚗\n\nBu yerda avtomobil sotib olishingiz yoki o'z mashinangizni sotish uchun e'lon joylashingiz mumkin.",
    reply_markup: {
      inline_keyboard: [[openButton('🚗 Avtomobillarni ko\'rish', '/')], [openButton("➕ E'lon joylash", '/elon')]],
    },
  });
}

async function onCallback(cq: any) {
  const adminId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '');
  const fromId = String(cq.from?.id || '');
  const chatId = String(cq.message?.chat?.id || '');
  const isAdmin = adminId && (fromId === adminId || chatId === adminId);

  if (!isAdmin) {
    return tg('answerCallbackQuery', { callback_query_id: cq.id, text: "Ruxsat yo'q", show_alert: true });
  }

  const [action, idStr] = String(cq.data || '').split(':');
  const id = Number(idStr);
  if (action === 'noop' || !id) return tg('answerCallbackQuery', { callback_query_id: cq.id });

  const car = await getCar(id, true);
  if (!car) return tg('answerCallbackQuery', { callback_query_id: cq.id, text: "E'lon topilmadi", show_alert: true });

  const status = action === 'approve' ? 'approved' : 'rejected';
  await setCarStatus(id, status);

  await tg('answerCallbackQuery', {
    callback_query_id: cq.id,
    text: status === 'approved' ? '✅ Tasdiqlandi — saytda ko\'rinadi' : '❌ Rad etildi',
  });
  if (cq.message) {
    await tg('editMessageReplyMarkup', {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      reply_markup: {
        inline_keyboard: [[{ text: status === 'approved' ? '✅ Tasdiqlangan' : '❌ Rad etilgan', callback_data: 'noop' }]],
      },
    });
  }
}
