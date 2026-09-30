import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Download, CheckCircle, Lock, RefreshCw, WifiOff } from 'lucide-react';
import type { Book } from '../types';
import type { Catalog, CatalogEntry } from '../services/libraryConvert';
import { LIBRARY_ID_PREFIX } from '../services/libraryConvert';
import { downloadLibraryBook, fetchCatalog } from '../services/libraryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ownedIds: Set<string>;
  onAddBook: (book: Book) => void;
}

const LICENSE_LABEL: Record<string, string> = {
  'public-domain': 'ملك عام',
  manual: 'بترخيص خاص',
};

export const ReadyLibraryModal: React.FC<Props> = ({ isOpen, onClose, ownedIds, onAddBook }) => {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [itemError, setItemError] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCatalog();
      setCatalog(res.catalog);
      setFromCache(res.fromCache);
    } catch {
      setError('تعذّر تحميل المكتبة الجاهزة. تحقق من اتصالك بالإنترنت ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !catalog) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = catalog?.books ?? [];
    return q
      ? all.filter((b) => [b.title, b.author, b.category, b.description].some((f) => f.toLowerCase().includes(q)))
      : all;
  }, [catalog, query]);

  const handleDownload = async (entry: CatalogEntry) => {
    setBusyId(entry.id);
    setItemError((prev) => ({ ...prev, [entry.id]: '' }));
    try {
      onAddBook(await downloadLibraryBook(entry));
    } catch (e) {
      setItemError((prev) => ({ ...prev, [entry.id]: e instanceof Error ? e.message : 'فشل التحميل' }));
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-3xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="font-cairo font-extrabold text-lg text-stone-900 dark:text-stone-100">المكتبة الجاهزة</h2>
            <p className="font-tajawal text-xs text-stone-500 dark:text-stone-400">حمّل الكتب إلى جهازك واقرأها دون إنترنت</p>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في المكتبة الجاهزة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-sm font-tajawal focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {fromCache && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-tajawal">
              <WifiOff className="w-3.5 h-3.5" /> تعرض قائمة محفوظة؛ الاتصال مطلوب لتحميل كتب جديدة.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
          {loading && <p className="text-center py-10 text-sm font-tajawal text-stone-500">جارٍ تحميل القائمة...</p>}

          {error && (
            <div className="text-center py-10">
              <p className="text-sm font-tajawal text-red-600 dark:text-red-400 mb-3">{error}</p>
              <button onClick={() => void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-cairo font-bold">
                <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
              </button>
            </div>
          )}

          {!loading && !error && catalog && entries.length === 0 && (
            <p className="text-center py-10 text-sm font-tajawal text-stone-500">لا توجد كتب مطابقة.</p>
          )}

          {entries.map((entry) => {
            const owned = ownedIds.has(LIBRARY_ID_PREFIX + entry.id);
            const locked = entry.tier === 'premium';
            const busy = busyId === entry.id;
            const mb = Math.max(0.1, entry.sizeBytes / 1_048_576).toFixed(1);
            return (
              <div key={entry.id} className="flex gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40">
                <div className={`w-14 h-20 shrink-0 rounded-lg bg-gradient-to-br ${entry.coverGradient} flex items-center justify-center text-white/90 font-cairo font-bold text-[10px] text-center px-1`}>
                  {entry.title}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-cairo font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{entry.title}</h3>
                  <p className="font-tajawal text-xs text-stone-500 dark:text-stone-400">{entry.author} • {entry.category}</p>
                  <p className="font-tajawal text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2">{entry.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-cairo text-stone-500">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      {LICENSE_LABEL[entry.license] ?? entry.license}
                    </span>
                    <span>{entry.wordCount.toLocaleString('ar')} كلمة</span>
                    <span>{mb} م.ب</span>
                  </div>
                  {itemError[entry.id] && <p className="mt-1 text-[11px] text-red-600 font-tajawal">{itemError[entry.id]}</p>}
                </div>
                <div className="self-center">
                  {owned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-cairo font-bold text-emerald-600"><CheckCircle className="w-4 h-4" /> تم التحميل</span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-cairo font-bold text-stone-400"><Lock className="w-4 h-4" /> للمشتركين</span>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => void handleDownload(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-cairo font-bold"
                    >
                      <Download className="w-3.5 h-3.5" /> {busy ? 'جارٍ...' : 'تحميل'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
