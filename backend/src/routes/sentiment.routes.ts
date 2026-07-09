import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getSentiments, getSentimentOverview } from '../controllers/sentiment.controller';

const router = Router();
router.use(authenticate);

router.get('/', getSentiments);
router.get('/overview', getSentimentOverview);

export default router;
