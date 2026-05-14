import { Router } from "express";
import { UserController } from "../controllers/user-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { createUserSchema, editUserSchema } from "../schemas/user-schema.js";

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authenticate);

userRoutes.get("/", userController.list);

userRoutes.get("/create", userController.createForGet);
userRoutes.post("/create", validate(createUserSchema), userController.createForPost);

userRoutes.get("/export", userController.exportListPDF);
userRoutes.get("/export/:name", userController.exportUserPDF);

userRoutes.get("/:name", userController.read);

userRoutes.get("/edit/:name", userController.updateForGet);
userRoutes.patch(
  "/edit/:name",
  validate(editUserSchema),
  userController.updateForPatch,
);

userRoutes.delete("/delete", userController.delete);

export { userRoutes };
