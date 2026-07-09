import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getChats, getChatById, createChat, sendMessage, deleteChat } from '../controllers/chat.controller';

const router = Router();
router.use(authenticate);

router.get('/', getChats);
router.post('/', createChat);
router.post('/message', sendMessage);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

export default router;
