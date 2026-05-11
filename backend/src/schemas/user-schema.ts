import * as z from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, "O nome é obrigatório")
      .min(3, "O nome deve ter pelo menos 3 caracteres"),
    role: z.string()
      .min(1, "O cargo é obrigatório"),
    password: z.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
  })
});
