"use strict";
// Deprecated: legacy route file kept for reference.
// The application now uses `src/routes/projectRoutes.ts` (modular refactor).
// This file is intentionally left minimal to avoid accidental usage.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => res.status(410).json({ error: 'This route is deprecated. Use /projects' }));
exports.default = router;
