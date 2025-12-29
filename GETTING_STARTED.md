<!-- @format -->

# 📖 نقشه راه استفاده (Roadmap)

## 🎯 مراحل اجرا

### مرحله 1️⃣: تنظیم ابتدایی

```bash
# نصب dependencies
npm install

# کپی کردن environment template
cp .env.example .env

# تنظیم database credentials
# Edit .env with your actual values
```

### مرحله 2️⃣: Build & Compile

```bash
# TypeScript compilation
npm run build

# یا development mode (with auto-reload)
npm run dev
```

### مرحله 3️⃣: Database Setup

```bash
# Health check (verify DB connection)
npm run check:infra

# Run migrations
npm run migrate:run

# Seed sample data
npm run seed:sample
```

### مرحله 4️⃣: Start Application

```bash
# Production
npm run start

# Development (with hot-reload)
npm run dev
```

### مرحله 5️⃣: Worker Setup (Optional)

```bash
# Start queue worker (in separate terminal)
npm run worker:start

# Start scheduler (in another terminal)
npm run scheduler:start
```

---

## 🧪 تست API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{ "ok": true }
```

### 2. Ready Check

```bash
curl http://localhost:3000/ready
```

**Response:**

```json
{ "ready": true }
```

### 3. Create Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "domain_id": "550e8400-e29b-41d4-a716-446655440000",
    "owner_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### 4. Add Keyword

```bash
# Replace {projectId} with actual ID
curl -X POST http://localhost:3000/projects/{projectId}/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "best coffee near me",
    "language": "en"
  }'
```

### 5. Create Rank Check

```bash
curl -X POST http://localhost:3000/projects/{projectId}/checks \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_at": "2025-12-29T10:00:00Z"
  }'
```

### 6. Get Rank Results

```bash
curl "http://localhost:3000/projects/{projectId}/keywords/{keywordId}/ranks?limit=10"
```

---

## 🔍 Debugging

### Log Levels

```bash
# Development (verbose)
NODE_ENV=development npm run dev

# Production (minimal)
NODE_ENV=production npm run start
```

### Database Debugging

```bash
# Test database connection
npm run check:infra

# Run migrations (with logs)
npm run migrate:run

# View current schema
# Connect to PostgreSQL directly
psql -h localhost -U postgres -d seo_rank
\dt  # Show all tables
```

### Service Testing

```bash
# Test all services
npm run test:services

# Output should show:
# ✅ Database connected
# ✅ Project created
# ✅ Keywords added
# ✅ Rank checks created
```

---

## 📁 دستور‌العمل پروژه

### فایل Structure

```
project/
├── src/
│   ├── controllers/      ← HTTP handlers
│   ├── services/         ← Business logic
│   ├── middleware/       ← Request processing
│   ├── routes/           ← URL mapping
│   ├── entities/         ← Database schemas
│   ├── worker/           ← Background jobs
│   ├── scripts/          ← Utilities
│   ├── utils/            ← Helpers
│   ├── migration/        ← DB migrations
│   ├── data-source.ts    ← DB config
│   └── index.ts          ← App entry point
├── dist/                 ← Compiled JS
├── sql/                  ← Raw SQL files
├── package.json
├── tsconfig.json
├── .env                  ← Secrets
├── .env.example          ← Template
└── README.md
```

---

## 🔄 Development Workflow

### 1️⃣ Creating New Endpoint

**Step 1:** Create Controller

```typescript
// src/controllers/newController.ts
export const newHandler = async (req: Request, res: Response) => {
  try {
    // Logic here
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
```

**Step 2:** Create Service (if needed)

```typescript
// src/services/index.ts
export class NewService {
  async myMethod() {
    /* ... */
  }
}
```

**Step 3:** Create Routes

```typescript
// src/routes/newRoutes.ts
router.post("/", validator, handler);
```

**Step 4:** Register in App

```typescript
// src/index.ts
app.use("/new-path", newRoutes);
```

### 2️⃣ Database Migration

**Step 1:** Create migration file

```bash
# Manually create: src/migration/{timestamp}-Description.ts
```

**Step 2:** Define up/down methods

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Create tables
}

public async down(queryRunner: QueryRunner): Promise<void> {
  // Drop tables
}
```

**Step 3:** Run migrations

```bash
npm run migrate:run
```

---

## ⚡ Performance Tips

### Database Optimization

```typescript
// Use QueryBuilder for complex queries
const results = qb
  .select("r")
  .where("r.project_id = :projectId", { projectId })
  .orderBy("r.checked_at", "DESC")
  .limit(10)
  .getMany();
```

### Caching Strategy

```typescript
// Cache frequently accessed data
const cache = new Map<string, any>();
```

### Connection Pooling

```bash
# In .env
DATABASE_POOL_SIZE=10
```

---

## 🔐 Security Checklist

- [ ] Input validation on all endpoints
- [ ] CORS configuration
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers
- [ ] Logging sensitive data prevention

---

## 📊 Monitoring

### Logs

```bash
# Watch logs in real-time
npm run dev  # Logs to console

# Production logging
# (add Winston or Pino)
```

### Health Checks

```bash
# Database
npm run check:infra

# API
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### Metrics

```bash
# Count pending jobs
SELECT COUNT(*) FROM rank_checks WHERE status = 0;

# Count completed checks
SELECT COUNT(*) FROM rank_checks WHERE status = 2;
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run migrate:run
npm run start
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name "spider-api"

# Monitor
pm2 monit
```

### Using Docker (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed

```bash
# Check credentials in .env
# Verify PostgreSQL is running
# Test connection:
npm run check:infra
```

### Issue: Port Already in Use

```bash
# Change PORT in .env
PORT=3001
npm run dev
```

### Issue: TypeScript Compilation Error

```bash
# Clear dist folder
rm -rf dist

# Rebuild
npm run build

# Check for type errors
npx tsc --noEmit
```

### Issue: Migration Failed

```bash
# Rollback (if available)
npm run migrate:rollback

# Check migration status
# Connect to DB and check typeorm_migrations table
```

---

## 📞 Useful Commands

```bash
# Build
npm run build

# Development
npm run dev

# Production
npm run start

# Database
npm run migrate:run        # Run migrations
npm run typeorm:sync       # Sync schema
npm run seed:sample        # Load sample data
npm run check:infra        # Test connection

# Workers
npm run worker:start       # Start queue worker
npm run scheduler:start    # Start scheduler

# Testing
npm run test:services      # Test services layer
```

---

## 📚 Additional Resources

- **TypeORM Docs:** https://typeorm.io
- **Express Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Redis Docs:** https://redis.io/docs
- **BullMQ Docs:** https://docs.bullmq.io

---

## 🎓 Learning Path

1. Understand MVC/Service pattern
2. Learn Express middleware
3. Study TypeORM relationships
4. Explore async/await patterns
5. Practice error handling
6. Implement validation
7. Add authentication
8. Setup monitoring

---

**شروع کنید با:** `npm run dev` 🚀
