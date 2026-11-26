export type CarStatus = 'pending' | 'approved' | 'sold' | 'rejected';
export type Currency = 'UZS' | 'USD';

export interface CarInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  fuel: string;
  transmission: string;
  engine: string;
  condition: string;
  description: string;
  price: number;
  currency: Currency;
  images: string[];
  seller_name: string;
  seller_phone: string;
}

export interface Car extends CarInput {
  id: number;
  status: CarStatus;
  created_at: string;
}

export const BRANDS = [
  'Chevrolet', 'BYD', 'Kia', 'Hyundai', 'Toyota', 'Lexus', 'Mercedes-Benz', 'BMW', 'Audi',
  'Volkswagen', 'Lada', 'Haval', 'Chery', 'Geely', 'Tesla', 'Nissan', 'Mazda', 'Boshqa',
];
export const FUELS = ['Benzin', 'Metan', 'Propan', 'Dizel', 'Gibrid', 'Elektr'];
export const TRANSMISSIONS = ['Mexanika', 'Avtomat', 'Robot', 'Variator'];
export const CONDITIONS = ['Yangi', "A'lo", 'Yaxshi', "O'rtacha", "Ta'mir talab"];

export const STATUS_LABEL: Record<CarStatus, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  sold: 'Sotilgan',
  rejected: 'Rad etilgan',
};

export const EMPTY_CAR: CarInput = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  color: '',
  fuel: 'Benzin',
  transmission: 'Avtomat',
  engine: '',
  condition: 'Yaxshi',
  description: '',
  price: 0,
  currency: 'USD',
  images: [],
  seller_name: '',
  seller_phone: '+998',
};
