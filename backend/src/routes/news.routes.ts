import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getNews, getNewsById, getNewsSummary, triggerNewsCollection, getNewsCategories } from '../controllers/news.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNews);
router.get('/summary', getNewsSummary);
router.get('/categories', getNewsCategories);
router.post('/collect', authorize('admin'), triggerNewsCollection);
router.get('/:id', getNewsById);

export default router;
