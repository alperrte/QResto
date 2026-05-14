import axios from "axios";
import type {
    CreateRestaurantTableRequest,
    RestaurantTableResponse,
    TableQrCodeResponse,
    UpdateRestaurantTableRequest,
    TableSessionResponse,
} from "../types/qr.types";
import { getValidAccessToken } from "../auth/authToken";

const qrApi = axios.create({
    baseURL: import.meta.env.VITE_QR_SERVICE_URL || "http://localhost:7072/api",
});

qrApi.interceptors.request.use(async (config) => {
    const accessToken = await getValidAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export const getTables = async (): Promise<RestaurantTableResponse[]> => {
    const response = await qrApi.get("/tables");
    return response.data;
};

export const createTable = async (
    payload: CreateRestaurantTableRequest
): Promise<RestaurantTableResponse> => {
    const response = await qrApi.post("/tables", payload);
    return response.data;
};

export const updateTable = async (
    tableId: number,
    payload: UpdateRestaurantTableRequest
): Promise<RestaurantTableResponse> => {
    const response = await qrApi.put(`/tables/${tableId}`, payload);
    return response.data;
};

export const deleteTable = async (tableId: number): Promise<void> => {
    await qrApi.delete(`/tables/${tableId}`);
};

export const activateTable = async (tableId: number): Promise<void> => {
    await qrApi.patch(`/tables/${tableId}/activate`);
};

export const deactivateTable = async (tableId: number): Promise<void> => {
    await qrApi.patch(`/tables/${tableId}/deactivate`);
};

export const generateQrCode = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.post(`/qr-codes/table/${tableId}`);
    return response.data;
};

export const refreshTableSessions = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.post(`/qr-codes/table/${tableId}/regenerate`);
    return response.data;
};

export const getActiveQrCode = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.get(`/qr-codes/table/${tableId}/active`);
    return response.data;
};

export const activateQrCode = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.patch(`/qr-codes/table/${tableId}/activate`);
    return response.data;
};

export const deactivateQrCode = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.patch(`/qr-codes/table/${tableId}/deactivate`);
    return response.data;
};

export const scanQr = async (qrToken: string, deviceToken: string) => {
    const response = await qrApi.post("/qr/scan", {
        qrToken,
        deviceToken,
    });

    return response.data;
};

export const getActiveSessionByTable = async (
    tableId: number
): Promise<TableSessionResponse | null> => {
    try {
        const response = await qrApi.get(`/table-sessions/active/table/${tableId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 404)) {
            return null;
        }

        throw error;
    }
};

