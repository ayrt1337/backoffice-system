export interface User {
    id: string,
    name: string,
    password: string,
    role: string
};

export interface UsersListQuery {
    name?: string,
    role?: string,
    created_at?: string,
    updated_at?: string,
    page: string
};