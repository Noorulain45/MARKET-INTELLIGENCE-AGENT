import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getReports, getReportById, generateReport, deleteReport } from '../controllers/reports.controller';

const router = Router();
router.use(authenticate);

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;
