import { Request, Response, NextFunction } from 'express';
import database from '../config/database.js';
import * as services from '../services/index.js';
import { AppError } from '../errors/app-error.js';

export class UserController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await database.user.findMany({
        select: {
          name: true,
          role: {
            select: {
              name: true
            }
          }
        }
      });

      return res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, role, password } = req.body;

      const hashPassword = await services.hashData(password);

      await database.$transaction(async (tx) => {
        const roleData = await tx.role.findUnique({
          where: { name: role },
          select: { id: true }
        });

        if (!roleData) {
          throw new AppError('Role not found', 404);
        }

        await tx.user.create({
          data: {
            name,
            password: hashPassword,
            roleId: roleData.id
          }
        });
      });

      return res.status(200).json('Success');
    } catch (error) {
      next(error);
    }
  }
}
