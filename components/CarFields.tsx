'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { BRANDS, CONDITIONS, FUELS, TRANSMISSIONS, type CarInput } from '@/lib/types';
import { formatNumber } from '@/lib/format';

type Props = {
  value: CarInput;
  errors: Record<string, string>;
  onChange: <K extends keyof CarInput>(key: K, v: CarInput[K]) => void;
  showSeller?: boolean;
};

export function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0, x: [0, -5, 5, -3, 3, 0] }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-1.5 overflow-hidden text-xs font-semibold text-red-500"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const years = (() => {
  const y = new Date().getFullYear() + 1;
  return Array.from({ length: y - 1969 }, (_, i) => y - i);
})();

const digits = (s: string) => Number(s.replace(/\D/g, '').slice(0, 13)) || 0;

/** Avtomobil ma'lumotlari maydonlari — e'lon formasi va admin tahrirlashda umumiy */
export default function CarFields({ value: v, errors: e, onChange, showSeller = true }: Props) {
  const cls = (k: string) => `field ${e[k] ? 'field-error' : ''}`;
  const brandInList = BRANDS.includes(v.brand);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Marka *</label>
        <select
          className={cls('brand')}
          value={brandInList ? v.brand : v.brand ? 'Boshqa' : ''}
          onChange={(x) => onChange('brand', x.target.value === 'Boshqa' ? ' ' : x.target.value)}
        >
          <option value="">Tanlang</option>
          {BRANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
        {!brandInList && v.brand !== '' && (
          <motion.input
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cls('brand')} mt-2`}
            placeholder="Marka nomini yozing"
            value={v.brand.trim()}
            onChange={(x) => onChange('brand', x.target.value || ' ')}
          />
        )}
        <FieldError msg={e.brand} />
      </div>
      <div>
        <label className="label">Model *</label>
        <input className={cls('model')} placeholder="Masalan: Malibu 2" value={v.model} onChange={(x) => onChange('model', x.target.value)} />
        <FieldError msg={e.model} />
      </div>
      <div>
        <label className="label">Ishlab chiqarilgan yili *</label>
        <select className={cls('year')} value={v.year} onChange={(x) => onChange('year', Number(x.target.value))}>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <FieldError msg={e.year} />
      </div>
      <div>
        <label className="label">Probeg (km) *</label>
        <input className={cls('mileage')} inputMode="numeric" placeholder="0" value={v.mileage ? formatNumber(v.mileage) : ''} onChange={(x) => onChange('mileage', digits(x.target.value))} />
        <FieldError msg={e.mileage} />
      </div>
      <div>
        <label className="label">Rangi *</label>
        <input className={cls('color')} placeholder="Masalan: Oq" value={v.color} onChange={(x) => onChange('color', x.target.value)} />
        <FieldError msg={e.color} />
      </div>
      <div>
        <label className="label">Dvigatel hajmi (L) *</label>
        <input className={cls('engine')} inputMode="decimal" placeholder="Masalan: 1.5" value={v.engine} onChange={(x) => onChange('engine', x.target.value.replace(',', '.'))} />
        <FieldError msg={e.engine} />
      </div>
      <div>
        <label className="label">Yoqilg&apos;i turi *</label>
        <select className={cls('fuel')} value={v.fuel} onChange={(x) => onChange('fuel', x.target.value)}>
          {FUELS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <FieldError msg={e.fuel} />
      </div>
      <div>
        <label className="label">Uzatmalar qutisi *</label>
        <select className={cls('transmission')} value={v.transmission} onChange={(x) => onChange('transmission', x.target.value)}>
          {TRANSMISSIONS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <FieldError msg={e.transmission} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Holati *</label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <motion.button
              key={c}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange('condition', c)}
              className={`relative isolate rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${v.condition === c ? 'border-accent text-white' : 'border-line text-muted hover:text-fg'}`}
            >
              {v.condition === c && (
                <motion.span layoutId="cond-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative">{c}</span>
            </motion.button>
          ))}
        </div>
        <FieldError msg={e.condition} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Narxi *</label>
        <div className="flex gap-2">
          <input
            className={`${cls('price')} flex-1 font-display text-lg font-bold`}
            inputMode="numeric"
            placeholder="0"
            value={v.price ? formatNumber(v.price) : ''}
            onChange={(x) => onChange('price', digits(x.target.value))}
          />
          <div className="relative flex shrink-0 rounded-xl border border-line bg-card p-1">
            {(['USD', 'UZS'] as const).map((c) => (
              <button key={c} type="button" onClick={() => onChange('currency', c)} className={`relative z-10 rounded-lg px-4 text-sm font-bold transition-colors ${v.currency === c ? 'text-white' : 'text-muted'}`}>
                {v.currency === c && (
                  <motion.span layoutId="cur-pill" className="absolute inset-0 -z-10 rounded-lg bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                {c === 'USD' ? '$' : "so'm"}
              </button>
            ))}
          </div>
        </div>
        <FieldError msg={e.price} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Qo&apos;shimcha tavsif</label>
        <textarea
          className="field min-h-[110px] resize-y"
          maxLength={3000}
          placeholder="Avtomobil haqida qo'shimcha ma'lumot: komplektatsiya, kraska, ta'mirlar…"
          value={v.description}
          onChange={(x) => onChange('description', x.target.value)}
        />
      </div>
      {showSeller && (
        <>
          <div>
            <label className="label">Sotuvchi ismi *</label>
            <input className={cls('seller_name')} placeholder="Ismingiz" value={v.seller_name} onChange={(x) => onChange('seller_name', x.target.value)} />
            <FieldError msg={e.seller_name} />
          </div>
          <div>
            <label className="label">Telefon raqami *</label>
            <input
              className={cls('seller_phone')}
              type="tel"
              inputMode="tel"
              placeholder="+998 90 123 45 67"
              value={v.seller_phone}
              onChange={(x) => {
                let s = x.target.value.replace(/[^\d+ ]/g, '');
                if (!s.startsWith('+998')) s = '+998' + s.replace(/^\+?9?9?8?/, '');
                onChange('seller_phone', s.slice(0, 17));
              }}
            />
            <FieldError msg={e.seller_phone} />
          </div>
        </>
      )}
    </div>
  );
}
