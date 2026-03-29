import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.message);
  }

  console.error(`[Error] ${error.message}`);
  return res.status(500).json('Internal Server Error');
};
