import axios from "axios";
import type { AuthResponse } from "./auth.types";

const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:7071/auth",
});

interface LoginPayload {
    email: string;
    password: string;
}

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await authApi.post("/login", payload);
    return response.data;
};

export const logoutRequest = async (refreshToken: string): Promise<void> => {
    await authApi.post("/logout", { refreshToken });
};
