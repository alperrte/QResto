export type UserRole = "ADMIN" | "WAITER" | "KITCHEN";

export interface AuthUser {
    userId: number;
    role: UserRole;
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    role: UserRole;
}
