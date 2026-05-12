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

export const menuApi = axios.create({
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
    restaurantId?: string,
    /** true: yönetim paneli gibi pasif ürünleri de getir (menu-service `onlyActive=false`). */
    includeInactiveProducts = false,
    /** true: yönetim paneli gibi pasif kategorileri de getir. */
    includeInactiveCategories = includeInactiveProducts
): Promise<{ categories: MenuCategoryDto[]; items: MenuItemListItemDto[] }> => {
    const categoriesOnlyActive = !includeInactiveCategories;
    const [categories, items] = await Promise.all([
        fetchMenuCategories(restaurantId, categoriesOnlyActive),
        fetchMenuItems(restaurantId, { onlyActive: !includeInactiveProducts }),
    ]);
    return { categories, items };
};

/** Katalog endpoint’i yoksa ürünler + kategoriler ayrı çağrılabilir. */
export const fetchMenuItems = async (
    restaurantId?: string,
    filters?: { onlyActive?: boolean }
): Promise<MenuItemListItemDto[]> => {
    const onlyActive = filters?.onlyActive ?? true;
    const params = restaurantId ? { onlyActive, restaurantId } : { onlyActive };
    const { data } = await menuApi.get<unknown>("/products", { params });
    return normalizeArray<MenuItemListItemDto>(data, ["items", "data", "content"]);
};

export const fetchMenuCategories = async (
    restaurantId?: string,
    onlyActive = true
): Promise<MenuCategoryDto[]> => {
    const params = restaurantId
        ? { onlyActive, restaurantId }
        : { onlyActive };
    const { data } = await menuApi.get<unknown>("/categories", { params });
    return normalizeArray<MenuCategoryDto>(data, ["categories", "data", "items"]);
};
