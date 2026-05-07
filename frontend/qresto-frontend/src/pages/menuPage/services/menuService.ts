import axios from "axios";
import type {
    MenuCatalogResponse,
    MenuCategoryDto,
    MenuItemListItemDto,
    MenuItemsPageResponse,
} from "../types/menu.types";

/**
 * Menü listesi API istemcisi. menuDetailService ile aynı ortam değişkenleri.
 * `.env` örneği: VITE_MENU_SERVICE_URL=http://localhost:5000/api
 */
const menuApi = axios.create({
    baseURL: import.meta.env.VITE_MENU_SERVICE_URL ?? import.meta.env.VITE_API_URL ?? "/api",
});

export const fetchMenuCatalog = async (
    restaurantId?: string
): Promise<MenuCatalogResponse> => {
    const params = restaurantId ? { restaurantId } : undefined;
    const { data } = await menuApi.get<MenuCatalogResponse>("/menu/catalog", { params });
    return data;
};

/** Katalog endpoint’i yoksa ürünler + kategoriler ayrı çağrılabilir. */
export const fetchMenuItems = async (
    restaurantId?: string
): Promise<MenuItemListItemDto[]> => {
    const params = restaurantId ? { restaurantId } : undefined;
    const { data } = await menuApi.get<MenuItemListItemDto[]>("/menu/items", { params });
    return data;
};

export const fetchMenuCategories = async (
    restaurantId?: string
): Promise<MenuCategoryDto[]> => {
    const params = restaurantId ? { restaurantId } : undefined;
    const { data } = await menuApi.get<MenuCategoryDto[]>("/menu/categories", { params });
    return data;
};

export const fetchMenuItemsPage = async (params?: {
    restaurantId?: string;
    page?: number;
    pageSize?: number;
    categoryId?: string;
}): Promise<MenuItemsPageResponse> => {
    const { data } = await menuApi.get<MenuItemsPageResponse>("/menu/items/page", { params });
    return data;
};
