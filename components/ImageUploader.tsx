'use client';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { useRef, useState } from 'react';

export type UploadItem = { id: string; preview: string; url?: string; status: 'uploading' | 'done' | 'error'; error?: string };

const MAX_FILES = 10;

/** Rasmni brauzerda siqish: eng katta tomoni 1600px, JPEG 82% */
async function compress(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // masalan HEIC — asl holida yuboriladi
  }
}

async function upload(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('file', blob, 'car.jpg');
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || 'Yuklashda xato');
  return json.url;
}

export default function ImageUploader({
  items,
  setItems,
  error,
}: {
  items: UploadItem[];
  setItems: React.Dispatch<React.SetStateAction<UploadItem[]>>;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => f.type.startsWith('image/')).slice(0, MAX_FILES - items.length);
    for (const file of files) {
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      setItems((p) => [...p, { id, preview, status: 'uploading' }]);
      compress(file)
        .then((b) => {
          if (b.size > 4 * 1024 * 1024) throw new Error('Rasm juda katta (4MB dan ko\'p)');
          return upload(b);
        })
        .then((url) => setItems((p) => p.map((x) => (x.id === id ? { ...x, url, status: 'done' } : x))))
        .catch((e) => setItems((p) => p.map((x) => (x.id === id ? { ...x, status: 'error', error: e.message } : x))));
    }
  }

  const remove = (id: string) => setItems((p) => p.filter((x) => x.id !== id));

  return (
    <div>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        onClick={() => input.current?.click()}
        animate={{ scale: drag ? 1.02 : 1, borderColor: drag ? 'rgb(var(--accent))' : error ? '#ef4444' : 'rgb(var(--line))' }}
        whileHover={{ scale: 1.01 }}
        className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed bg-bg/50 px-6 py-10 text-center"
      >
        <motion.div animate={{ y: drag ? -8 : [0, -6, 0] }} transition={drag ? {} : { duration: 2.4, repeat: Infinity }} className="text-4xl">
          📸
        </motion.div>
        <div className="mt-3 font-bold">Rasmlarni shu yerga tashlang yoki bosing</div>
        <div className="mt-1 text-xs text-muted">
          {items.length}/{MAX_FILES} ta · JPG, PNG, WEBP · avtomatik siqiladi · birinchi rasm asosiy bo&apos;ladi
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />
      </motion.div>

      {items.length > 0 && (
        <Reorder.Group axis="x" values={items} onReorder={setItems} className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <Reorder.Item
                key={it.id}
                value={it}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileDrag={{ scale: 1.08, zIndex: 10 }}
                className="relative h-24 w-32 shrink-0 cursor-grab overflow-hidden rounded-xl border border-line bg-card active:cursor-grabbing"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">Asosiy</span>}
                {it.status === 'uploading' && (
                  <div className="absolute inset-0 grid place-items-center bg-black/55">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="h-7 w-7 rounded-full border-[3px] border-white/30 border-t-white" />
                  </div>
                )}
                {it.status === 'error' && (
                  <div className="absolute inset-0 grid place-items-center bg-red-600/80 p-1 text-center text-[10px] font-bold text-white">{it.error}</div>
                )}
                {it.status === 'done' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-1.5 left-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[11px] text-white">✓</motion.span>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(it.id); }}
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white transition-transform hover:scale-110"
                  aria-label="O'chirish"
                >
                  ✕
                </button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
