import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis } from "./config/redis-client.js";
import { updatePermissions } from "./services/update-permissions.js";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";

const app = express();

const options = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
};

app.use(cors(options));
app.use(express.json());
app.use(cookieParser());

await connectRedis();
await updatePermissions();

app.use(routes);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Started at ${port}`));