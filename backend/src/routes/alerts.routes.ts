import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAlerts, createAlert, updateAlert, deleteAlert,
  getNotifications, markNotificationRead,
} from '../controllers/alerts.controller';

const router = Router();
router.use(authenticate);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
