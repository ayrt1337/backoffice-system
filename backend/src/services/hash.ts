import bcrypt from "bcrypt";

export const hashData = (data: string) => {
    const salt = 10;
    return bcrypt.hash(data, salt);
}

export const compareHash = (data: string, hashData: string) => {
    return bcrypt.compare(data, hashData);
}