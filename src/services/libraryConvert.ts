import type { Book, Chapter } from '../types';

export interface CatalogEntry {
  id: string;
  title: string;
  author: string;
  category: string;
  tier: 'free' | 'premium';
  license: string;
  description: string;
  coverGradient: string;
  wordCount: number;
  chapterCount: number;
  file: string;
  sizeBytes: number;
}

export interface Catalog {
  version: number;
  books: CatalogEntry[];
}

export interface BookPayload {
  id: string;
  chapters: { id: string; title: string; plainText: string; wordCount: number }[];
}

export const LIBRARY_ID_PREFIX = 'lib-';
const WORDS_PER_PAGE = 250;

/** يحوّل كتاباً من المكتبة الجاهزة إلى كائن Book الذي يفهمه التطبيق */
export function entryToBook(entry: CatalogEntry, payload: BookPayload, now = Date.now()): Book {
  const chapters: Chapter[] = payload.chapters.map((c, i) => ({
    id: c.id,
    title: c.title,
    orderIndex: i,
    contentJson: JSON.stringify({ ops: [{ insert: c.plainText + '\n' }] }),
    plainText: c.plainText,
    content: c.plainText,
    wordCount: c.wordCount,
  }));
  const wordCount = chapters.reduce((sum, c) => sum + c.wordCount, 0);
  return {
    id: LIBRARY_ID_PREFIX + entry.id,
    title: entry.title,
    author: entry.author,
    category: entry.category,
    coverGradient: entry.coverGradient,
    coverPattern: 'arabesque',
    totalPages: Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE)),
    currentPage: 0,
    wordCount,
    targetWordCount: wordCount,
    status: 'reading',
    lastModified: 'أُضيف من المكتبة الجاهزة',
    lastModifiedTimestamp: now,
    format: 'epub', // يُفتح في القارئ وليس في محرر التأليف
    description: entry.description,
    chapters,
    isFavorite: false,
    librarySourceId: entry.id,
    license: entry.license,
  };
}
