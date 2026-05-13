import axios from "axios";

import type {
    AddCartItemRequest,
    CartResponse,
    DemoPaymentRequest,
    OrderAdminProductSalesRowResponse,
    OrderAdminSummaryResponse,
    OrderAdminTopProductResponse,
    OrderResponse,
    UpdateCartItemQuantityRequest,
    TableSessionBillResponse,
} from "../types/cartTypes";

const ORDER_SERVICE_BASE_URL =
    import.meta.env.VITE_ORDER_SERVICE_URL ?? "http://localhost:7075/api/order";

const orderApi = axios.create({
    baseURL: ORDER_SERVICE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const demoPayment = async (
    orderId: number,
    guestSessionId: number
): Promise<OrderResponse> => {
    const body: DemoPaymentRequest = {
        guestSessionId,
    };

    const response = await orderApi.patch<OrderResponse>(
        `/orders/${orderId}/demo-payment`,
        body
    );

    return response.data;
};


export const createCart = async (
    tableSessionId: number,
    guestSessionId: number,
    tableId: number,
    tableName: string
): Promise<CartResponse> => {
    const response = await orderApi.post<CartResponse>("/cart", {
        tableSessionId,
        guestSessionId,
        tableId,
        tableName,
    });

    return response.data;
};

export const getCartById = async (cartId: number): Promise<CartResponse> => {
    const response = await orderApi.get<CartResponse>(`/cart/${cartId}`);

    return response.data;
};

export const getActiveCart = async (
    tableSessionId: number,
    guestSessionId: number
): Promise<CartResponse> => {
    const response = await orderApi.get<CartResponse>("/cart/active", {
        params: {
            tableSessionId,
            guestSessionId,
        },
    });

    return response.data;
};

export const addCartItem = async (
    cartId: number,
    item: AddCartItemRequest
): Promise<CartResponse> => {
    const response = await orderApi.post<CartResponse>(
        `/cart/${cartId}/items`,
        item
    );

    return response.data;
};

export const updateCartItemQuantity = async (
    cartId: number,
    itemId: number,
    quantity: number
): Promise<CartResponse> => {
    const body: UpdateCartItemQuantityRequest = {
        quantity,
    };

    const response = await orderApi.patch<CartResponse>(
        `/cart/${cartId}/items/${itemId}/quantity`,
        body
    );

    return response.data;
};

export const removeCartItem = async (
    cartId: number,
    itemId: number
): Promise<CartResponse> => {
    const response = await orderApi.delete<CartResponse>(
        `/cart/${cartId}/items/${itemId}`
    );

    return response.data;
};

export const clearCart = async (cartId: number): Promise<CartResponse> => {
    const response = await orderApi.delete<CartResponse>(`/cart/${cartId}/clear`);

    return response.data;
};

export const createOrderFromCart = async (
    cartId: number
): Promise<OrderResponse> => {
    const response = await orderApi.post<OrderResponse>(
        `/orders/from-cart/${cartId}`
    );

    return response.data;
};

export const getOrdersByTableSession = async (
    tableSessionId: number
): Promise<OrderResponse[]> => {
    const response = await orderApi.get<OrderResponse[]>(
        `/orders/table-session/${tableSessionId}`,
        { params: { _t: Date.now() } }
    );

    return response.data;
};

export const getAdminOrderSummary = async (): Promise<OrderAdminSummaryResponse> => {
    const response = await orderApi.get<OrderAdminSummaryResponse>("/orders/admin/summary");

    return response.data;
};

export const getAdminTopProductsToday = async (
    limit = 8
): Promise<OrderAdminTopProductResponse[]> => {
    const response = await orderApi.get<OrderAdminTopProductResponse[]>(
        "/orders/admin/top-products-today",
        { params: { limit } }
    );

    return response.data;
};

export const getAdminProductSalesToday = async (
    limit = 50
): Promise<OrderAdminProductSalesRowResponse[]> => {
    const response = await orderApi.get<OrderAdminProductSalesRowResponse[]>(
        "/orders/admin/product-sales-today",
        { params: { limit } }
    );

    return response.data;
};

export const getAdminActiveOrders = async (): Promise<OrderResponse[]> => {
    const response = await orderApi.get<OrderResponse[]>("/orders/admin/active");

    return response.data;
};

export const getAdminCompletedOrders = async (): Promise<OrderResponse[]> => {
    const response = await orderApi.get<OrderResponse[]>("/orders/admin/completed");

    return response.data;
};

export const getAdminCancelledOrders = async (): Promise<OrderResponse[]> => {
    const response = await orderApi.get<OrderResponse[]>("/orders/admin/cancelled");

    return response.data;
};

export const getAdminTodayOrders = async (): Promise<OrderResponse[]> => {
    const response = await orderApi.get<OrderResponse[]>("/orders/admin/today");

    return response.data;
};

export const getOrderById = async (orderId: number): Promise<OrderResponse> => {
    const response = await orderApi.get<OrderResponse>(`/orders/${orderId}`);

    return response.data;
};

export const getTableSessionBill = async (
    tableSessionId: number
): Promise<TableSessionBillResponse> => {
    const response = await orderApi.get<TableSessionBillResponse>(
        `/orders/table-session/${tableSessionId}/bill`
    );

    return response.data;
};

export const markTableSessionOrdersPaid = async (
    tableSessionId: number
): Promise<OrderResponse[]> => {
    const response = await orderApi.patch<OrderResponse[]>(
        `/orders/table-session/${tableSessionId}/mark-paid`
    );

    return response.data;
};

export default orderApi;