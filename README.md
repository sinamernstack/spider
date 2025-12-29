<!-- @format -->

# 🕷️ Spider - SEO Rank Tracker

## مخزن منبع رفتار شده شامل بوت خز در وب و ردگیری رتبه SEO

---

## 📋 فهرست

- [نمای کلی](#نمای-کلی)
- [ویژگی‌ها](#ویژگی‌ها)
- [شروع سریع](#شروع-سریع)
- [معماری](#معماری)
- [API Endpoints](#api-endpoints)
- [توسعه](#توسعه)
- [مستندات](#مستندات)

---

## 🎯 نمای کلی

**Spider** یک پلتفرم ردگیری رتبه SEO مبتنی بر Node.js و Express است که:

- ✅ مدیریت پروژه‌ها و کلیدواژه‌ها
- ✅ رتبه‌بندی اتومات دراینتجینز
- ✅ ردگیری سری‌زمانی نتایج
- ✅ سرویس‌های پس‌زمینه (Queue + Scheduler)
- ✅ معماری ماژولار قابل توسعه

---

## ✨ ویژگی‌ها

### 🏗️ معماری ماژولار

```
Controllers → Services → Repositories → Database
```

### 🔒 Type Safety

- TypeScript strict mode
- Full type annotations
- No `any` types

### 🛡️ Error Handling

- Centralized middleware
- Graceful error responses
- Request logging

### ✔️ Input Validation

- 5 dedicated validators
- Request parameter checking
- Type coercion prevention

### 📊 Database

- PostgreSQL + TypeORM
- Migration system
- Complex queries with QueryBuilder

### 🔄 Background Jobs

- BullMQ for task queues
- Cron scheduler
- Rate limiting per domain

---

## 🚀 شروع سریع

### نیازمندی‌ها

```bash
Node.js v18+
PostgreSQL 13+
Redis 6+
```

### نصب و تنظیم

```bash
# 1. Clone repository
git clone <repo>
cd spider

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your settings
# DATABASE_HOST=your-host
# DATABASE_PASSWORD=your-password
# etc.

# 5. Build
npm run build

# 6. Setup database
npm run migrate:run
npm run seed:sample

# 7. Start server
npm run dev
```

### اولین Request

```bash
# Health check
curl http://localhost:3000/health

# Create project
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","domain_id":"uuid"}'
```

---

## 🏗️ معماری

### لایه‌های نرم‌افزار

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└──────────────┬──────────────────────┘
               │
        ┌──────▼────────┐
        │   Middleware  │
        │  (Logger)     │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │  Middleware   │
        │  (DB Init)    │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │   Routes      │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │  Validators   │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │  Controllers  │ ← HTTP Logic
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │   Services    │ ← Business Logic
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │ Repositories  │ ← DB Access
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │   Database    │ ← PostgreSQL
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │   Response    │
        └───────────────┘
```

### فایل‌های اصلی

| فایل               | مسئولیت               |
| ------------------ | --------------------- |
| `src/controllers/` | HTTP request handlers |
| `src/services/`    | Business logic        |
| `src/middleware/`  | Request processing    |
| `src/routes/`      | URL definitions       |
| `src/entities/`    | Database schemas      |
| `src/worker/`      | Background tasks      |
| `src/scripts/`     | Utilities             |

---

## 🔌 API Endpoints

### Projects

#### Create Project

```
POST /projects
Content-Type: application/json

{
  "name": "string",
  "domain_id": "uuid",
  "owner_id": "uuid" (optional)
}

Response: 201 Created
{
  "id": "uuid",
  "name": "string",
  "domain": { "id": "uuid" },
  "status": 1,
  "created_at": "ISO 8601"
}
```

### Keywords

#### Add Keyword

```
POST /projects/{projectId}/keywords
{
  "keyword": "string",
  "language": "string" (optional),
  "normalized_keyword": "string" (optional)
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "keyword": "string",
  "normalized_keyword": "string",
  "language": "string"
}
```

### Rank Checks

#### Create Rank Check

```
POST /projects/{projectId}/checks
{
  "scheduled_at": "ISO 8601" (optional)
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "scheduled_at": "ISO 8601",
  "status": 0
}
```

### Rank Results

#### Get Keyword Ranks

```
GET /projects/{projectId}/keywords/{keywordId}/ranks?limit=10&from=2025-01-01&to=2025-12-31

Query Parameters:
  - limit: number (optional)
  - from: ISO 8601 date (optional)
  - to: ISO 8601 date (optional)

Response: 200 OK
[
  {
    "id": 1,
    "position": 1,
    "result_url": "string",
    "result_title": "string",
    "checked_at": "ISO 8601"
  },
  ...
]
```

---

## 🔧 توسعه

### Adding New Controller

```typescript
// src/controllers/newController.ts
import { Request, Response } from "express";
import { MyService } from "../services";

const service = new MyService();

export const myHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.doSomething();
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Operation failed" });
  }
};
```

### Adding New Service

```typescript
// src/services/index.ts
export class MyService {
  private repo = AppDataSource.getRepository(MyEntity);

  async doSomething() {
    return await this.repo.find();
  }
}
```

### Adding New Route

```typescript
// src/routes/myRoutes.ts
import { Router } from "express";
import { myHandler } from "../controllers/newController";

const router = Router();
router.get("/", myHandler);
export default router;
```

### Register in App

```typescript
// src/index.ts
import myRoutes from "./routes/myRoutes";
app.use("/my-path", myRoutes);
```

---

## 📊 Database Schema

### Main Tables

- `domains` - Tracked domains
- `projects` - User projects
- `keywords` - Keywords to track
- `rank_checks` - Scheduled checks
- `rank_results` - Check results (time-series)
- `serp_snapshots` - Raw SERP data
- `competitors` - Competitor domains

### Relationships

```
Domain
  ↓
Project ← Keywords
  ↓
Rank Check → Rank Results
       ↓
  SERP Snapshots
```

---

## 🧪 تست

### Test Services

```bash
npm run test:services
```

### Health Check

```bash
npm run check:infra
```

### Manual Testing

```bash
# Create project
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","domain_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

---

## 📚 مستندات

| فایل                      | توضیح             |
| ------------------------- | ----------------- |
| `MODULAR_ARCHITECTURE.md` | معماری ماژولار    |
| `REFACTORING_SUMMARY.md`  | تغییرات انجام‌شده |
| `GETTING_STARTED.md`      | نقشه راه شروع     |
| `COMPLETION_REPORT.md`    | گزارش نهایی       |
| `DEBUG_REPORT.md`         | مشکلات حل‌شده     |

---

## 🛠️ npm Scripts

```bash
npm run build              # TypeScript compilation
npm run start              # Production server
npm run dev                # Development with auto-reload
npm run test:services      # Test service layer
npm run check:infra        # Test DB connection
npm run migrate:run        # Run migrations
npm run seed:sample        # Load sample data
npm run worker:start       # Start queue worker
npm run scheduler:start    # Start cron scheduler
```

---

## 🌍 Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=faq666
DATABASE_NAME=seo_rank

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
NODE_ENV=development

# Workers
WORKER_CONCURRENCY=5

# SERP API (Optional)
SERP_API_URL=https://api.example.com
SERP_API_KEY=your-key
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Test connection
npm run check:infra
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Type Errors

```bash
# Clear and rebuild
rm -rf dist
npm run build
```

---

## 📈 Performance

- Query optimization with QueryBuilder
- Connection pooling ready
- Rate limiting per domain
- Queue-based processing
- Cron scheduling

---

## 🔐 Security

- ✅ Input validation
- ✅ Type safety
- ✅ Error masking
- ⚠️ TODO: Authentication
- ⚠️ TODO: CORS
- ⚠️ TODO: Rate limiting

---

## 📝 License

MIT License - See LICENSE file

---

## 👨‍💻 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📞 Support

- 📖 Documentation: See GETTING_STARTED.md
- 🐛 Issues: Check GitHub issues
- 💬 Discussions: Use GitHub discussions

---

## 🎉 Status

✅ **Project Status:** Development Ready

- Architecture: Modular & Scalable
- Build: Passing
- Tests: Ready
- Documentation: Complete

---

**Made with ❤️ by the simba**

آخرین به‌روزرسانی: 29 دسامبر 2025
