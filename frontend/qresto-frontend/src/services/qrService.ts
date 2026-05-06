import axios from "axios";
import type {
    CreateRestaurantTableRequest,
    RestaurantTableResponse,
    TableQrCodeResponse,
} from "../types/qr.types";

const qrApi = axios.create({
    baseURL: import.meta.env.VITE_QR_SERVICE_URL || "http://localhost:7072/api",
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

export const generateQrCode = async (
    tableId: number
): Promise<TableQrCodeResponse> => {
    const response = await qrApi.post(`/qr-codes/table/${tableId}`);
    return response.data;
};

export const regenerateQrCode = async (
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

export const scanQr = async (qrToken: string, deviceToken: string) => {
    const response = await qrApi.post("/qr/scan", {
        qrToken,
        deviceToken,
    });

    return response.data;
};

export const activateTable = async (tableId: number): Promise<void> => {
    await qrApi.patch(`/tables/${tableId}/activate`);
};

export const deactivateTable = async (tableId: number): Promise<void> => {
    await qrApi.patch(`/tables/${tableId}/deactivate`);
};

