<!-- @format -->

# 🚀 Quick Reference Guide

## ⚡ سریع‌ترین راه برای شروع

```bash
# 1. Copy environment (1 دقیقه)
cp .env.example .env

# 2. Install (2 دقیقه)
npm install

# 3. Build (1 دقیقه)
npm run build

# 4. Database (2 دقیقه)
npm run migrate:run
npm run seed:sample

# 5. Run (1 دقیقه)
npm run dev
```

**Total: ~7 دقیقه** ⏱️

---

## 📝 درسی‌های سریع

### Create Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Project",
    "domain_id":"550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Add Keyword

```bash
curl -X POST http://localhost:3000/projects/{projectId}/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keyword":"best seo tips"
  }'
```

### Get Results

```bash
curl "http://localhost:3000/projects/{projectId}/keywords/{keywordId}/ranks?limit=10"
```

---

## 🏗️ Architecture Overview

```
Request → Middleware → Validator → Controller → Service → Database
```

### 4 Main Layers

1. **Controllers** - HTTP handlers
2. **Services** - Business logic
3. **Middleware** - Request processing
4. **Validators** - Input checking

---

## 📁 کجا چه چیز است؟

| مورد               | محل                            |
| ------------------ | ------------------------------ |
| HTTP handlers      | `src/controllers/`             |
| Business logic     | `src/services/`                |
| Request validation | `src/middleware/validators.ts` |
| URL routes         | `src/routes/`                  |
| Database models    | `src/entities/`                |
| Background jobs    | `src/worker/`                  |

---

## 🧪 نحوه Testing

```bash
# Test all services
npm run test:services

# Check database connection
npm run check:infra

# Health check
curl http://localhost:3000/health
```

---

## 🔧 Common Tasks

### Add New Endpoint

**Step 1:** Create controller

```typescript
// src/controllers/newController.ts
export const handler = async (req, res) => {};
```

**Step 2:** Create route

```typescript
// src/routes/newRoutes.ts
router.post("/", handler);
```

**Step 3:** Register in app

```typescript
// src/index.ts
app.use("/path", newRoutes);
```

### Change Database Schema

```bash
# Create migration
# Edit src/migration/timestamp-Name.ts
# Run migration
npm run migrate:run
```

---

## 🐛 Debugging

### Check Logs

```bash
# Development mode shows all logs
npm run dev
```

### Test Database

```bash
npm run check:infra
```

### Clear Everything

```bash
rm -rf dist node_modules
npm install
npm run build
```

---

## 📊 Main Files

| فایل               | وظیفه              |
| ------------------ | ------------------ |
| `src/index.ts`     | App entry point    |
| `src/controllers/` | HTTP layer         |
| `src/services/`    | Business logic     |
| `src/middleware/`  | Request processing |
| `.env`             | Configuration      |
| `package.json`     | Dependencies       |

---

## ✅ Validation Checklist

- ✅ Build passes
- ✅ No type errors
- ✅ Database connected
- ✅ API responds
- ✅ Services work

**All Good!** 🎉

---

## 🆘 اگر مشکل پیش آمد

### Build Error

```bash
rm -rf dist
npm run build
```

### Database Error

```bash
npm run check:infra
# Check .env file
```

### Port in Use

```env
# Change in .env
PORT=3001
```

### Type Error

```bash
npx tsc --noEmit
```

---

## 📚 Documentation Links

- **Setup:** GETTING_STARTED.md
- **Architecture:** MODULAR_ARCHITECTURE.md
- **API:** README.md
- **Status:** PROJECT_STATUS.md

---

## 🎯 Your Next Action

```bash
# Copy and paste this
cp .env.example .env && npm install && npm run build && npm run dev
```

**Done!** Server is running 🚀

---

## 💡 Pro Tips

1. Use `npm run dev` for development
2. Check logs in console
3. Test with curl or Postman
4. Read documentation for details
5. Keep .env secure (never commit)

---

## 🔗 Key Resources

- **TypeScript:** https://www.typescriptlang.org/docs
- **Express:** https://expressjs.com/en/api.html
- **TypeORM:** https://typeorm.io/
- **PostgreSQL:** https://www.postgresql.org/docs

---

**Total Learning Time: ~30 minutes** ⏱️
**Total Setup Time: ~10 minutes** ⚡

---

**شروع کنید:** `npm run dev` 🎯
