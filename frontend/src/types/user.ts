export interface User {
    name: string,
    role: string,
    permissions: string[]
};

export interface UserMetadata {
    name: string,
    password?: string,
    role: string,
    created_at?: string,
    updated_at?: string
};