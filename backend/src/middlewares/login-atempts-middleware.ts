import { Request, Response, NextFunction } from "express";
import clientRedis from "../config/redis-client.js";
import { AppError } from "../errors/app-error.js";

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
      throw new AppError("Tente novamente mais tarde", 429);
    }

    return next();
  } catch (error) {
    next(error);
  }
};
