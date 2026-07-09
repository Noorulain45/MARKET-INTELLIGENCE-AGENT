import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { semanticSearch } from '../controllers/search.controller';

const router = Router();
router.use(authenticate);
router.get('/', semanticSearch);

export default router;
