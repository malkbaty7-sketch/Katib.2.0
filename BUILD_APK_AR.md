# بناء ملف APK لتطبيق كاتب

المسار المعتمد: تطبيق الويب (React) مغلَّف بـ **Capacitor** ويُبنى تلقائياً على GitHub Actions.

## الطريقة الأسهل (بدون تثبيت شيء على جهازك)
1. ارفع المشروع إلى مستودع GitHub (فرع `main`).
2. افتح تبويب **Actions** ← **Build Android APK (Capacitor)** ← **Run workflow** (أو ادفع أي تعديل).
3. بعد انتهاء البناء نزّل الملف من **Artifacts**: `katib-debug-apk` ← ثبّته مباشرة على الهاتف.

## ميزات الذكاء الاصطناعي داخل الـ APK
الـ APK لا يحتوي خادماً. لتفعيل Gemini:
1. انشر `server.ts` على أي استضافة Node (Cloud Run / Render / Railway) مع `GEMINI_API_KEY`.
2. في GitHub: Settings ← Secrets and variables ← Actions ← Variables ← أضف `API_BASE_URL` = عنوان الخادم.
دون ذلك يعمل التطبيق بالمحرك المحلي دون اتصال (كما صُمّم).

## المكتبة الجاهزة والحفظ على الجهاز
- كتب المستخدم تُحفظ الآن **دائماً على الجهاز** (IndexedDB) ولا تضيع عند إغلاق التطبيق.
- المكتبة الجاهزة تُحمَّل عند الطلب من فهرس على GitHub Pages. الخطوات في `tools/library/README_AR.md`.
- أضف متغير `CATALOG_URL` في GitHub (Settings ← Variables) قبل بناء الـ APK.

## نسخة موقّعة للنشر (Release)
أنشئ مفتاحاً بـ `keytool` ثم أضف في Secrets:
`KEYSTORE_BASE64` (الملف بصيغة base64) و `KEY_ALIAS` و `KEYSTORE_PASSWORD` و `KEY_PASSWORD`.
سيُنتج البناء أيضاً `katib-release-apk` موقّعاً.

## البناء محلياً
يتطلب Node 22 و JDK 21 و Android Studio:
```bash
bun install
bun run build
npx cap add android      # مرة واحدة
npx cap sync android
npx cap open android     # ثم Build > Build APK
```

## نسخة Flutter (katib_app)
أُنشئ لها هيكل أندرويد كامل داخل `katib_app/android` (Gradle وManifest وMainActivity وأيقونات وشاشة بداية).
- البناء: workflow **Flutter APK (katib_app)** في Actions، أو محلياً: `cd katib_app && flutter pub get && flutter build apk --release`.
- مفتاح Gemini (اختياري): أضف سر `GEMINI_API_KEY` في GitHub.
- لم يُختبر البناء بعد. Firebase لن يعمل حتى تضيف `android/app/google-services.json` وتفعّل إضافة google-services.
- خطوط Cairo وTajawal غير موجودة (.ttf)؛ ضعها في `assets/fonts` وأزل التعليق عن قسم fonts في `pubspec.yaml`.
- للتوقيع الرسمي: أنشئ `android/key.properties` كما في `katib_app/RELEASE_GUIDE.md`.
