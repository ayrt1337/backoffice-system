import * as z from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, "O nome é obrigatório")
      .min(3, "O nome deve ter pelo menos 3 caracteres")
  }),
});

export const editRoleSchema = z.object({
  body: z.object({
    roleName: z.string()
      .min(1, "O nome é obrigatório")
      .min(3, "O nome deve ter pelo menos 3 caracteres")
  }),
});
