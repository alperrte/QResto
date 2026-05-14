import axios from "axios";
import orderApi from "./orderService";
import type { OrderResponse } from "../types/cartTypes";

const kitchenApi = axios.create({
    baseURL: "http://localhost:7076/api",
});

kitchenApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getKitchenOrders = async (): Promise<OrderResponse[]> => {
    const [activeResponse, cancelledResponse] = await Promise.all([
        orderApi.get<OrderResponse[]>("/orders/admin/active"),
        orderApi.get<OrderResponse[]>("/orders/admin/cancelled"),
    ]);

    const byId = new Map<number, OrderResponse>();

    for (const order of activeResponse.data) {
        byId.set(order.id, order);
    }

    for (const order of cancelledResponse.data) {
        byId.set(order.id, order);
    }

    return [...byId.values()];
};

export const getKitchenCompletedOrders = async (): Promise<OrderResponse[]> => {
    const [completedResponse, todayResponse] = await Promise.all([
        orderApi.get<OrderResponse[]>("/orders/admin/completed"),
        orderApi.get<OrderResponse[]>("/orders/admin/today"),
    ]);

    const byId = new Map<number, OrderResponse>();

    for (const order of completedResponse.data) {
        byId.set(order.id, order);
    }

    for (const order of todayResponse.data) {
        if (order.status === "SERVED") {
            byId.set(order.id, order);
        }
    }

    return [...byId.values()];
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
