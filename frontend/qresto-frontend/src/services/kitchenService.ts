import axios from "axios";

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

export const getKitchenOrders = async () => {
    const response = await kitchenApi.get("/kitchen/orders");
    return response.data;
};

export const getKitchenOrderById = async (orderId: number) => {
    const response = await kitchenApi.get(`/kitchen/orders/${orderId}`);
    return response.data;
};

export const updateKitchenOrderStatus = async (orderId: number, status: string) => {
    const response = await kitchenApi.patch(`/kitchen/orders/${orderId}/status`, {
        status,
    });

    return response.data;
};

export const cancelKitchenOrder = async (orderId: number, reason: string) => {
    const response = await kitchenApi.patch(`/kitchen/orders/${orderId}/cancel`, {
        reason,
    });

    return response.data;
};