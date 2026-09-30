// عنوان خادم الذكاء الاصطناعي.
// - على الويب: يبقى فارغاً فتُستخدم المسارات النسبية (/api/...) من نفس الخادم.
// - داخل تطبيق الأندرويد (APK): عيّن VITE_API_BASE_URL إلى عنوان الخادم المنشور
//   مثل https://katib.example.com ، وإلا يعمل التطبيق بالمحرك المحلي دون اتصال.
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
).replace(/\/+$/, '');

export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;

// عنوان فهرس المكتبة الجاهزة (catalog.json). على الويب يكفي المسار النسبي؛
// داخل الـ APK عيّن VITE_CATALOG_URL مثل https://<user>.github.io/<repo>/library/catalog.json
export const CATALOG_URL: string =
  (import.meta.env.VITE_CATALOG_URL as string | undefined) || '/library/catalog.json';
