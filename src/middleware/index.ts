import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';

/**
 * Middleware to ensure database is initialized
 */
export const ensureDbInitialized = async (
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    _res.status(500).json({ error: 'Database connection failed' });
  }
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
