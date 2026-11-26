'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Car, CarInput, CarStatus } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/types';
import { formatDate, formatNumber, formatPhone, formatPrice } from '@/lib/format';
import CarFields from './CarFields';
import CountUp from './CountUp';
import RippleButton from './RippleButton';

type Tab = 'all' | CarStatus;
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'approved', label: 'Tasdiqlangan' },
  { id: 'sold', label: 'Sotilgan' },
  { id: 'rejected', label: 'Rad etilgan' },
];

const statusColor: Record<CarStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-500',
  approved: 'bg-emerald-500/15 text-emerald-500',
  sold: 'bg-sky-500/15 text-sky-500',
  rejected: 'bg-red-500/15 text-red-500',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('pending');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Car | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const notify = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 2600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cars', { cache: 'no-store', credentials: 'include' });
      if (res.status === 401) return router.replace('/admin/login');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCars(json.cars);
    } catch (e: any) {
      setError(e.message || 'Yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(
    () => ({
      total: cars.length,
      pending: cars.filter((c) => c.status === 'pending').length,
      approved: cars.filter((c) => c.status === 'approved').length,
      sold: cars.filter((c) => c.status === 'sold').length,
    }),
    [cars],
  );

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cars.filter(
      (c) =>
        (tab === 'all' || c.status === tab) &&
        (!s || `${c.id} ${c.brand} ${c.model} ${c.seller_name} ${c.seller_phone}`.toLowerCase().includes(s)),
    );
  }, [cars, tab, q]);

  async function patch(id: number, body: Partial<CarInput> & { status?: CarStatus }) {
    const res = await fetch(`/api/admin/cars/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.error || 'Xato'), { errors: json.errors });
    setCars((p) => p.map((c) => (c.id === id ? json.car : c)));
    return json.car as Car;
  }

  async function setStatus(c: Car, status: CarStatus) {
    try {
      await patch(c.id, { status });
      notify(`#${c.id} → ${STATUS_LABEL[status]}`);
    } catch (e: any) {
      notify(e.message, false);
    }
  }

  async function remove(c: Car) {
    if (!confirm(`#${c.id} ${c.brand} ${c.model} e'lonini butunlay o'chirasizmi?`)) return;
    const res = await fetch(`/api/admin/cars/${c.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setCars((p) => p.filter((x) => x.id !== c.id));
      notify("E'lon o'chirildi");
    } else notify("O'chirib bo'lmadi", false);
  }

  async function setupTelegram() {
    const res = await fetch('/api/admin/telegram-setup', { method: 'POST', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) notify('Telegram bot ulandi ✓');
    else notify(json.error || json.webhook || 'Telegram xatosi', false);
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="container-x py-6 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-4xl">Admin panel</h1>
          <p className="mt-1 text-sm text-muted">E&apos;lonlarni boshqarish</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RippleButton variant="ghost" onClick={load}>↻ Yangilash</RippleButton>
          <RippleButton variant="ghost" onClick={setupTelegram} title="Webhook va menyu tugmasini o'rnatadi">✈️ Telegram botni ulash</RippleButton>
          <RippleButton variant="danger" onClick={logout}>Chiqish</RippleButton>
        </div>
      </motion.div>

      {/* Statistika */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Jami e'lonlar", v: stats.total, c: 'text-fg' },
          { l: 'Kutilayotganlar', v: stats.pending, c: 'text-amber-500' },
          { l: 'Tasdiqlangan', v: stats.approved, c: 'text-emerald-500' },
          { l: 'Sotilgan', v: stats.sold, c: 'text-sky-500' },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -4 }}
            className="card p-5"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">{s.l}</div>
            <div className={`mt-2 font-display text-3xl font-extrabold ${s.c}`}>
              {loading ? '—' : <CountUp value={s.v} duration={0.8} />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tablar va qidiruv */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative isolate shrink-0 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${tab === t.id ? 'text-white' : 'text-muted hover:text-fg'}`}
            >
              {tab === t.id && <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-lg bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              {t.label}
              {t.id === 'pending' && stats.pending > 0 && <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-[11px]">{stats.pending}</span>}
            </button>
          ))}
        </div>
        <input className="field lg:max-w-xs" placeholder="Qidirish: ID, marka, telefon…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <div className="card mb-5 border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-500">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }} className="card h-28" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center text-muted">
          Bu bo&apos;limda e&apos;lonlar yo&apos;q
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                className="card flex flex-col gap-4 p-3 transition-colors hover:border-accent/40 sm:flex-row sm:items-center sm:p-4"
              >
                <button type="button" onClick={() => setEditing(c)} className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-line/40 sm:h-24 sm:w-36">
                  {c.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                  )}
                </button>
                {(c.status === 'approved' || c.status === 'sold') && (
                  <Link href={`/car/${c.id}`} target="_blank" className="hidden text-xs font-bold text-accent sm:order-last sm:block">
                    Ko&apos;rish ↗
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted">#{c.id}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusColor[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                    <span className="text-xs text-muted">{formatDate(c.created_at)}</span>
                  </div>
                  <div className="mt-1 truncate font-display font-bold">
                    {c.brand} {c.model} · {c.year}
                  </div>
                  <div className="text-sm font-bold text-accent">{formatPrice(c.price, c.currency)}</div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {formatNumber(c.mileage)} km · {c.seller_name} ·{' '}
                    <a href={`tel:${c.seller_phone}`} className="hover:text-accent">{formatPhone(c.seller_phone)}</a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {c.status !== 'approved' && c.status !== 'sold' && (
                    <RippleButton variant="success" className="px-3 py-2 text-xs" onClick={() => setStatus(c, 'approved')}>✓ Tasdiqlash</RippleButton>
                  )}
                  {c.status === 'pending' && (
                    <RippleButton variant="danger" className="px-3 py-2 text-xs" onClick={() => setStatus(c, 'rejected')}>✕ Rad etish</RippleButton>
                  )}
                  {c.status === 'approved' && (
                    <RippleButton variant="ghost" className="px-3 py-2 text-xs" onClick={() => setStatus(c, 'sold')}>🏁 Sotildi</RippleButton>
                  )}
                  {c.status === 'sold' && (
                    <RippleButton variant="ghost" className="px-3 py-2 text-xs" onClick={() => setStatus(c, 'approved')}>↺ Sotuvga qaytarish</RippleButton>
                  )}
                  <RippleButton variant="ghost" className="px-3 py-2 text-xs" onClick={() => setEditing(c)}>✎ Tahrirlash</RippleButton>
                  <RippleButton variant="danger" className="px-3 py-2 text-xs" onClick={() => remove(c)}>🗑</RippleButton>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {editing && (
          <EditModal
            car={editing}
            onClose={() => setEditing(null)}
            onSave={async (data) => {
              await patch(editing.id, data);
              setEditing(null);
              notify('Saqlandi ✓');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditModal({ car, onClose, onSave }: { car: Car; onClose: () => void; onSave: (d: CarInput) => Promise<void> }) {
  const [v, setV] = useState<CarInput>({ ...car });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function save() {
    setSaving(true);
    setErr('');
    try {
      await onSave(v);
    } catch (e: any) {
      setErr(e.message);
      if (e.errors) setErrors(e.errors);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-line bg-card p-5 sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">#{car.id} tahrirlash</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-line transition-transform hover:rotate-90">✕</button>
        </div>

        {v.images.length > 0 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {v.images.map((src) => (
              <div key={src} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {v.images.length > 1 && (
                  <button type="button" onClick={() => setV((p) => ({ ...p, images: p.images.filter((x) => x !== src) }))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <CarFields value={v} errors={errors} onChange={(k, val) => setV((p) => ({ ...p, [k]: val }))} />

        {err && <p className="mt-4 text-sm font-semibold text-red-500">{err}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <RippleButton variant="ghost" onClick={onClose}>Bekor qilish</RippleButton>
          <RippleButton onClick={save} disabled={saving}>{saving ? 'Saqlanmoqda…' : 'Saqlash'}</RippleButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
