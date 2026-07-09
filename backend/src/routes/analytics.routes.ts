import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getDashboardStats, getActivityTimeline, getMarketOverview } from '../controllers/analytics.controller';

const router = Router();
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/timeline', getActivityTimeline);
router.get('/market-overview', getMarketOverview);

export default router;
