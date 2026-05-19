import { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import { generateListPDF } from "../utils/pdf-list-generator.js";
import database from "../config/database.js";
import { updatePermissions } from "../services/update-permissions.js";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import { getPermissions } from "../services/get-permissions.js";
import { formatDate } from "../utils/format-date.js";
import { RolesListQuery } from "../types/role.js";

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, created_at, updated_at, page } =
        req.query as unknown as RolesListQuery;

      const take = 20;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * take;

      const where = {
        ...(name && { name: { contains: name } }),
        ...(created_at && { created_at: { gte: new Date(created_at) } }),
        ...(updated_at && { updated_at: { gte: new Date(updated_at) } }),
      };

      const [totalCount, rolesRaw] = await database.$transaction([
        database.role.count({ where, skip, take }),
        database.role.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          },
          select: { name: true, created_at: true, updated_at: true },
        }),
      ]);

      const roles = rolesRaw.map((role) => {
        return {
          id: role.name,
          created_at: formatDate(role.created_at),
          updated_at: formatDate(role.updated_at),
        };
      });

      return res.status(200).json({
        data: roles,
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
          "roles:read",
          "roles:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      return res.status(200).json({ resources });
    } catch (error) {
      next(error);
    }
  }

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, rolePermissions } = req.body;

      const roleData = await database.role.findUnique({
        where: { name },
      });

      if (roleData) {
        throw new AppError("Cargo já existente", 400);
      }

      await database.$transaction(async (tx) => {
        const role = await tx.role.create({
          data: { name },
        });

        for (const rolePermission of rolePermissions) {
          const action = await tx.action.findUnique({
            where: {
              slug: rolePermission,
            },
          });

          await tx.rolePermission.create({
            data: {
              roleId: role.id,
              actionId: action.id,
            },
          });
        }
        const ip = req.ip;

        await tx.auditLogs.create({
          data: {
            resource: "roles",
            action: "create",
            author: {
              id: user.id,
              name: user.name,
              role: user.role.name,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            targetItem: {
              ...role,
              rolePermissions,
            },
            ip,
          },
        });
      });

      await updatePermissions();

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async read(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const roleDataRaw = await database.role.findUnique({
        where: { name },
        select: { name: true, created_at: true, updated_at: true },
      });

      if (!roleDataRaw) {
        throw new AppError("Role Not Found", 404);
      }

      const role = {
        ...roleDataRaw,
        created_at: formatDate(roleDataRaw.created_at),
        updated_at: formatDate(roleDataRaw.updated_at),
      };

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      const rolePermissions = await getPermissions(role.name);

      return res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const roleDataRaw = await database.role.findUnique({
        where: { name },
        select: { name: true, created_at: true, updated_at: true },
      });

      if (!roleDataRaw) {
        throw new AppError("Role Not Found", 404);
      }

      const role = {
        ...roleDataRaw,
        created_at: formatDate(roleDataRaw.created_at),
        updated_at: formatDate(roleDataRaw.updated_at),
      };

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      const rolePermissions = await getPermissions(role.name);

      return res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForPatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      const { roleName, permissions } = req.body;

      const role = await database.role.findUnique({
        where: { name },
      });

      if (!role) {
        throw new AppError("Cargo não encontrado", 404);
      }

      if (role.name === "admin") {
        throw new AppError("Não é possível editar o admin", 400);
      }

      if (user.role.name === role.name) {
        throw new AppError("Não é possível editar a si mesmo", 400);
      }

      const verifyRole = await database.role.findUnique({
        where: { name: roleName },
      });

      if (verifyRole && name !== roleName) {
        throw new AppError("Cargo já existente", 400);
      }

      await database.$transaction(async (tx) => {
        const updatedRole = await tx.role.update({
          where: { name },
          data: { name: roleName, updated_at: new Date() },
        });

        const currentPermissions = await tx.rolePermission.findMany({
          where: {
            roleId: role.id,
          },
          select: {
            action: {
              select: {
                slug: true,
              },
            },
          },
        });

        await tx.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        for (const permission of permissions) {
          const permissionData = await tx.action.findUnique({
            where: { slug: permission },
          });

          if (permissionData) {
            await tx.rolePermission.create({
              data: {
                roleId: role.id,
                actionId: permissionData.id,
              },
            });
          }
        }
        const ip = req.ip;

        await tx.auditLogs.create({
          data: {
            resource: "roles",
            action: "update",
            author: {
              id: user.id,
              name: user.name,
              role: user.role.name,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            targetItem: {
              ...role,
              rolePermissions: currentPermissions.map(
                (permission) => permission.action.slug,
              ),
            },
            newItem: {
              ...updatedRole,
              rolePermissions: permissions,
            },
            ip,
          },
        });
      });

      await updatePermissions();

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:delete",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { names } = req.body;

      if (names.includes("admin")) {
        throw new AppError("Cargo admin não pode ser deletado", 400);
      }

      for (const name of names) {
        const role = await database.role.findUnique({
          where: { name },
        });

        if (!role) {
          throw new AppError("Role Not Found", 404);
        }
      }

      await database.$transaction(async (tx) => {
        for (const name of names) {
          const currentPermissions = await tx.rolePermission.findMany({
            where: {
              role: {
                name
              }
            },
            select: {
              action: {
                select: {
                  slug: true,
                },
              },
            },
          });

          const deletedRole = await tx.role.delete({
            where: { name },
          });

          const ip = req.ip;

          await tx.auditLogs.create({
            data: {
              resource: "roles",
              action: "delete",
              author: {
                id: user.id,
                name: user.name,
                role: user.role.name,
                created_at: user.created_at,
                updated_at: user.updated_at,
              },
              targetItem: {
                ...deletedRole,
                rolePermissions: currentPermissions.map(
                  (permission) => permission.action.slug,
                ),
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

  async exportListPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:export",
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
        "Criação": "created_at",
        "Última Alteração": "updated_at",
      };

      const selectedLabels = fields
        ? fields.split(",")
        : ["Criação", "Última Alteração"];
      const selectedFields = selectedLabels
        .map((label) => fieldMap[label])
        .filter(Boolean);

      let prismaOrderBy: any = { created_at: "desc" };
      if (orderBy === "created_oldest") prismaOrderBy = { created_at: "asc" };
      if (orderBy === "updated_newest") prismaOrderBy = { updated_at: "desc" };
      if (orderBy === "updated_oldest") prismaOrderBy = { updated_at: "asc" };
      if (orderBy === "alphabetical") prismaOrderBy = { name: "asc" };

      const roles = await database.role.findMany({
        orderBy: prismaOrderBy,
        take: maxItems ? Number(maxItems) : 20,
        select: {
          name: true,
          created_at: selectedFields.includes("created_at"),
          updated_at: selectedFields.includes("updated_at"),
        },
      });

      await generateListPDF({
        res,
        title: "Relatório de Cargos",
        filename: "relatorio-cargos.pdf",
        data: roles,
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

  async exportRolePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:export",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const roleDataRaw = await database.role.findUnique({
        where: { name },
        select: { name: true, created_at: true, updated_at: true },
      });

      if (!roleDataRaw) {
        throw new AppError("Cargo não encontrado", 404);
      }

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      const rolePermissions = await getPermissions(roleDataRaw.name);

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        bufferPages: true,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=cargo-${roleDataRaw.name}.pdf`,
      );

      doc.pipe(res);

      const startX = 40;
      const contentWidth = doc.page.width - 80;

      doc
        .fillColor("#0f304f")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(`Cargo - ${roleDataRaw.name}`, { align: "left" });
      doc.moveDown(0.1);

      doc.fillColor("#64748b").fontSize(10).font("Helvetica");
      doc.text(`Relatório gerado em: ${new Date().toLocaleString("pt-BR")}`);
      doc.moveDown(2);

      const basicFields = [
        { label: "Cargo", value: roleDataRaw.name },
        { label: "Criado Em", value: formatDate(roleDataRaw.created_at) },
        {
          label: "Última Alteração",
          value: formatDate(roleDataRaw.updated_at),
        },
      ];

      for (const field of basicFields) {
        doc.fillColor("#64748b").fontSize(11).font("Helvetica");
        doc.text(field.label, startX);
        doc.moveDown(0.2);
        doc.fillColor("#1e293b").fontSize(13).font("Helvetica");
        doc.text(field.value || "-", startX);
        doc.moveDown(1.5);
      }

      doc
        .fillColor("#0f304f")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Permissões", startX);
      doc.moveDown(0.8);

      const colWidths = {
        resource: 150,
        action: (contentWidth - 150) / 5,
      };

      const headerY = doc.y;
      doc.fillColor("#0f304f").rect(startX, headerY, contentWidth, 25).fill();

      doc.fillColor("white").fontSize(10).font("Helvetica-Bold");
      doc.text("Funcionalidade", startX + 10, headerY + 8);

      const actionLabels = [
        "Visualizar",
        "Criar",
        "Editar",
        "Excluir",
        "Exportar",
      ];
      actionLabels.forEach((label, i) => {
        doc.text(
          label,
          startX + colWidths.resource + i * colWidths.action,
          headerY + 8,
          { width: colWidths.action, align: "center" },
        );
      });

      doc.y = headerY + 25;
      doc.moveDown(0.5);

      for (const resource of resources) {
        const resourceY = doc.y;

        doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
        doc.text(resource.label, startX + 10, resourceY + 10, {
          width: colWidths.resource - 20,
        });

        for (const action of resource.actions) {
          const hasPermission = rolePermissions.includes(action.slug);

          let colIndex = -1;
          if (
            action.label.includes("Visualizar") ||
            action.slug.includes("read")
          )
            colIndex = 0;
          else if (
            action.label.includes("Criar") ||
            action.slug.includes("create")
          )
            colIndex = 1;
          else if (
            action.label.includes("Editar") ||
            action.slug.includes("update")
          )
            colIndex = 2;
          else if (
            action.label.includes("Excluir") ||
            action.slug.includes("delete")
          )
            colIndex = 3;
          else if (
            action.label.includes("Exportar") ||
            action.slug.includes("export")
          )
            colIndex = 4;

          if (colIndex !== -1) {
            const cbX =
              startX +
              colWidths.resource +
              colIndex * colWidths.action +
              colWidths.action / 2 -
              8;
            const cbY = resourceY + 8;

            doc
              .lineWidth(1)
              .strokeColor("#cbd5e1")
              .roundedRect(cbX, cbY, 16, 16, 3)
              .stroke();

            if (hasPermission) {
              doc
                .fillColor("#0f304f")
                .roundedRect(cbX + 2, cbY + 2, 12, 12, 2)
                .fill();
              doc
                .strokeColor("white")
                .lineWidth(1.5)
                .moveTo(cbX + 4, cbY + 8)
                .lineTo(cbX + 7, cbY + 11)
                .lineTo(cbX + 12, cbY + 5)
                .stroke();
            }
          }
        }

        doc.y = resourceY + 35;

        doc
          .strokeColor("#e2e8f0")
          .lineWidth(0.5)
          .moveTo(startX, doc.y)
          .lineTo(startX + contentWidth, doc.y)
          .stroke();
        doc.moveDown(0.5);
      }

      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        
        const oldMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc.fillColor("#64748b").fontSize(8).font("Helvetica");
        doc.text(`${i + 1}`, 40, doc.page.height - 30, {
          align: "right",
          width: doc.page.width - 80,
          lineBreak: false,
        });

        doc.page.margins.bottom = oldMargin;
      }

      doc.end();
    } catch (error) {
      next(error);
    }
  }
}
