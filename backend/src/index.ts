import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import commitsRouter from './routes/commits';
import authorsRouter from './routes/authors';
import commentsRouter from './routes/comments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET'],
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes — all under /api
app.use('/api', commitsRouter);
app.use('/api', authorsRouter);
app.use('/api', commentsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 GitHub Commits API server running on port ${PORT}`);
  if (process.env.GITHUB_TOKEN) {
    console.log('✅ GitHub token configured (rate limit: 5000 req/hr)');
  } else {
    console.log('⚠️  No GitHub token — using unauthenticated rate limit (60 req/hr)');
    console.log('   Set GITHUB_TOKEN env var to increase limits');
  }
});

export default app;
