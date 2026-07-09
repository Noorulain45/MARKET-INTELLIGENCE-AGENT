import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getUsers, updateProfile, changePassword, updateUserRole, deactivateUser } from '../controllers/user.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deactivateUser);

export default router;
