import type { AuthUser } from "./auth.types";

const ACCESS_TOKEN_KEY = "qresto-access-token";
const REFRESH_TOKEN_KEY = "qresto-refresh-token";
const USER_KEY = "qresto-user";

const storage = sessionStorage;

const clearLegacyLocalSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const authStorage = {
    getAccessToken(): string | null {
        return storage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        return storage.getItem(REFRESH_TOKEN_KEY);
    },

    getUser(): AuthUser | null {
        const serializedUser = storage.getItem(USER_KEY);

        if (!serializedUser) {
            return null;
        }

        try {
            return JSON.parse(serializedUser) as AuthUser;
        } catch {
            storage.removeItem(USER_KEY);
            return null;
        }
    },

    setSession(payload: { accessToken: string; refreshToken: string; user: AuthUser }) {
        clearLegacyLocalSession();
        storage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
        storage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
        storage.setItem(USER_KEY, JSON.stringify(payload.user));
    },

    setTokens(payload: { accessToken: string; refreshToken: string }) {
        clearLegacyLocalSession();
        storage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
        storage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    },

    clearSession() {
        storage.removeItem(ACCESS_TOKEN_KEY);
        storage.removeItem(REFRESH_TOKEN_KEY);
        storage.removeItem(USER_KEY);
        clearLegacyLocalSession();
    },
};
