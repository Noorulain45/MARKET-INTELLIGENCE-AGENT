import { Request, Response, NextFunction } from 'express';
import { Chat } from '../models/Chat.model';
import { ragChat } from '../services/ai/ragService';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';

export async function getChats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({ userId: req.user!.id, isActive: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title updatedAt createdAt')
        .lean(),
      Chat.countDocuments({ userId: req.user!.id, isActive: true }),
    ]);

    sendPaginated(res, chats, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getChatById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
    if (!chat) {
      sendError(res, 'Chat not found', 404);
      return;
    }
    sendSuccess(res, chat);
  } catch (error) {
    next(error);
  }
}

export async function createChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await Chat.create({
      userId: req.user!.id,
      title: req.body.title || 'New Conversation',
    });
    sendSuccess(res, chat, 'Chat created', 201);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, chatId } = req.body;

    let chat = chatId
      ? await Chat.findOne({ _id: chatId, userId: req.user!.id })
      : null;

    if (!chat) {
      chat = await Chat.create({
        userId: req.user!.id,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Get conversation history for context
    const history = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    // Get AI response with RAG
    const { response, sources } = await ragChat(message, history.slice(0, -1));

    // Add assistant response
    chat.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      sources: sources.map(s => ({ title: s.content.slice(0, 60), url: s.url || '', type: s.type })),
    });

    // Update chat title if first message
    if (chat.messages.length === 2) {
      chat.title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
    }

    await chat.save();

    sendSuccess(res, {
      chatId: chat._id,
      message: chat.messages[chat.messages.length - 1],
      sources,
    }, 'Message sent');
  } catch (error) {
    next(error);
  }
}

export async function deleteChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isActive: false }
    );
    sendSuccess(res, null, 'Chat deleted');
  } catch (error) {
    next(error);
  }
}
