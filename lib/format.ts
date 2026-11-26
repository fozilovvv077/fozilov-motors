import type { Currency } from './types';

const nf = new Intl.NumberFormat('ru-RU');

export function formatNumber(n: number) {
  return nf.format(Number(n) || 0).replace(/ /g, ' ');
}

export function formatPrice(price: number, currency: Currency) {
  return currency === 'USD' ? `$${formatNumber(price)}` : `${formatNumber(price)} so'm`;
}

export function formatPhone(p: string) {
  const m = String(p).match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}
