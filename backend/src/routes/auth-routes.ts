import { Router } from "express";
import { AuthController } from "../controllers/auth-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { verifyLoginAtempts } from "../middlewares/login-atempts-middleware.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.get("/me", authenticate, authController.me);
authRoutes.post("/login", verifyLoginAtempts, authController.login);
authRoutes.get("/logout", authController.logout);

export { authRoutes };
