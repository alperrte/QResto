import axios from "axios";
import type { AddLineItemRequest, AddLineItemResponse, MenuItemDetailResponse } from "../types/menuDetail.types";

/**
 * Menü / sipariş API istemcisi. Ortam değişkeni yoksa yerel backend varsayımı.
 * `.env` örneği: VITE_MENU_SERVICE_URL=http://localhost:5000/api
 */
const resolveMenuBaseUrl = (): string => {
    const rawBaseUrl =
        import.meta.env.VITE_MENU_SERVICE_URL ??
        import.meta.env.VITE_API_URL ??
        "http://localhost:7073/api";
    const trimmed = String(rawBaseUrl).replace(/\/+$/, "");

    if (trimmed.endsWith("/api/menu")) return trimmed;
    if (trimmed.endsWith("/api")) return `${trimmed}/menu`;
    if (trimmed.endsWith("/menu")) return trimmed;
    return `${trimmed}/api/menu`;
};

const menuDetailApi = axios.create({
    baseURL: resolveMenuBaseUrl(),
});

export const fetchMenuItemDetail = async (itemId: string): Promise<MenuItemDetailResponse> => {
    const { data } = await menuDetailApi.get<MenuItemDetailResponse>(`/products/${encodeURIComponent(itemId)}`);
    return data;
};

export const postAddToCartLine = async (
    payload: AddLineItemRequest
): Promise<AddLineItemResponse> => {
    const { data } = await menuDetailApi.post<AddLineItemResponse>("/cart/lines", payload);
    return data;
};
