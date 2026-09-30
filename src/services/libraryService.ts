import { CATALOG_URL } from '../config';
import type { Book } from '../types';
import { entryToBook, type BookPayload, type Catalog, type CatalogEntry } from './libraryConvert';

const CACHE_KEY = 'katib.catalog.v1';

function resolveUrl(path: string): string {
  return new URL(path, new URL(CATALOG_URL, window.location.href)).href;
}

/** يجلب فهرس المكتبة الجاهزة، ويحتفظ بنسخة محلية لتعمل القائمة دون اتصال. */
export async function fetchCatalog(): Promise<{ catalog: Catalog; fromCache: boolean }> {
  try {
    const res = await fetch(resolveUrl(CATALOG_URL), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const catalog = (await res.json()) as Catalog;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
    } catch {
      /* الحصة ممتلئة: لا مشكلة */
    }
    return { catalog, fromCache: false };
  } catch (err) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return { catalog: JSON.parse(cached) as Catalog, fromCache: true };
    } catch {
      /* تجاهل */
    }
    throw err;
  }
}

/** يحمّل نص كتاب من المكتبة ويحوّله إلى Book جاهز للحفظ محلياً. */
export async function downloadLibraryBook(entry: CatalogEntry): Promise<Book> {
  if (entry.tier === 'premium') throw new Error('هذا الكتاب متاح للمشتركين فقط');
  const res = await fetch(resolveUrl(entry.file));
  if (!res.ok) throw new Error(`تعذّر تحميل الكتاب (HTTP ${res.status})`);
  const payload = (await res.json()) as BookPayload;
  return entryToBook(entry, payload);
}
