import { Request, Response, NextFunction, urlencoded } from "express";
import database from "../config/database.js";
import * as services from "../services/index.js";
import { AppError } from "../errors/app-error.js";
import { verifyPermissions } from "../services/index.js";
import { getUserResponse } from "../services/get-user-response.js";
import { formatDate } from "../utils/format-date.js";
import { UsersListQuery } from "../types/user.js";

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await services.verifyPermissions(user.role.name, ["users:read"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, role, created_at, updated_at, page } = req.query as unknown as UsersListQuery;

      const take = 20;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * take;

      const where = {
        ...(name && { name: { contains: name } }),
        ...(role && { role: { name: { contains: role } } }),
        ...(created_at && { created_at: { gte: new Date(created_at) } }),
        ...(updated_at && { updated_at: { gte: new Date(updated_at) } }),
      };

      const [totalCount, usersRaw] = await database.$transaction([
        database.user.count({ where }),
        database.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: 'desc'
          },
          select: {
            name: true,
            role: {
              select: {
                name: true,
              },
            },
            created_at: true,
            updated_at: true
          },
        })
      ]);

      const users = usersRaw.map((user) => ({
        id: user.name,
        role: user.role.name,
        created_at: formatDate(user.created_at),
        updated_at: formatDate(user.updated_at)
      }));

      return res.status(200).json({ 
        data: users,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / take),
          currentPage,
          perPage: take
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["users:read", "users:create"])) {
        throw new AppError("Unauthorized", 403);
      }

      const rolesRaw = await database.role.findMany({
        where: {
          name: {
            not: "admin",
          },
        },
        select: { name: true },
      });

      const roles = rolesRaw.map((role) => {
        return {
          id: role.name,
        };
      });

      return res.status(200).json({ roles });
    } catch (error) {
      next(error);
    }
  };

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await services.verifyPermissions(user.role.name, ["users:read", "users:create"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, role, password } = req.body;

      if (!name || !role) {
        throw new AppError("Preencha os campos", 400);
      }

      const userData = await database.user.findUnique({
        where: { name }
      });

      if (userData) {
        throw new AppError("Usuário já existente", 400);
      }

      const hashPassword = await services.hashData(password);

      await database.$transaction(async (tx) => {
        const roleData = await tx.role.findUnique({
          where: { name: role },
          select: { id: true },
        });

        if (!roleData) {
          throw new AppError("Cargo não encontrado", 404);
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

      if (!await verifyPermissions(user.role.name, ["users:read"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userDataRaw = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
          created_at: true,
          updated_at: true
        },
      });

      if (!userDataRaw) {
        throw new AppError("Usuário não encontrado", 404);
      }

      const userData = {
          ...userDataRaw,
          created_at: formatDate(userDataRaw.created_at),
          updated_at: formatDate(userDataRaw.updated_at)
      };

      return res.status(200).json({ userData });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["users:read", "users:delete"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { names } = req.body;

      if (names.includes("admin")) {
        throw new AppError("Usuário admin não pode ser deletado", 400);
      }

      for (const name of names) {
        const userData = await database.user.findUnique({
          where: { name },
        });

        if (!userData) {
          throw new AppError("User Not Found", 404);
        }
      };

      await database.$transaction(async (tx) => {
        for (const name of names) {
          await tx.user.delete({
            where: { name },
          });
        }
      })

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async updateForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["users:read", "users:update"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userDataRaw = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
          created_at: true,
          updated_at: true
        },
      });

      if (!userDataRaw) {
        throw new AppError("User Not Found", 404);
      }

      const userData = {
          ...userDataRaw,
          created_at: formatDate(userDataRaw.created_at),
          updated_at: formatDate(userDataRaw.updated_at)
      };

      const roles = await database.role.findMany({
        where: {
          name: {
            not: "admin",
          },
        },
        select: { name: true },
      });

      return res.status(200).json({ userData, roles });
    } catch (error) {
      next(error);
    }
  }

  async updateForPatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["users:read", "users:update"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      let { userName, roleName, password } = req.body;

      if (!userName || !roleName) {
        throw new AppError("Preencha os campos", 400);
      }

      const verifyUser = await database.user.findUnique({
        where: { name }
      });

      if (!verifyUser) {
        throw new AppError("Usuário não encontrado", 404);
      }

      const userData = await database.user.findUnique({
        where: { name: userName },
      });

      if (userData && name !== userName) {
        throw new AppError("Usuário já existente", 400);
      }

      const role = await database.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        throw new AppError("Cargo não encontrado", 404);
      }

      if (password) {
        password = await services.hashData(password);
      }

      await database.user.update({
        where: { name },
        data: {
          name: userName,
          roleId: role.id,
          password: password ? password : undefined,
          updated_at: new Date()
        },
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }
}
