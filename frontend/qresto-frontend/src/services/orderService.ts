import axios from "axios";

import type {
    AddCartItemRequest,
    CartResponse,
    OrderResponse,
    UpdateCartItemQuantityRequest,
} from "../types/cartTypes";

const ORDER_SERVICE_BASE_URL =
    import.meta.env.VITE_ORDER_SERVICE_URL ?? "http://localhost:7075/api/order";

const orderApi = axios.create({
    baseURL: ORDER_SERVICE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

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

export default orderApi;