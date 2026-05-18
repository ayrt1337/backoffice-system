import { Request, Response, NextFunction } from "express";
import clientRedis from "../config/redis-client.js";
import { AppError } from "../errors/app-error.js";
import database from "../config/database.js";

export const verifyLoginAtempts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ip = req.ip;
    const loginAtempts = await clientRedis.get(`login_atempts:${ip}`);

    if (
      loginAtempts &&
      typeof Number(loginAtempts) === "number" &&
      Number(loginAtempts) >= 5
    ) {
      const { name } = req.body;

      if (!name) {
        throw new AppError("Tente novamente mais tarde", 429);
      }

      await database.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { name },
          select: {
            name: true,
            role: {
              select: {
                name: true,
              },
            },
            created_at: true,
            updated_at: true,
            id: true,
          },
        });
        
        if (user) {
          await tx.auditLogs.create({
            data: {
              resource: "auth",
              action: "login",
              targetItem: {
                ...user,
                role: user.role.name,
              },
              ip,
            },
          });
        }
      });

      throw new AppError("Tente novamente mais tarde", 429);
    }

    return next();
  } catch (error) {
    next(error);
  }
};
