import { Request, Response, NextFunction } from 'express';
import * as services from '../services/index.js';
import database from '../config/database.js';
import { AppError } from '../errors/app-error.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.sessionId;
    if (!token) {
      throw new AppError('Unauthorized', 403);
    }

    const decodedUser = services.verifyToken(token);
    if (!decodedUser) {
      throw new AppError('Unauthorized', 403);
    }

    const user = await database.user.findUnique({
      where: { name: decodedUser.name },
      include: { role: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
