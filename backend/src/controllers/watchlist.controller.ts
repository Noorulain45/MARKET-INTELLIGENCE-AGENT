import { Request, Response, NextFunction } from 'express';
import { Watchlist } from '../models/Watchlist.model';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function getWatchlists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const watchlists = await Watchlist.find({
      $or: [{ userId: req.user!.id }, { sharedWith: req.user!.id }],
    }).populate('competitors', 'name website logo industry').lean();
    sendSuccess(res, watchlists);
  } catch (error) {
    next(error);
  }
}

export async function createWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const watchlist = await Watchlist.create({ ...req.body, userId: req.user!.id });
    sendSuccess(res, watchlist, 'Watchlist created', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('competitors', 'name website logo industry');

    if (!watchlist) {
      sendError(res, 'Watchlist not found', 404);
      return;
    }
    sendSuccess(res, watchlist, 'Watchlist updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await Watchlist.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    sendSuccess(res, null, 'Watchlist deleted');
  } catch (error) {
    next(error);
  }
}

export async function addCompetitorToWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { $addToSet: { competitors: req.body.competitorId } },
      { new: true }
    ).populate('competitors', 'name website logo industry');

    if (!watchlist) {
      sendError(res, 'Watchlist not found', 404);
      return;
    }
    sendSuccess(res, watchlist, 'Competitor added to watchlist');
  } catch (error) {
    next(error);
  }
}
