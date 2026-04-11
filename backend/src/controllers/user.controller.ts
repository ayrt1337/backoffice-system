import { Request, Response, NextFunction, urlencoded } from "express";
import database from "../config/database.js";
import * as services from "../services/index.js";
import { AppError } from "../errors/app-error.js";
import { verifyPermissions } from "../services/index.js";

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await services.verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const usersRaw = await database.user.findMany({
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      const users = usersRaw.map((user) => ({
        id: user.name,
        role: user.role.name,
      }));

      return res.status(200).json({ user: { name: user.name }, users });
    } catch (error) {
      next(error);
    }
  }

  async createForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["users:read", "users:create"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userData = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!userData) {
        throw new AppError("User Not Found", 400);
      }

      return res.status(200).json({ user: { name: user.name }, userData });
    } catch (error) {
      next(error);
    }
  };

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await services.verifyPermissions(user.role.name, [
          "roles:read",
          "roles:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, role, password } = req.body;

      const hashPassword = await services.hashData(password);

      await database.$transaction(async (tx) => {
        const roleData = await tx.role.findUnique({
          where: { name: role },
          select: { id: true },
        });

        if (!roleData) {
          throw new AppError("Role Not Found", 404);
        }

        await tx.user.create({
          data: {
            name,
            password: hashPassword,
            roleId: roleData.id,
          },
        });
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async read(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["users:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userData = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!userData) {
        throw new AppError("User Not Found", 400);
      }

      return res.status(200).json({ user: { name: user.name }, userData });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:delete",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.body;

      const userData = await database.user.findUnique({
        where: { name },
      });

      if (!userData) {
        throw new AppError("User Not Found", 400);
      }

      await database.user.delete({
        where: { name },
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async updateForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userData = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!userData) {
        throw new AppError("User Not Found", 400);
      }

      const roles = await database.role.findMany({
        where: {
          name: {
            not: "admin",
          },
        },
        select: { name: true },
      });

      if (!roles) {
        throw new AppError("Cannot Get Roles", 400);
      }

      return res
        .status(200)
        .json({ user: { name: user.name }, userData, roles });
    } catch (error) {
      next(error);
    }
  }

  async updateForPatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      const { userName, roleName } = req.body;

      const userData = await database.user.findUnique({
        where: { name: userName },
      });

      if (userData && name !== userName) {
        throw new AppError("User Name Taken", 400);
      }

      const role = await database.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        throw new AppError("Role Not Found", 400);
      }

      await database.user.update({
        where: { name },
        data: {
          name: userName,
          roleId: role.id,
        },
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }
}
