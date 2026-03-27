import { createClient } from "redis";
import "dotenv/config";

const clientRedis = createClient({
    url: process.env.REDIS_URL
});

export const connectRedis = async () => {
    await clientRedis.connect();
};

export default clientRedis;