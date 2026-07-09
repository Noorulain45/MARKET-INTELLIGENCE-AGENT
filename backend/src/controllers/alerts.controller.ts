import { Request, Response, NextFunction } from 'express';
import { Alert } from '../models/Alert.model';
import { Notification } from '../models/Notification.model';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { emitToUser } from '../config/socket';

export async function getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      Alert.find({ userId: req.user!.id })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('conditions.competitors', 'name').lean(),
      Alert.countDocuments({ userId: req.user!.id }),
    ]);

    sendPaginated(res, alerts, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alert = await Alert.create({ ...req.body, userId: req.user!.id });
    sendSuccess(res, alert, 'Alert created', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!alert) {
      sendError(res, 'Alert not found', 404);
      return;
    }
    sendSuccess(res, alert, 'Alert updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    sendSuccess(res, null, 'Alert deleted');
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter: Record<string, unknown> = { userId: req.user!.id };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    sendPaginated(res, notifications, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, userId: req.user!.id }, { isRead: true });
    }
    sendSuccess(res, null, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
}
