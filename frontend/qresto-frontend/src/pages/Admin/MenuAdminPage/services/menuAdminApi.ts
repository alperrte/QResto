import { menuApi } from "../../../menuPage/services/menuService";
import type { MenuCategoryDto, MenuItemListItemDto } from "../../../menuPage/types/menu.types";

/** menu-service `ProductCreateRequest` ile uyumlu gövde (JSON camelCase). */
export type MenuCategoryCreatePayload = {
    name: string;
};

export const createMenuCategoryApi = async (
    payload: MenuCategoryCreatePayload
): Promise<MenuCategoryDto> => {
    const { data } = await menuApi.post<MenuCategoryDto>("/categories", payload);
    return data;
};

const normalizeCategoryList = (payload: unknown): MenuCategoryDto[] => {
    if (Array.isArray(payload)) return payload as MenuCategoryDto[];
    if (!payload || typeof payload !== "object") return [];
    for (const key of ["categories", "data", "content"]) {
        const value = (payload as Record<string, unknown>)[key];
        if (Array.isArray(value)) return value as MenuCategoryDto[];
    }
    return [];
};

/** Yönetim: pasif kategoriler dahil. */
export const fetchAdminCategoriesAll = async (): Promise<MenuCategoryDto[]> => {
    const { data } = await menuApi.get<unknown>("/categories", { params: { onlyActive: false } });
    return normalizeCategoryList(data);
};

export type MenuCategoryUpdatePayload = {
    name: string;
    active: boolean;
};

export const updateMenuCategoryApi = async (
    id: number,
    payload: MenuCategoryUpdatePayload
): Promise<MenuCategoryDto> => {
    const { data } = await menuApi.put<MenuCategoryDto>(`/categories/${id}`, payload);
    return data;
};

export const patchCategoryActiveApi = async (id: number, value: boolean): Promise<void> => {
    await menuApi.patch(`/categories/${id}/active`, undefined, { params: { value } });
};

export const deleteMenuCategoryApi = async (id: number): Promise<void> => {
    await menuApi.delete(`/categories/${id}`);
};

export type MenuProductOptionChoicePayload = {
    label: string;
    priceDelta: number;
};

export type MenuProductOptionGroupPayload = {
    kind: "portion" | "single" | "multi";
    hasPrice: boolean;
    userTitle: string;
    metaTitle: string;
    descriptionLine?: string | null;
    required: boolean;
    maxSelect: number;
    includedInPreview: boolean;
    choices: MenuProductOptionChoicePayload[];
};

export type MenuProductCreatePayload = {
    /** Null: kategorisiz ürün. */
    categoryId: number | null;
    subCategoryId?: number | null;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    vatIncluded?: boolean | null;
    ingredients?: string | null;
    removableIngredients?: string | null;
    addableIngredients?: string | null;
    calorie?: number | null;
    gram?: number | null;
    prepTimeMin?: number | null;
    /** Gönderilmezse sunucu varsayılanı: aktif. */
    active?: boolean;
    /** Gönderilmezse sunucu varsayılanı: stokta. */
    inStock?: boolean;
    orderNoteEnabled?: boolean;
    orderNoteTitle?: string | null;
    optionGroups?: MenuProductOptionGroupPayload[];
};

export type MenuProductUpdatePayload = Omit<MenuProductCreatePayload, "categoryId"> & {
    /** Null: kategorisiz ürün (silinmiş kategori veya bilinçli olarak atanmamış). */
    categoryId: number | null;
    vatIncluded: boolean;
    active: boolean;
    inStock: boolean;
};

export const createMenuProductApi = async (
    payload: MenuProductCreatePayload
): Promise<MenuItemListItemDto> => {
    const { data } = await menuApi.post<MenuItemListItemDto>("/products", payload);
    return data;
};

export const updateMenuProductApi = async (
    id: number,
    payload: MenuProductUpdatePayload
): Promise<MenuItemListItemDto> => {
    const { data } = await menuApi.put<MenuItemListItemDto>(`/products/${id}`, payload);
    return data;
};

export const patchProductActiveApi = async (id: number, value: boolean): Promise<void> => {
    await menuApi.patch(`/products/${id}/active`, undefined, { params: { value } });
};

export const patchProductStockApi = async (id: number, value: boolean): Promise<void> => {
    await menuApi.patch(`/products/${id}/stock`, undefined, { params: { value } });
};

export const deleteMenuProductApi = async (id: number): Promise<void> => {
    // DELETE bazı ortamlarda 405 dönebiliyor; menu-service POST /{id}/delete ile aynı işlemi destekler.
    await menuApi.post(`/products/${id}/delete`);
};

/** Ürün görselini sunucuya kaydeder; dönen tam URL veritabanına yazılır (blob: değil). */
export const uploadMenuProductImageApi = async (file: File): Promise<string> => {
    const body = new FormData();
    body.append("file", file);
    const { data } = await menuApi.post<{ url: string }>("/product-images", body);
    const url = typeof data?.url === "string" ? data.url.trim() : "";
    if (!url) {
        throw new Error("Sunucu geçerli bir görsel adresi döndürmedi.");
    }
    return url;
};
