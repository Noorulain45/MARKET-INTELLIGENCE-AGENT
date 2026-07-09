import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report.model';
import { managerAgent } from '../services/ai/agents/managerAgent';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';

export async function getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { generatedBy: req.user!.id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(filter),
    ]);

    sendPaginated(res, reports, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      generatedBy: req.user!.id,
    }).populate('data.competitors', 'name industry').lean();

    if (!report) {
      sendError(res, 'Report not found', 404);
      return;
    }
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
}

export async function generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, title, competitors, dateRange } = req.body;

    // Create report placeholder
    const report = await Report.create({
      title: title || `${type} Report - ${new Date().toLocaleDateString()}`,
      type,
      generatedBy: req.user!.id,
      data: {
        competitors: competitors || [],
        dateRange: dateRange || {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
      },
      status: 'generating',
    });

    // Generate content asynchronously
    setImmediate(async () => {
      try {
        const agentResult = await managerAgent({
          type: 'full',
          query: `Generate a ${type} market intelligence report`,
        });

        await Report.findByIdAndUpdate(report._id, {
          content: {
            executiveSummary: agentResult.finalInsight || '',
            competitorAnalysis: agentResult.competitor || '',
            marketTrends: agentResult.trend || '',
            customerSentiment: agentResult.sentiment || '',
            strategicRecommendations: agentResult.recommendation || '',
            aiInsights: agentResult.news || '',
          },
          status: 'completed',
        });
      } catch (err) {
        await Report.findByIdAndUpdate(report._id, { status: 'failed' });
      }
    });

    sendSuccess(res, report, 'Report generation started', 202);
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, generatedBy: req.user!.id });
    sendSuccess(res, null, 'Report deleted');
  } catch (error) {
    next(error);
  }
}
