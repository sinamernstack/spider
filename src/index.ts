import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import projectRoutes from './routes/projectRoutes';
import apiRoutes from './routes/apiRoutes';
import path from 'path';
import { requestLogger, ensureDbInitialized, errorHandler } from './middleware';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);
app.use(ensureDbInitialized);

// Routes
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    res.json({ ready: true });
  } catch (err) {
    res.status(500).json({ ready: false, error: String(err) });
  }
});

app.use('/api', apiRoutes);

// Serve simple static UI
app.use('/ui', express.static(path.join(__dirname, '..', 'src', 'public')));

app.get('/', (_req: Request, res: Response) => res.send('SEO Rank Tracker API - visit /ui/dashboard.html for the dashboard'));

// Error handling
app.use(errorHandler);

const port = parseInt(process.env.PORT || '3000', 10);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => console.log(`Server listening on ${port}`));
  })
  .catch(err => {
    console.error('DataSource initialize error', err);
    process.exit(1);
  });
