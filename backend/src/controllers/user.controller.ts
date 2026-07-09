import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        .select('-password -refreshToken').lean(),
      User.countDocuments(),
    ]);

    sendPaginated(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allowedFields = ['name', 'avatar', 'preferences'];
    const updates: Record<string, unknown> = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user!.id, updates, {
      new: true, runValidators: true,
    }).select('-password -refreshToken');

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      sendError(res, 'Current password is incorrect', 401);
      return;
    }
    user.password = req.body.newPassword;
    await user.save();
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'User role updated');
  } catch (error) {
    next(error);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.params.id === req.user!.id) {
      sendError(res, 'Cannot deactivate your own account', 400);
      return;
    }
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    sendSuccess(res, null, 'User deactivated');
  } catch (error) {
    next(error);
  }
}
