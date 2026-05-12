export type AuthRole = "ADMIN" | "WAITER" | "KITCHEN";

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    role: AuthRole;
}

export interface AuthUser {
    userId: number;
    email: string;
    role: AuthRole;
}