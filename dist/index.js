"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const path_1 = __importDefault(require("path"));
const middleware_1 = require("./middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(middleware_1.requestLogger);
app.use(middleware_1.ensureDbInitialized);
// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/ready', async (_req, res) => {
    try {
        if (!data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.initialize();
        res.json({ ready: true });
    }
    catch (err) {
        res.status(500).json({ ready: false, error: String(err) });
    }
});
app.use('/api', apiRoutes_1.default);
// Serve simple static UI
app.use('/ui', express_1.default.static(path_1.default.join(__dirname, '..', 'src', 'public')));
app.get('/', (_req, res) => res.send('SEO Rank Tracker API - visit /ui/dashboard.html for the dashboard'));
// Error handling
app.use(middleware_1.errorHandler);
const port = parseInt(process.env.PORT || '3000', 10);
data_source_1.AppDataSource.initialize()
    .then(() => {
    app.listen(port, () => console.log(`Server listening on ${port}`));
})
    .catch(err => {
    console.error('DataSource initialize error', err);
    process.exit(1);
});
