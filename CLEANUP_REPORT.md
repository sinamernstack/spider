<!-- @format -->

# Cleanup Report - Spider SEO Tracker

**تاریخ:** 2025-12-29  
**وضعیت:** تکمیل شد

---

## 📋 خلاصهٔ یافته‌ها

### 1. فایل‌های بی‌استفاده (توصیه حذف)

#### Script کمکی‌ها (در حالت production لازم نیست)

- `src/scripts/check-results.ts` — استفاده شد فقط برای اسکن DB در توسعه
- `src/scripts/health-check.ts` — تکراری (health endpoint در index.ts موجود است)
- `src/scripts/test-services.ts` — فایل تست دستی (نیاز به واحد تست رسمی)
- `src/scripts/sync-db.ts` — برای عملیات دستی (کاربر‌های production از migration استفاده می‌کنند)

#### پیام‌های سفارشی (Seed data)

- `src/scripts/seed-sample-data.ts` — استفاده برای مثال فقط (می‌توان حذف یا به test suite حرکت داد)

---

### 2. کد تکراری و نامنظم

#### Controller / Routes تکرار

- `src/routes/projectRoutes.ts` — فقط برای سازگاری قدیمی؛ تمام کاری که می‌کند توسط `apiRoutes.ts` انجام می‌شود
- **توصیه:** `projectRoutes` را حذف و مسیرهای آن را به `apiRoutes` ادغام کنید

#### Middleware بی‌استفاده

- `src/middleware/index.ts` — بررسی کنید کدام middleware واقعاً استفاده شده است
  - اگر فقط `requestLogger` و `errorHandler` استفاده می‌شود، کدهای اضافی را پاک کنید

---

### 3. فایل‌های قدیمی یا نقش دوگانه

| فایل                            | مسئله                                       | پیشنهاد                             |
| ------------------------------- | ------------------------------------------- | ----------------------------------- |
| `src/scripts/full-setup.ts`     | ترکیب migrate + seed (نامشخص)               | بررسی محتوا و حذف یا استاندارد کردن |
| `src/scripts/run-migrations.ts` | نقش واضح اما ممکن است در setup.ts قرار گیرد | نگهدارید برای `npm run migrate:run` |
| `.env.example`                  | ایجاد نشده در repo                          | **اضافه کنید** برای سهولت setup     |

---

### 4. کد داخل فایل‌های فعال

#### `src/worker/scheduler.ts` و `scheduler-local.ts`

- هر دو فایل تقریباً یکسان هستند (یکی Redis + BullMQ، دیگری in-memory)
- **پیشنهاد:** اگر فقط در dev از local استفاده می‌کنید، یکی را پاک کنید

#### `src/worker/queue.ts` و `queue-local.ts`

- همان مسئله: دو نسخه متوازی
- **پیشنهاد:** یکی حذف کنید یا به صورت شرطی بارگذاری کنید

---

## ✅ اقدامات پیشنهادی

### مرحلهٔ 1: حذف فوری (ایمن)

```bash
rm src/scripts/check-results.ts        # ما در memory بررسی می‌کنیم
rm src/scripts/health-check.ts         # تکراری است
rm src/scripts/test-services.ts        # نیاز به تست رسمی
```

### مرحلهٔ 2: Merge و تمیز کردن

1. `apiRoutes` را به entry point اصلی برید (بدون `projectRoutes`)
2. `scheduler.ts` را قرار دهید (production) و `scheduler-local.ts` حذف کنید
3. `queue.ts` و `queue-local.ts` را در یک فایل شرطی قرار دهید

### مرحلهٔ 3: کمبود‌ها را پر کنید

1. ایجاد `.env.example` در root
2. بهبود `src/middleware/index.ts` (صرفاً استفاده‌شده‌ها)
3. بهبود دستورات `package.json` (حذف اسکریپت‌های کمکی)

---

## 📊 آمار

| دسته              | تعداد              | وضعیت               |
| ----------------- | ------------------ | ------------------- |
| Scripts توصیه حذف | 5                  | ✅ شناسایی          |
| Routes تکراری     | 1                  | ⚠️ نیاز Merge       |
| Worker Duplicates | 2                  | ⚠️ نیاز Consolidate |
| کمبود‌ها          | 1 (`.env.example`) | ❌ ساخته شود        |

---

## 🎯 نتیجه‌گیری

- **سازماندهی:** فایل‌ها منطقی و مرتب هستند
- **کد تکراری:** کم اما قابل بهبود (scheduler/queue)
- **بدهکاری:** حذف فایل‌های کمکی + merge routes

**پیشنهاد:** مرحلهٔ بعدی (B) را شروع کنید با focus روی consolidation و سپس UI.
