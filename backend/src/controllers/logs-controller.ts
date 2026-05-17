import { Request, Response, NextFunction } from "express";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import database from "../config/database.js";
import { logsMessageFormatter } from "../utils/logs-message-formatter.js";
import { AuditLog, LogsListQuery } from "../types/logs.js";

export class LogsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { author, author_role, resource, action, target_value, created_at, page } =
        req.query as unknown as LogsListQuery;

      const take = 50;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * take;

      const where = {
        ...(author && {
          OR: [
            { author: { path: ["name"], string_contains: author } },
            { author: { path: ["id"], string_contains: author } },
          ],
        }),
        ...(author_role && { author: { path: ["role"], string_contains: author_role } }),
        ...(resource && { resource: { contains: resource } }),
        ...(action && { action: { contains: action } }),
        ...(target_value && {
          OR: [
            { targetItem: { path: ["name"], string_contains: target_value } },
            { targetItem: { path: ["id"], string_contains: target_value } },
            { newItem: { path: ["name"], string_contains: target_value } },
            { newItem: { path: ["id"], string_contains: target_value } },
          ],
        }),
        ...(created_at && { created_at: { gte: new Date(created_at) } }),
      };

      const [totalCount, logsRaw] = await database.$transaction([
        database.auditLogs.count({ where }),
        database.auditLogs.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          }
        }),
      ]);

      const logs = logsMessageFormatter(logsRaw as unknown as AuditLog[]);

      res.status(200).json({ 
        data: logs,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / take),
          currentPage,
          perPage: take,
        }, 
      });
    } catch (error) {
      next(error);
    }
  }
}
