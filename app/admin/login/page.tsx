'use client';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Logo from '@/components/Logo';
import RippleButton from '@/components/RippleButton';
import { haptic } from '@/lib/tg-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Xatolik');
      haptic('success');
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      haptic('error');
      setError(err.message);
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x grid min-h-[75vh] place-items-center py-10">
      <motion.form
        key={shake}
        onSubmit={submit}
        initial={shake ? { x: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
        animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shake ? 0.45 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="card relative w-full max-w-sm overflow-hidden p-7"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <Logo />
          <h1 className="mt-6 font-display text-2xl font-extrabold">Admin panel</h1>
          <p className="mt-1 text-sm text-muted">Davom etish uchun tizimga kiring</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Login</label>
              <input className="field" autoComplete="username" autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </div>
            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <input
                  className="field pr-12"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted" aria-label="Parolni ko'rsatish">
                  {show ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden text-sm font-semibold text-red-500">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <RippleButton type="submit" disabled={loading} className="mt-6 w-full py-3.5">
            {loading ? 'Tekshirilmoqda…' : 'Kirish'}
          </RippleButton>
        </div>
      </motion.form>
    </div>
  );
}
