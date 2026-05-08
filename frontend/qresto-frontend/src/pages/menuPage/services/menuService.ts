import axios from "axios";
import type {
    MenuCategoryDto,
    MenuItemListItemDto,
} from "../types/menu.types";

/**
 * Menü listesi API istemcisi. menuDetailService ile aynı ortam değişkenleri.
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

const menuApi = axios.create({
    baseURL: resolveMenuBaseUrl(),
});

const normalizeArray = <T>(payload: unknown, keys: string[]): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== "object") return [];

    for (const key of keys) {
        const value = (payload as Record<string, unknown>)[key];
        if (Array.isArray(value)) return value as T[];
    }
    return [];
};

export const fetchMenuCatalog = async (
    restaurantId?: string
): Promise<{ categories: MenuCategoryDto[]; items: MenuItemListItemDto[] }> => {
    const [categories, items] = await Promise.all([
        fetchMenuCategories(restaurantId),
        fetchMenuItems(restaurantId),
    ]);
    return { categories, items };
};

/** Katalog endpoint’i yoksa ürünler + kategoriler ayrı çağrılabilir. */
export const fetchMenuItems = async (
    restaurantId?: string
): Promise<MenuItemListItemDto[]> => {
    const params = restaurantId
        ? { onlyActive: true, restaurantId }
        : { onlyActive: true };
    const { data } = await menuApi.get<unknown>("/products", { params });
    return normalizeArray<MenuItemListItemDto>(data, ["items", "data", "content"]);
};

export const fetchMenuCategories = async (
    restaurantId?: string
): Promise<MenuCategoryDto[]> => {
    const params = restaurantId
        ? { onlyActive: true, restaurantId }
        : { onlyActive: true };
    const { data } = await menuApi.get<unknown>("/categories", { params });
    return normalizeArray<MenuCategoryDto>(data, ["categories", "data", "items"]);
};
