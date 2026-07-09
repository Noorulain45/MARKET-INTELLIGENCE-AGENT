import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { runManagerAgent, getDailySummary, runSpecificAgent } from '../controllers/agents.controller';

const router = Router();
router.use(authenticate);

router.post('/run', runManagerAgent);
router.get('/daily-summary', getDailySummary);
router.post('/:agentType/run', runSpecificAgent);

export default router;
