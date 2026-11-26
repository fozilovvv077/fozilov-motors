import { CarInput, CONDITIONS, FUELS, TRANSMISSIONS } from './types';

export function normalizePhone(p: string): string {
  const d = String(p || '').replace(/[^\d+]/g, '');
  if (/^\d{9}$/.test(d)) return '+998' + d;
  if (/^998\d{9}$/.test(d)) return '+' + d;
  return d;
}

export function isValidPhone(p: string) {
  return /^\+998\d{9}$/.test(normalizePhone(p));
}

const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);
const num = (v: unknown) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

/** Mijoz va server tomonda bir xil ishlatiladigan tekshiruv */
export function validateCar(raw: any): { data: CarInput; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const year = num(raw?.year);
  const maxYear = new Date().getFullYear() + 1;

  const data: CarInput = {
    brand: str(raw?.brand, 60),
    model: str(raw?.model, 60),
    year,
    mileage: num(raw?.mileage),
    color: str(raw?.color, 40),
    fuel: str(raw?.fuel, 20),
    transmission: str(raw?.transmission, 20),
    engine: str(raw?.engine, 20),
    condition: str(raw?.condition, 20),
    description: str(raw?.description, 3000),
    price: num(raw?.price),
    currency: raw?.currency === 'UZS' ? 'UZS' : 'USD',
    images: Array.isArray(raw?.images)
      ? raw.images.filter((u: unknown) => typeof u === 'string' && /^https:\/\//.test(u)).slice(0, 10)
      : [],
    seller_name: str(raw?.seller_name, 60),
    seller_phone: normalizePhone(raw?.seller_phone),
  };

  if (data.brand.length < 2) errors.brand = 'Markani kiriting';
  if (data.model.length < 1) errors.model = 'Modelni kiriting';
  if (!Number.isFinite(year) || year < 1960 || year > maxYear) errors.year = `Yil 1960–${maxYear} oralig'ida bo'lsin`;
  if (!Number.isFinite(data.mileage) || data.mileage < 0 || data.mileage > 2_000_000) errors.mileage = "Probegni to'g'ri kiriting";
  if (data.color.length < 2) errors.color = 'Rangini kiriting';
  if (!FUELS.includes(data.fuel)) errors.fuel = "Yoqilg'i turini tanlang";
  if (!TRANSMISSIONS.includes(data.transmission)) errors.transmission = 'Uzatmalar qutisini tanlang';
  if (data.engine.length < 1) errors.engine = 'Dvigatel hajmini kiriting (masalan 1.5)';
  if (!CONDITIONS.includes(data.condition)) errors.condition = 'Holatini tanlang';
  if (!Number.isFinite(data.price) || data.price <= 0) errors.price = 'Narxni kiriting';
  else if (data.currency === 'USD' && data.price > 5_000_000) errors.price = 'Narx juda katta';
  if (data.images.length < 1) errors.images = 'Kamida 1 ta rasm yuklang';
  if (data.seller_name.length < 2) errors.seller_name = 'Ismingizni kiriting';
  if (!/^\+998\d{9}$/.test(data.seller_phone)) errors.seller_phone = 'Raqam +998 XX XXX XX XX formatida bo\'lsin';

  return { data, errors };
}
