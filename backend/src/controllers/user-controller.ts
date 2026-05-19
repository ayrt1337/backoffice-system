import { Request, Response, NextFunction, urlencoded } from "express";
import database from "../config/database.js";
import * as services from "../services/index.js";
import { AppError } from "../errors/app-error.js";
import { verifyPermissions } from "../services/index.js";
import { formatDate } from "../utils/format-date.js";
import { UsersListQuery } from "../types/user.js";
import { generateListPDF } from "../utils/pdf-list-generator.js";
import { generatePDF } from "../utils/pdf-generator.js";

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await services.verifyPermissions(user.role.name, ["users:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, role, created_at, updated_at, page } =
        req.query as unknown as UsersListQuery;

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
        database.user.count({ where, skip, take }),
        database.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          },
          select: {
            name: true,
            role: {
              select: {
                name: true,
              },
            },
            created_at: true,
            updated_at: true,
          },
        }),
      ]);

      const users = usersRaw.map((user) => ({
        id: user.name,
        role: user.role.name,
        created_at: formatDate(user.created_at),
        updated_at: formatDate(user.updated_at),
      }));

      return res.status(200).json({
        data: users,
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

  async createForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:create",
        ]))
      ) {
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
  }

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await services.verifyPermissions(user.role.name, [
          "users:read",
          "users:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, role, password } = req.body;

      if (role === "admin") {
        throw new AppError("Não é possível atribuir o cargo admin", 400);
      }

      const userData = await database.user.findUnique({
        where: { name },
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

        const createdUser = await tx.user.create({
          data: {
            name,
            password: hashPassword,
            roleId: roleData.id,
          },
          select: {
            name: true,
            role: {
              select: {
                name: true
              }
            },
            created_at: true,
            updated_at: true,
            id: true
          }
        });

        const ip = req.ip;

        await tx.auditLogs.create({
          data: {
            resource: "users",
            action: "create",
            author: {
              id: user.id,
              name: user.name,
              role: user.role.name,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            targetItem: {
              ...createdUser,
              role: createdUser.role.name
            },
            ip,
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
          updated_at: true,
        },
      });

      if (!userDataRaw) {
        throw new AppError("Usuário não encontrado", 404);
      }

      const userData = {
        ...userDataRaw,
        created_at: formatDate(userDataRaw.created_at),
        updated_at: formatDate(userDataRaw.updated_at),
      };

      return res.status(200).json({ userData });
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
      }

      await database.$transaction(async (tx) => {
        for (const name of names) {
          const deletedUser = await tx.user.delete({
            where: { name },
            select: {
              name: true,
              role: {
                select: {
                  name: true
                }
              },
              created_at: true,
              updated_at: true,
              id: true
            }
          });

          const ip = req.ip;

          await tx.auditLogs.create({
            data: {
              resource: "users",
              action: "delete",
              author: {
                id: user.id,
                name: user.name,
                role: user.role.name,
                created_at: user.created_at,
                updated_at: user.updated_at,
              },
              targetItem: {
                ...deletedUser,
                role: deletedUser.role.name
              },
              ip,
            },
          });
        }
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
          updated_at: true,
        },
      });

      if (!userDataRaw) {
        throw new AppError("User Not Found", 404);
      }

      const userData = {
        ...userDataRaw,
        created_at: formatDate(userDataRaw.created_at),
        updated_at: formatDate(userDataRaw.updated_at),
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

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      let { userName, roleName, password } = req.body;

      if (name === "admin") {
        throw new AppError("Não é possível editar o admin", 400);
      }

      if (user.name === name) {
        throw new AppError("Não é possível editar a si mesmo", 400);
      }

      if (roleName === "admin") {
        throw new AppError("Não é possível atribuir o cargo admin", 400);
      }

      const verifyUser = await database.user.findUnique({
        where: { name },
        select: {
          name: true,
          role: {
            select: {
              name: true
            }
          },
          created_at: true,
          updated_at: true,
          id: true
        }
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

      await database.$transaction(async (tx) => {
        const updatedUser = await database.user.update({
          where: { name },
          data: {
            name: userName,
            roleId: role.id,
            password: password ? password : undefined,
            updated_at: new Date(),
          },
          select: {
            name: true,
            role: {
              select: {
                name: true
              }
            },
            created_at: true,
            updated_at: true,
            id: true
          }
        });

        const ip = req.ip;

        await tx.auditLogs.create({
          data: {
            resource: "users",
            action: "update",
            author: {
              id: user.id,
              name: user.name,
              role: user.role.name,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            targetItem: {
              ...verifyUser,
              role: verifyUser.role.name
            },
            newItem: {
              ...updatedUser,
              role: updatedUser.role.name
            },
            ip,
          },
        });
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async exportListPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:export",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { fields, orderBy, orderByLabel, maxItems } = req.query as {
        fields?: string;
        orderBy?: string;
        orderByLabel?: string;
        maxItems?: number;
      };

      if (typeof Number(maxItems) !== "number") {
        throw new AppError("A quantidade de items deve ser um número!", 400);
      }

      if (Number(maxItems) <= 0) {
        throw new AppError(
          "A quantidade de items deve ser um inteiro positivo!",
          400,
        );
      }

      const fieldMap: Record<string, string> = {
        "Cargo": "role",
        "Criação": "created_at",
        "Última Alteração": "updated_at",
      };

      const selectedLabels = fields
        ? fields.split(",")
        : ["Cargo", "Criação", "Última Alteração"];
      const selectedFields = selectedLabels
        .map((label) => fieldMap[label])
        .filter(Boolean);

      let prismaOrderBy: any = { created_at: "desc" };
      if (orderBy === "created_oldest") prismaOrderBy = { created_at: "asc" };
      if (orderBy === "updated_newest") prismaOrderBy = { updated_at: "desc" };
      if (orderBy === "updated_oldest") prismaOrderBy = { updated_at: "asc" };
      if (orderBy === "alphabetical_name") prismaOrderBy = { name: "asc" };
      if (orderBy === "alphabetical_role")
        prismaOrderBy = { role: { name: "asc" } };

      const users = await database.user.findMany({
        orderBy: prismaOrderBy,
        take: maxItems ? Number(maxItems) : 20,
        select: {
          name: true,
          role: { select: { name: selectedFields.includes("role") } },
          created_at: selectedFields.includes("created_at"),
          updated_at: selectedFields.includes("updated_at"),
        },
      });

      const formattedUsers = users.map((user) => {
        return {
          name: user.name,
          role: user.role.name,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
      });

      await generateListPDF({
        res,
        title: "Relatório de Usuários",
        filename: "relatorio-usuarios.pdf",
        data: formattedUsers,
        headers: [
          { label: "Nome", property: "name" },
          ...selectedLabels.map((label) => ({
            label,
            property: fieldMap[label],
          })),
        ],
        orderByLabel,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportUserPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "users:read",
          "users:export",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const userData = await database.user.findUnique({
        where: {
          name: name,
        },
        select: {
          name: true,
          role: {
            select: {
              name: true,
            },
          },
          created_at: true,
          updated_at: true,
        },
      });

      if (!userData) {
        throw new AppError("Usuário não encontrado", 404);
      }

      await generatePDF({
        res,
        title: `Usuário - ${userData.name}`,
        filename: `usuario-${userData.name}.pdf`,
        rows: [
          { label: "Usuário", value: userData.name },
          { label: "Nome do Cargo", value: userData.role.name },
          { label: "Criado Em", value: formatDate(userData.created_at) },
          { label: "Última Alteração", value: formatDate(userData.updated_at) },
        ],
      });
    } catch (error) {
      next(error);
    }
  }
}
