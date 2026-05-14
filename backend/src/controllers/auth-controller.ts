import { Request, Response, NextFunction } from 'express';
import database from '../config/database.js';
import * as services from '../services/index.js';
import { AppError } from '../errors/app-error.js';
import { getUserResponse } from '../services/get-user-response.js';

export class AuthController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const userResponse = await getUserResponse(user);
      return res.status(200).json({ user: userResponse });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body;

      const user = await database.user.findUnique({
        where: { name },
        select: {
          password: true,
          name: true,
          role: {
            select: {
              name: true
            }
          }
        }
      });

      if (!user || !await services.compareHash(password, user.password)) {
        throw new AppError('Dados incorretos', 400);
      }

      const maxAge = 3600000 * 24;
      const token = services.genToken({ name: user.name, role: user.role.name }, maxAge);

      res.cookie('sessionId', token, { maxAge, httpOnly: true, secure: true });
      return res.status(200).json('Success');
    } catch (error) {
      next(error);
    }
  }

  async logout (req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('sessionId');
      res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }
}
