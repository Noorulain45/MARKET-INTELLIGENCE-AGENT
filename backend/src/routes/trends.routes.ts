import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getTrends, getTrendsSummary, getTrendById, triggerTrendCollection } from '../controllers/trends.controller';

const router = Router();
router.use(authenticate);

router.get('/', getTrends);
router.get('/summary', getTrendsSummary);
router.post('/collect', authorize('admin'), triggerTrendCollection);
router.get('/:id', getTrendById);

export default router;
