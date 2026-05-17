import { Request, Response, NextFunction } from "express";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";

export class LogsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read"]))) {
        throw new AppError("Unauthorized", 403);
      }
    } catch (error) {
      next(error);
    }
  }
}
