import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import database from "./config/database.js";
import cookieParser from "cookie-parser";
import * as services from "./services/index.js";
import clientRedis, { connectRedis } from "./config/redis-client.js";
import { permissionJSON, updatePermissions } from "./utils/update-permissions.js";

const app = express();

const options = {
    origin: "http://localhost:5173",
    credentials: true
};

app.use(cors(options));
app.use(express.json());
app.use(cookieParser());

await connectRedis();
await updatePermissions();

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.sessionId;
        if (!token) {
            return res.status(403).json("Unauthorized");
        }

        const decodedUser = services.verifyToken(token);
        if (!decodedUser) {
            return res.status(403).json("Unauthorized");
        }

        const user = await database.user.findUnique({
            where: { name: decodedUser.name }
        });

        (req as any).user = user;
        next();
    } catch (error) {
        console.log("Erro no middleware de autenticação: ", error.message);
        return res.status(500).json("Internal Server Error");
    }
};

app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await database.user.findUnique({
            where: { name },
            select: {
                password: true,
                name: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!user || !await services.compareHash(password, user.password)) {
            return res.status(400).json("Invalid Credentials");
        }

        const maxAge = 3600000 * 24;
        const token = services.genToken({ name: user.name, role: user.role.name }, maxAge);

        res.cookie("sessionId", token, { maxAge, httpOnly: true, secure: true });
        res.status(200).json("Success");
    } catch (error) {
        console.log("Erro no login: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/users", authenticate, async (req, res) => {
    try {
        const users = await database.user.findMany({
            select: {
                name: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.status(200).json({ users });
    } catch (error) {
        console.log("Erro em buscar os usuários: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.post("/users", authenticate, async (req, res) => {
    try {
        const { name, role, password } = req.body;

        const hashPassword = await services.hashData(password);

        await database.$transaction(async (tx) => {
            const roleId = await tx.role.findUnique({
                where: { name: role },
                select: { id: true }
            });

            await tx.user.create({
                data: {
                    name,
                    password: hashPassword,
                    roleId: roleId.id
                }
            });
        });

        res.status(200).json("Success");
    } catch (error) {
        console.log("Erro em criar Usuário: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/roles", authenticate, async (req, res) => {
    const roles = await database.role.findMany({
        select: { name: true }
    });
    res.status(200).json({ roles });
})

app.post("/roles", authenticate, async (req, res) => {
    try {
        const { name } = req.body;

        await database.role.create({
            data: {
                name
            }
        });

        res.status(200).json("Success");
    } catch (error) {
        console.log("Erro em criar Cargo: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/roles/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const role = await database.role.findUnique({
            where: { name },
            select: { name: true }
        });

        const resources = await database.resource.findMany({
            select: { name: true, label: true }
        });

        const permissions = await clientRedis.get("permissions");
        const permissionsJson = JSON.parse(permissions.toString());

        const rolePermissions = permissionsJson[name] || [];
        
        res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
        console.log("Erro ao enviar cargo: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.post("/roles/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const { permissions } = req.body;

        const role = await database.role.findUnique({
            where: { name }
        });

        await database.rolePermissions.deleteMany({
            where: { roleId: role.id }
        });

        for (const permission of permissions) {
            const permissionId = await database.permission.findUnique({
                where: { slug: permission }
            });

            await database.rolePermissions.create({
                data: {
                    roleId: role.id,
                    permissionId: permissionId.id
                }
            });
        }

        await updatePermissions();
        
        res.status(200).json("Success");
    } catch (error) {
        console.log("Erro ao enviar cargo: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.listen(process.env.PORT, () => console.log(`Server Started at ${process.env.PORT}`))