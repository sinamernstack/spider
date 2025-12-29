<!-- @format -->

راهنمای سریع — اسکافولد Express + TypeORM برای SEO Rank Tracker

فایل‌های ایجاد شده:

دستورالعمل اجرا:

1. نصب وابستگی‌ها:

```bash
npm install
```

2. یک دیتابیس PostgreSQL بسازید و `.env` را از `.env.example` بسازید و مقادیر را تنظیم کنید.

3. برای همگام‌سازی سریع (فقط در محیط توسعه) اجرا کنید:

```bash
npm run typeorm:sync
```

4. سرور در حالت توسعه اجرا کنید:

```bash
npm run dev
```

توضیحات کوتاه:

اگر بخواهید، من می‌توانم:

- اسکریپت خروجی/آرشیو پارتیشن‌ها به S3 (Parquet) آماده کنم.
  اگر بخواهید، من این سه کار را به ترتیب انجام دادم:

1. تولید مهاجرت اولیه (TypeORM migration)

- فایل: `src/migration/1682899200000-InitialSchema.ts`
- برای چه‌کاری است: اسکریپت SQL برای ایجاد تمام جدول‌ها و ایندکس‌های پایه که قبلاً طراحی شد. این فایل را می‌توان با `AppDataSource.runMigrations()` اجرا کرد.

2. پیاده‌سازی API پایه (Express + TypeORM)

- مسیرها: `src/routes/projectRoutes.ts` — شامل endpointهای `POST /projects`, `POST /projects/:id/keywords`, `POST /projects/:id/checks`, و `GET /projects/:id/keywords/:keywordId/ranks`.
- برای چه‌کاری است: مدیریت پروژه/کیورد و ایجاد runهای بررسی و واکشی سری‌زمانی رتبه‌ها برای تحلیل و نمودارها.

3. افزودن worker و scheduler ساده

- فایل‌ها: `src/worker/queue.ts`, `src/worker/scheduler.ts`.
- برای چه‌کاری است: استفاده از BullMQ برای صف‌بندی کارهای بررسی رتبه (rank checks) و نمونه کرون برای زمان‌بندی enqueue کردن کارها. منطق واقعی اسکرپ/استفاده از سرویس SERP در بخش worker قرار می‌گیرد.

دستورالعمل‌های اجرایی برای توسعه:

```bash
npm install
cp .env.example .env
# اجرای مهاجرت‌ها (یا همگام‌سازی):
node -r ts-node/register src/scripts/run-migrations.ts
# اجرای سرور در توسعه:
npm run dev
# اجرای worker:
node -r ts-node/register src/worker/queue.ts
# اجرای scheduler:
node -r ts-node/register src/worker/scheduler.ts
```

اگر بخواهید، گام بعدی می‌تواند باشد:

- تولید مهاجرت کامل و قابل اجرا از طریق CLI یا ابزار مهاجرت،
- پیاده‌سازی منطق واقعی scraper/سرویس SERP در worker و درج `rank_results`,
- یا نوشتن تست‌ها و مستندات API. بفرمایید کدام را می‌خواهید ادامه دهم؟

توضیح مراحل و فایل‌های جدید (خلاصه و فارسی):

1. شناسه‌ی یکتای شغل (idempotency)

- فایل: `src/utils/jobId.ts`
- هدف: تولید شناسه‌ای یکتا بر اساس `project_id`, `keyword_id`, `device`, `search_engine` و تاریخ تا از enqueue شدن jobهای تکراری جلوگیری شود. این کمک می‌کند jobها ایمن و idempotent باشند و در مقیاس افقی تکرارهای ناخواسته ایجاد نشود.

2. محدودکننده توزیع‌شده (Rate limiter)

- فایل: `src/worker/limiter.ts`
- هدف: جلوگیری از ارسال درخواست‌های هم‌زمان زیاد به یک دامنه/موتور که باعث بلاک شدن (ban) می‌شود. این پیاده‌سازی یک sliding-window ساده با Redis دارد (کلیدهای `rl:{key}:{windowStart}`) و قبل از هر فراخوانی worker این محدودیت را بررسی می‌کند. در صورت پر بودن پنجره، job خطا داده و سیستم با استراتژی backoff مجدداً تلاش می‌کند.

3. صف‌بندی واقعی و گزینه‌های job

- فایل‌ها: `src/worker/scheduler.ts`, `src/worker/queue.ts`.
- هدف: کرون‌جاب `scheduler` همه‌ی `rank_check` های موعد رسیده را اسکن کرده و برای هر کیورد یک job جداگانه با `jobId` یکتا ایجاد می‌کند. گزینه‌های job شامل `attempts: 5` و `backoff: { type: 'exponential', delay: 3000 }` است. Worker برای هر job قبل از فراخوانی خارجی، `limiter.acquireSlot()` را خواهد خواند؛ اگر slot وجود نداشته باشد، job با خطای `RATE_LIMITED` می‌شکند و BullMQ از سیاست retry/backoff پیروی می‌کند.

دستورات اجرای سریع (توسعه):

```bash
npm install
cp .env.example .env
# اجرای مهاجرت‌ها یا همگام‌سازی اگر لازم است:
node -r ts-node/register src/scripts/run-migrations.ts
# اجرای وب‌سرور:
npm run dev
# اجرای worker (فرآیند جدا):
node -r ts-node/register src/worker/queue.ts
# اجرای scheduler (زمان‌بندی‌کننده):
node -r ts-node/register src/worker/scheduler.ts
```

گام‌های پیشنهادی بعدی (من می‌توانم آن‌ها را بسازم):

- افزودن صف Dead-Letter (DLQ) و یک endpoint ساده/صفحه مدیریتی برای بازبینی jobهای ناموفق،
- ارتقاء limiter به token-bucket با Lua script در Redis برای دقت و قابلیت بازگشت بهتر،
- پیاده‌سازی منطق واقعی scraper در worker با پشتیبانی از proxy rotation، حل CAPTCHA و درج `rank_results` و `serp_snapshots` در دیتابیس.

بفرمایید کدامیک را می‌خواهید ادامه دهم؟

برای راحتی تست و دیباگ محلی، یک اسکریپت نمونه اضافه کردم که سه پروژه نمونه را در دیتابیس می‌سازد.

اجرای seed سه پروژه نمونه:

```bash
npm run seed:sample
```

چه کاری انجام می‌دهد:

- سه دامنه و سه پروژه ایجاد می‌کند (هر پروژه چند کیورد)،
- یک دامنه‌ی رقبا برای هر پروژه می‌سازد،
- یک `rank_check` برای هر پروژه زمان‌بندی می‌کند تا scheduler آنها را enqueue کند.

پس از اجرای seed:

- اجرا کنید `npm run migrate:run` (اگر قبلاً نکرده‌اید)،
- سپس `npm run worker:start` و `npm run scheduler:start` را در ترمینال‌های جداگانه اجرا کنید تا jobها تولید و پردازش شوند.

بعد از اجرا، لاگ‌ها را نگاه کنید و اگر jobها در DLQ یا با خطا مواجه شدند، خروجی را ارسال کنید تا رفع کنم.

خواسته بعدی را بگویید: ارتقاء limiter به token-bucket (Lua)، پیاده‌سازی proxy+captcha، یا UI برای DLQ؟
