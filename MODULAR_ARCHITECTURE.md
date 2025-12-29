<!-- @format -->

# 🏗️ Modular Architecture - SEO Rank Tracker

تاریخ بروزرسانی: 29 دسامبر 2025

## 📋 ساختار ماژولار

```
src/
├── controllers/
│   └── projectController.ts      # Controllers برای projects
├── services/
│   └── index.ts                  # Business logic services
├── routes/
│   ├── projects.ts               # (Legacy) - نسخه قدیمی
│   └── projectRoutes.ts          # نسخه جدید ماژولار
├── middleware/
│   └── index.ts                  # Middleware ها
├── entities/                     # Database entities
├── worker/                       # Worker processes
├── scripts/                      # Utility scripts
├── utils/                        # Helper functions
└── index.ts                      # Entry point
```

---

## 🎯 اجزای اصلی

### 1. **Controllers** (`src/controllers/projectController.ts`)

Controllers مسئول دریافت و پاسخ دادن به HTTP requests هستند.

**تابع‌های اصلی:**

- `createProject()` - ایجاد پروژه جدید
- `addKeywordToProject()` - اضافه کردن کلیدواژه به پروژه
- `createRankCheck()` - ایجاد rank check
- `getKeywordRanks()` - دریافت نتایج rank

**مثال:**

```typescript
POST /projects
{
  "name": "My Project",
  "domain_id": "uuid",
  "owner_id": "uuid"
}
```

---

### 2. **Services** (`src/services/index.ts`)

Services حاوی business logic و database operations هستند.

**سرویس‌های موجود:**

#### **ProjectService**

```typescript
-createProject(name, domain_id, owner_id) -
  getProject(projectId) -
  getAllProjects();
```

#### **KeywordService**

```typescript
-addKeyword(projectId, keyword, language, normalizedKeyword) -
  getKeywordsByProject(projectId);
```

#### **RankCheckService**

```typescript
-createRankCheck(projectId, scheduledAt) - getPendingChecks();
```

#### **RankResultService**

```typescript
-getRanksByKeyword(projectId, keywordId, options) - saveRankResult(result);
```

**مثال استفاده:**

```typescript
const projectService = new ProjectService();
const project = await projectService.createProject("Name", "domain_id");
```

---

### 3. **Routes** (`src/routes/projectRoutes.ts`)

Routes مسیرهای HTTP را تعریف می‌کند و آن‌ها را به controllers متصل می‌کند.

**Endpoints:**

```
POST   /projects                              - Create project
POST   /projects/:projectId/keywords          - Add keyword
POST   /projects/:projectId/checks            - Create rank check
GET    /projects/:projectId/keywords/:keywordId/ranks - Get ranks
```

---

### 4. **Middleware** (`src/middleware/index.ts`)

Middleware‌ها برای کنترل flow و error handling استفاده می‌شوند.

**Middleware‌های موجود:**

#### **ensureDbInitialized**

- مطمئن می‌شود database connected است
- Runs قبل از هر request

#### **errorHandler**

- Centralized error handling
- Response‌ها با proper status codes

#### **requestLogger**

- Logs تمام incoming requests
- شامل timestamp, method, و path

---

## 🔄 Request Flow

```
Request
   ↓
requestLogger (Middleware)
   ↓
ensureDbInitialized (Middleware)
   ↓
Route Handler
   ↓
Controller (جز projectController)
   ↓
Service (Business Logic)
   ↓
Database
   ↓
Response
```

---

## 📝 بهترین شیوه‌ها

### 1. **Error Handling**

```typescript
try {
  // Business logic
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Friendly message", details: String(error) });
}
```

### 2. **Type Safety**

تمام functions دارای return types و parameter types هستند.

### 3. **Separation of Concerns**

- Controllers: HTTP logic فقط
- Services: Database و business logic
- Routes: Route definitions فقط
- Middleware: Request processing

### 4. **Dependency Injection**

Services می‌تواند بهتر با Dependency Injection manage شود.

---

## 🧪 تست کردن API

### 1. Create Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "domain_id": "domain-uuid",
    "owner_id": "owner-uuid"
  }'
```

### 2. Add Keyword

```bash
curl -X POST http://localhost:3000/projects/{projectId}/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "test keyword",
    "language": "en"
  }'
```

### 3. Create Rank Check

```bash
curl -X POST http://localhost:3000/projects/{projectId}/checks \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_at": "2025-12-29T10:00:00Z"
  }'
```

### 4. Get Rank Results

```bash
curl http://localhost:3000/projects/{projectId}/keywords/{keywordId}/ranks?limit=10
```

---

## 🔧 نکات تکنیکی

### Dependency Management

اگر در آینده Dependency Injection Framework استفاده شود:

```typescript
// With DI
constructor(
  private projectService: ProjectService,
  private keywordService: KeywordService
) {}
```

### Extending Services

برای اضافه کردن service جدید:

```typescript
export class NewService {
  private repo: Repository<Entity>;
  constructor() {
    this.repo = AppDataSource.getRepository(Entity);
  }
  async method() {
    /* ... */
  }
}
```

### Adding Middleware

```typescript
app.use(newMiddleware); // Global
router.use(newMiddleware); // Route-specific
```

---

## ✅ فایل‌های جدید ایجاد‌شده

- ✅ `src/controllers/projectController.ts`
- ✅ `src/services/index.ts`
- ✅ `src/middleware/index.ts`
- ✅ `src/routes/projectRoutes.ts`

## ✅ فایل‌های بروزرسانی‌شده

- ✅ `src/index.ts` (به middleware ها متصل شد)

---

## 🚀 دستورات مفید

```bash
# Build
npm run build

# Development mode
npm run dev

# Start production
npm run start

# Health check
npm run check:infra

# Seed data
npm run seed:sample
```

---

**وضعیت:** ✅ تمام مشکلات حل شد - آماده برای استفاده
