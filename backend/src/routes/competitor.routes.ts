import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getCompetitors, getCompetitorById, createCompetitor, updateCompetitor,
  deleteCompetitor, getCompetitorActivity, getSWOTAnalysis, compareCompetitors,
} from '../controllers/competitor.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCompetitors);
router.get('/compare', compareCompetitors);
router.post('/', createCompetitor);
router.get('/:id', getCompetitorById);
router.put('/:id', updateCompetitor);
router.delete('/:id', authorize('admin', 'analyst'), deleteCompetitor);
router.get('/:id/activity', getCompetitorActivity);
router.get('/:id/swot', getSWOTAnalysis);

export default router;
