import type { AuthUser } from "./auth.types";

const ACCESS_TOKEN_KEY = "qresto-access-token";
const REFRESH_TOKEN_KEY = "qresto-refresh-token";
const USER_KEY = "qresto-user";

export const authStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    getUser(): AuthUser | null {
        const serializedUser = localStorage.getItem(USER_KEY);

        if (!serializedUser) {
            return null;
        }

        try {
            return JSON.parse(serializedUser) as AuthUser;
        } catch (_error) {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    },

    setSession(payload: { accessToken: string; refreshToken: string; user: AuthUser }) {
        localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    },

    clearSession() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
