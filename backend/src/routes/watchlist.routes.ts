import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getWatchlists, createWatchlist, updateWatchlist,
  deleteWatchlist, addCompetitorToWatchlist,
} from '../controllers/watchlist.controller';

const router = Router();
router.use(authenticate);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', deleteWatchlist);
router.post('/:id/competitors', addCompetitorToWatchlist);

export default router;
