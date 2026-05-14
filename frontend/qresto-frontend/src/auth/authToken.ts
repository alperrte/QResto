import { refreshTokenRequest } from "./authService";
import { authStorage } from "./authStorage";

let refreshPromise: Promise<string | null> | null = null;

function getTokenExpMs(token: string | null) {
    if (!token) return 0;

    try {
        const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
        return payload.exp ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
}

export async function getValidAccessToken() {
    const token =
        authStorage.getAccessToken() ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const expMs = getTokenExpMs(token);
    const shouldRefresh = token && expMs > 0 && expMs - Date.now() < 90_000;

    if (!shouldRefresh) return token;

    if (!refreshPromise) {
        refreshPromise = refreshTokenRequest(authStorage.getRefreshToken() || "")
            .then((response) => {
                authStorage.setTokens(response);
                return response.accessToken;
            })
            .catch(() => token)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export async function getAuthHeader() {
    const token = await getValidAccessToken();

    return {
        Authorization: token ? `Bearer ${token}` : "",
    };
}
