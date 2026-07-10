/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change current user's password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Old password incorrect
 */

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Update a user's role (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deactivate a user account (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 *       403:
 *         description: Admin role required
 */

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
