import { createContext, useContext, useMemo, useState } from "react";
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

const decodeEmailFromJwt = (token: string): string => {
    try {
        const payloadPart = token.split(".")[1];

        if (!payloadPart) {
            return "";
        }

        const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = atob(normalized);
        const payload = JSON.parse(decodedPayload) as { sub?: string };
        return payload.sub ?? "";
    } catch (_error) {
        return "";
    }
};

const mapAuthResponseToUser = (response: AuthResponse): AuthUser => ({
    userId: response.userId,
    role: response.role,
    email: decodeEmailFromJwt(response.accessToken),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => authStorage.getUser());

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

        if (refreshToken) {
            try {
                await logoutRequest(refreshToken);
            } catch (_error) {
                // Session localde daima temizlenmeli.
            }
        }

        authStorage.clearSession();
        setUser(null);
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
