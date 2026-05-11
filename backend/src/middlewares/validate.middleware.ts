import { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { AppError } from "../errors/app-error.js";

export const validate = (schema: z.ZodTypeAny) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0].message;
        return next(new AppError(message, 400));
      }
      return next(error);
    }
  };