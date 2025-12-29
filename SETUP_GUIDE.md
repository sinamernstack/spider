<!-- @format -->

## 🎉 Spider SEO Tracker - Complete Setup Guide

### ✅ What's Ready

- **Database**: PostgreSQL with all migrations applied
- **Digikala Project**: Domain, Project, and 5 Keywords pre-configured
- **API Server**: Express server on port 3000
- **Scheduler**: Automated rank check scheduling (in-memory, no Redis needed)
- **Worker**: Background job processor (in-memory, no Redis needed)

### 🚀 Running Locally (Open 3 Terminals)

#### Terminal 1 - API Server

```bash
npm run dev
```

Server starts on http://localhost:3000

#### Terminal 2 - Scheduler

```bash
npm run scheduler:local
```

Automatically scans for pending rank checks every minute and enqueues jobs

#### Terminal 3 - Worker

```bash
npm run worker:local
```

Processes queued jobs and fetches real SERP data

---

### 📋 Test API Endpoints

#### 1. Get All Projects

```bash
curl http://localhost:3000/projects
```

#### 2. Create Rank Check for Digikala

```bash
curl -X POST http://localhost:3000/projects/6f4a8269-29cc-4828-b1d2-9e8fc7f2b72e/checks \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 3. Add New Keyword to Digikala

```bash
curl -X POST http://localhost:3000/projects/6f4a8269-29cc-4828-b1d2-9e8fc7f2b72e/keywords \
  -H "Content-Type: application/json" \
  -d '{"keyword": "خرید کتاب", "language": "fa"}'
```

#### 4. Get Keyword Ranks

```bash
curl http://localhost:3000/projects/6f4a8269-29cc-4828-b1d2-9e8fc7f2b72e/keywords/<KEYWORD_ID>/ranks
```

---

### 🎯 How It Works

1. **API** receives requests and stores data in PostgreSQL
2. **Scheduler** runs every minute and:
   - Finds pending rank checks
   - Loads keywords for each project
   - Adds jobs to in-memory queue
3. **Worker** processes jobs:
   - Fetches SERP data (Google search results)
   - Finds domain rank position
   - Stores results in database

---

### 📊 Digikala Project Details

```
Domain:      digikala.ir
Project:     Digikala Tracker
Domain ID:   5123aa1e-987a-4eb9-b1ea-2c3b1848caf4
Project ID:  6f4a8269-29cc-4828-b1d2-9e8fc7f2b72e

Keywords:
- خرید لپ تاپ
- قیمت گوشی سامسونگ
- قیمت تلویزیون
- خرید موبایل
- خرید هدفون
```

---

### ⚙️ Optional: Use Real Redis

If you want to use real Redis instead of in-memory mode:

1. Install Redis 7+ for Windows from https://github.com/tporadowski/redis/releases
2. Update `.env`:
   ```
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```
3. Use regular scripts:
   ```bash
   npm run dev
   npm run scheduler:start
   npm run worker:start
   ```

---

### 🛠️ Available NPM Scripts

```bash
npm run dev              # Start API server (development mode with auto-reload)
npm run build            # TypeScript build
npm run setup:all        # Run complete setup (migrations + seed + bootstrap)
npm run migrate:run      # Run database migrations
npm run seed:sample      # Seed sample data
npm run bootstrap:digikala  # Create Digikala domain/project/keywords
npm run test:services    # Test service layer
npm run scheduler:local  # Scheduler (no Redis required)
npm run scheduler:start  # Scheduler (requires Redis 5+)
npm run worker:local     # Worker (no Redis required)
npm run worker:start     # Worker (requires Redis 5+)
```

---

### 📝 Notes

- **In-memory mode** (`scheduler:local`, `worker:local`) works without Redis
- Jobs are processed sequentially in memory
- All data is persisted to PostgreSQL
- For production, use Redis 5+ with `scheduler:start` and `worker:start`

---

### ✨ Features Implemented

✅ Modular architecture (routes → controllers → services)  
✅ TypeORM database layer with migrations  
✅ Express API with validators and middleware  
✅ Cron-based scheduler for automated checks  
✅ Job queue (in-memory or Redis-based)  
✅ SERP fetcher (direct Google or API provider)  
✅ Rate limiting per domain  
✅ Complete error handling

Enjoy! 🚀
