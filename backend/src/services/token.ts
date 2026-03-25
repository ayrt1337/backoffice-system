import { User } from "../types/user.js";
import jwt from "jsonwebtoken";

export const genToken = (user: Partial<User>, expiresIn: number): string => {
    const token = jwt.sign(
        user,
        process.env.SECRET_KEY,
        { expiresIn }
    );
    return token;
}

export const verifyToken = (token: string) => {
    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY) as { name: string, role: string };
        return verify;
    } catch {
        return;
    }
}

export const decodeToken = (token: string) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch {
        return;
    }
}