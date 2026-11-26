import type { Car } from './types';
import { formatNumber, formatPhone, formatPrice } from './format';
import { siteUrl } from './site';

export function tgEnabled() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

/** Telegram Bot API chaqiruvi. Xato bo'lsa sayt ishlashi to'xtamaydi. */
export async function tg(method: string, body: Record<string, unknown>): Promise<any> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: 'TELEGRAM_BOT_TOKEN yo\'q' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const json = await res.json();
    if (!json.ok) console.error(`[telegram] ${method}:`, json.description);
    return json;
  } catch (e) {
    console.error(`[telegram] ${method} xato:`, e);
    return { ok: false, description: String(e) };
  }
}

export function esc(s: unknown) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const isHttps = (u: string) => u.startsWith('https://');

export function carText(car: Car, title = '🆕 Yangi e\'lon') {
  const lines = [
    `<b>${title} #${car.id}</b>`,
    '',
    `🚗 <b>${esc(car.brand)} ${esc(car.model)}</b> (${car.year})`,
    `💰 <b>${esc(formatPrice(car.price, car.currency))}</b>`,
    `🛣 ${formatNumber(car.mileage)} km · ⛽ ${esc(car.fuel)} · ⚙️ ${esc(car.transmission)}`,
    `🔧 ${esc(car.engine)} L · 🎨 ${esc(car.color)} · ✨ ${esc(car.condition)}`,
    '',
    `👤 ${esc(car.seller_name)}`,
    `📞 ${esc(formatPhone(car.seller_phone))}`,
  ];
  if (car.description) lines.push('', `📝 ${esc(car.description.slice(0, 300))}${car.description.length > 300 ? '…' : ''}`);
  return lines.join('\n');
}

export async function notifyNewCar(car: Car) {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!tgEnabled() || !chatId) return;

  const site = siteUrl();
  const keyboard: any[][] = [
    [
      { text: '✅ Tasdiqlash', callback_data: `approve:${car.id}` },
      { text: '❌ Rad etish', callback_data: `reject:${car.id}` },
    ],
  ];
  if (isHttps(site)) keyboard.push([{ text: '🛠 Admin panel', url: `${site}/admin` }]);

  const text = carText(car);
  const reply_markup = { inline_keyboard: keyboard };

  if (car.images[0]) {
    const r = await tg('sendPhoto', {
      chat_id: chatId,
      photo: car.images[0],
      caption: text.slice(0, 1024),
      parse_mode: 'HTML',
      reply_markup,
    });
    if (r?.ok) return;
  }
  await tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup, disable_web_page_preview: true });
}

/** Bot tugmalari: https bo'lsa Mini App (web_app), aks holda oddiy havola */
export function openButton(text: string, path = '/') {
  const url = `${siteUrl()}${path}`;
  return isHttps(url) ? { text, web_app: { url } } : { text, url };
}
