import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authStorage } from "./authStorage";
import { loginRequest, logoutRequest } from "./authService";
import type { AuthResponse, AuthUser } from "./auth.types";

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapAuthResponseToUser = (response: AuthResponse): AuthUser => ({
    userId: response.userId,
    role: response.role,
    email: response.email,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        return authStorage.getUser();
    });

    const login = async (email: string, password: string) => {
        const response = await loginRequest({
            email: email.trim().toLowerCase(),
            password,
        });

        const nextUser = mapAuthResponseToUser(response);

        authStorage.setSession({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: nextUser,
        });

        setUser(nextUser);

        return nextUser;
    };

    const logout = async () => {
        const refreshToken = authStorage.getRefreshToken();

        try {
            if (refreshToken) {
                await logoutRequest(refreshToken);
            }
        } catch {
            // Backend logout patlasa bile local session kesin temizlenmeli.
        } finally {
            authStorage.clearSession();
            setUser(null);
            window.location.href = "/login";
        }
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login,
            logout,
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};