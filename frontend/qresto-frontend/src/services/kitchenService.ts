import axios from "axios";
import orderApi from "./orderService";
import { getValidAccessToken } from "../auth/authToken";

const kitchenApi = axios.create({
    baseURL: "http://localhost:7076/api",
});

kitchenApi.interceptors.request.use(async (config) => {
    const token = await getValidAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getKitchenOrders = async () => {
    const response = await orderApi.get("/orders/admin/today");
    return response.data;
};

export const getKitchenOrderById = async (orderId: number) => {
    const response = await kitchenApi.get(`/kitchen/orders/${orderId}`);
    return response.data;
};

export const updateKitchenOrderStatus = async (orderId: number, status: string) => {
    const response = await orderApi.patch(`/orders/${orderId}/status`, {
        status,
    });

    return response.data;
};

export const cancelKitchenOrder = async (orderId: number, reason: string) => {
    const response = await orderApi.patch(`/orders/${orderId}/cancel`, {
        cancelReason: reason,
    });

    return response.data;
};
