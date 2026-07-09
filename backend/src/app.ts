import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import competitorRoutes from './routes/competitor.routes';
import newsRoutes from './routes/news.routes';
import trendsRoutes from './routes/trends.routes';
import sentimentRoutes from './routes/sentiment.routes';
import reportsRoutes from './routes/reports.routes';
import alertsRoutes from './routes/alerts.routes';
import chatRoutes from './routes/chat.routes';
import analyticsRoutes from './routes/analytics.routes';
import searchRoutes from './routes/search.routes';
import agentsRoutes from './routes/agents.routes';
import watchlistRoutes from './routes/watchlist.routes';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Sanitize data
app.use(mongoSanitize());

// HTTP logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Market Intelligence API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/competitors', competitorRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/trends', trendsRoutes);
app.use('/api/v1/sentiment', sentimentRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/agents', agentsRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
