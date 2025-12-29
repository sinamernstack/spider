"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.errorHandler = exports.ensureDbInitialized = void 0;
const data_source_1 = require("../data-source");
/**
 * Middleware to ensure database is initialized
 */
const ensureDbInitialized = async (_req, _res, next) => {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        next();
    }
    catch (error) {
        console.error('Database initialization error:', error);
        _res.status(500).json({ error: 'Database connection failed' });
    }
};
exports.ensureDbInitialized = ensureDbInitialized;
/**
 * Error handling middleware
 */
const errorHandler = (error, _req, res, _next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
};
exports.errorHandler = errorHandler;
/**
 * Request logging middleware
 */
const requestLogger = (req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
};
exports.requestLogger = requestLogger;
