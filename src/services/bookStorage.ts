import type { Book } from '../types';

// تخزين دائم على الجهاز (IndexedDB): سجل مستقل لكل كتاب حتى لا يُعاد كتابة المكتبة كلها عند كل تعديل.
const DB_NAME = 'katib-db';
const STORE = 'books';

let dbPromise: Promise<IDBDatabase> | null = null;
let lastSaved = new Map<string, Book>();

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** يقرأ كل الكتب المحفوظة؛ يعيد null إذا لم يتوفر التخزين أو لم يوجد شيء. */
export async function loadBooks(): Promise<Book[] | null> {
  try {
    const db = await openDb();
    const books = await new Promise<Book[]>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as Book[]);
      req.onerror = () => reject(req.error);
    });
    lastSaved = new Map(books.map((b) => [b.id, b]));
    return books;
  } catch (err) {
    console.warn('تعذّر قراءة التخزين المحلي:', err);
    return null;
  }
}

/** يحفظ الكتب المتغيرة فقط ويحذف المحذوفة. */
export async function saveBooks(books: Book[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const next = new Map<string, Book>();
    for (const b of books) {
      next.set(b.id, b);
      if (lastSaved.get(b.id) !== b) store.put(b);
    }
    for (const id of lastSaved.keys()) {
      if (!next.has(id)) store.delete(id);
    }
    await done(tx);
    lastSaved = next;
  } catch (err) {
    console.warn('تعذّر الحفظ في التخزين المحلي:', err);
  }
}

/** يطلب من المتصفح/النظام عدم مسح بيانات التطبيق تلقائياً. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* غير مدعوم */
  }
}
